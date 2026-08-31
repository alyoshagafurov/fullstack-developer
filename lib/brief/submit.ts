/*
 * The submission boundary.
 *
 * The only place the brief leaves the client. The result is a discriminated
 * union so the UI can tell the failure modes apart — a field the visitor must
 * fix, a backend that is not configured, too many attempts, and the network
 * falling over — instead of one vague "something went wrong".
 *
 * `ok` is returned ONLY when the server confirms storage AND hands back a
 * well-formed reference. There is no client-side success path, so the
 * confirmation screen can never claim a brief was saved when it was not.
 */

import { BriefSubmission, REFERENCE_PATTERN } from './schema';

export type BriefSubmitResult =
  /** Stored. `reference` is server-issued and safe to show. */
  | { status: 'ok'; reference: string; duplicate?: boolean }
  /** The server rejected specific fields — map them back onto the steps. */
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  /** Reached the server, but storage is not configured or is down. */
  | { status: 'unavailable'; code: string }
  /** Too many attempts from this client. */
  | { status: 'rateLimited'; retryAfter: number }
  /** Offline, timed out, or the server failed. Retrying is reasonable. */
  | { status: 'error'; code: string };

export const BRIEF_ENDPOINT = '/api/brief';

const TIMEOUT_MS = 15000;

/** Stable per completed brief; a retry must reuse it to stay idempotent. */
export function newSubmissionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function submitBrief(
  submission: BriefSubmission,
  opts: { signal?: AbortSignal } = {},
): Promise<BriefSubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  opts.signal?.addEventListener('abort', () => controller.abort(), { once: true });

  let res: Response;
  try {
    res = await fetch(BRIEF_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': submission.submissionId,
      },
      body: JSON.stringify(submission),
      signal: controller.signal,
    });
  } catch {
    // Offline, DNS, timeout — nothing reached the server.
    return { status: 'error', code: 'network' };
  } finally {
    clearTimeout(timer);
  }

  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;

  if (res.status === 422 || res.status === 400) {
    if (body && typeof body.fieldErrors === 'object' && body.fieldErrors) {
      return { status: 'invalid', fieldErrors: body.fieldErrors as Record<string, string> };
    }
    return { status: 'error', code: String(body?.error ?? 'bad_request') };
  }

  if (res.status === 429) {
    const header = Number(res.headers.get('Retry-After') ?? 0);
    return { status: 'rateLimited', retryAfter: Number.isFinite(header) ? header : 0 };
  }

  // 501 = storage not configured, 503 = configured but unreachable.
  if (res.status === 501 || res.status === 503) {
    return { status: 'unavailable', code: String(body?.error ?? 'unavailable') };
  }

  if (res.ok && body?.ok === true) {
    const reference = String(body.reference ?? '');
    // A success without a real reference is not a success.
    if (!REFERENCE_PATTERN.test(reference)) {
      return { status: 'error', code: 'bad_reference' };
    }
    return { status: 'ok', reference, duplicate: body.duplicate === true };
  }

  return { status: 'error', code: String(body?.error ?? `http_${res.status}`) };
}

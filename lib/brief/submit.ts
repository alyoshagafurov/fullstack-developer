/*
 * The submission boundary.
 *
 * This is the ONLY place the brief leaves the client, and the only thing Phase 8
 * has to satisfy: keep this contract and the whole wizard keeps working.
 *
 * The result is a discriminated union so the UI can tell the three failure
 * modes apart — a field the visitor must fix, a backend that is not wired up
 * yet, and the network/server falling over — instead of showing one vague
 * "something went wrong".
 *
 * `ok` is returned ONLY when the server confirms storage AND hands back a
 * well-formed reference id. There is no client-side success path: until the
 * Phase 8 backend exists, a submit can never report success.
 */

import { BriefSubmission, REFERENCE_PATTERN } from './schema';

export type BriefSubmitResult =
  /** Stored. `reference` is server-issued and safe to show the visitor. */
  | { status: 'ok'; reference: string }
  /** The server rejected specific fields — map them back onto the steps. */
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  /** Reached the server, but persistence is not configured yet (Phase 8). */
  | { status: 'unavailable'; code: string }
  /** Offline, timed out, or the server failed. Retrying is reasonable. */
  | { status: 'error'; code: string };

export const BRIEF_ENDPOINT = '/api/brief';

const TIMEOUT_MS = 15000;

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
      signal: controller.signal,
    });
  } catch {
    // Offline, DNS, CORS, timeout — nothing reached the server.
    return { status: 'error', code: 'network' };
  } finally {
    clearTimeout(timer);
  }

  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;

  if (res.status === 422 && body && typeof body.fieldErrors === 'object') {
    return { status: 'invalid', fieldErrors: (body.fieldErrors || {}) as Record<string, string> };
  }

  // 501 today (no persistence), 503 if Phase 8 storage is temporarily down.
  if (res.status === 501 || res.status === 503) {
    return { status: 'unavailable', code: String(body?.error ?? 'unavailable') };
  }

  if (res.ok && body?.ok === true) {
    const reference = String(body.reference ?? '');
    // A success without a real reference is not a success.
    if (!REFERENCE_PATTERN.test(reference)) {
      return { status: 'error', code: 'bad_reference' };
    }
    return { status: 'ok', reference };
  }

  return { status: 'error', code: String(body?.error ?? `http_${res.status}`) };
}

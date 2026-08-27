import { NextResponse } from 'next/server';
import {
  BriefData, LIMITS,
  PROJECT_TYPES, NEEDS, FEATURES, BUDGETS, TIMELINES, SOURCES,
} from '@/lib/brief/schema';

/*
 * Project Brief endpoint — the server side of the submission boundary.
 *
 * WHAT THIS DOES TODAY (Phase 7): parses the payload and validates it at the
 * boundary, independently of the client. Nothing is stored, so it answers
 * 501 `backend_not_configured`. That is deliberate — a brief that is not
 * persisted must never be reported to the visitor as received.
 *
 * WHAT PHASE 8 ADDS: persist `parsed` (a clean, typed BriefData plus server
 * receivedAt), issue a reference with `makeReference()`, and return
 * 201 { ok: true, reference }. Notification (Telegram) is a later, separate
 * concern and must not gate this response.
 *
 * The validation below intentionally duplicates lib/brief/validate.ts. The
 * client copy is for UX; this copy is the one that actually protects the
 * system, and it must keep working if the client is bypassed entirely.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldErrors = Record<string, string>;

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const pick = <T extends readonly string[]>(list: T, v: unknown): T[number] | '' =>
  typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T[number]) : '';

const pickMany = <T extends readonly string[]>(list: T, v: unknown): T[number][] =>
  Array.isArray(v)
    ? Array.from(new Set(v.filter((x): x is T[number] =>
        typeof x === 'string' && (list as readonly string[]).includes(x)))).slice(0, list.length)
    : [];

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const body = (raw?.data ?? {}) as Record<string, unknown>;

  // Honeypot: pretend nothing happened, but never claim success.
  if (typeof raw?.hp === 'string' && raw.hp.length > 0) {
    return NextResponse.json({ ok: false, error: 'rejected' }, { status: 202 });
  }

  const parsed: BriefData = {
    projectType: pick(PROJECT_TYPES, body.projectType),
    projectTypeOther: str(body.projectTypeOther, LIMITS.projectTypeOther),
    projectName: str(body.projectName, LIMITS.projectName),
    description: str(body.description, LIMITS.description.max),
    problem: str(body.problem, LIMITS.problem),
    needs: pickMany(NEEDS, body.needs),
    features: pickMany(FEATURES, body.features),
    featuresOther: str(body.featuresOther, LIMITS.featuresOther),
    existingUrl: str(body.existingUrl, LIMITS.url),
    referenceUrls: str(body.referenceUrls, LIMITS.url),
    budget: pick(BUDGETS, body.budget),
    timeline: pick(TIMELINES, body.timeline),
    name: str(body.name, LIMITS.name.max),
    email: str(body.email, LIMITS.email),
    messenger: str(body.messenger, LIMITS.messenger),
    source: pick(SOURCES, body.source),
    notes: str(body.notes, LIMITS.notes),
    consent: body.consent === true,
  };

  const fieldErrors: FieldErrors = {};
  if (!parsed.projectType) fieldErrors.projectType = 'pickOne';
  if (parsed.projectType === 'other' && !parsed.projectTypeOther) fieldErrors.projectTypeOther = 'required';
  if (!parsed.description) fieldErrors.description = 'required';
  else if (parsed.description.length < LIMITS.description.min) fieldErrors.description = 'tooShort';
  if (!parsed.budget) fieldErrors.budget = 'pickOne';
  if (!parsed.timeline) fieldErrors.timeline = 'pickOne';
  if (!parsed.name) fieldErrors.name = 'required';
  else if (parsed.name.length < LIMITS.name.min) fieldErrors.name = 'tooShort';
  if (!parsed.email) fieldErrors.email = 'required';
  else if (!EMAIL.test(parsed.email)) fieldErrors.email = 'email';
  if (!parsed.consent) fieldErrors.consent = 'consent';

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ ok: false, error: 'validation', fieldErrors }, { status: 422 });
  }

  /* ── Phase 8 seam ────────────────────────────────────────────────────────
   * import { makeReference } from '@/lib/brief/reference';
   * const reference = makeReference();
   * await storeBrief({ ...parsed, reference, receivedAt: new Date().toISOString(),
   *                    locale: str((raw.meta as Record<string, unknown>)?.locale, 8) });
   * return NextResponse.json({ ok: true, reference }, { status: 201 });
   *
   * Until that exists, say so plainly. The client renders this as
   * "not accepting briefs yet", never as a delivered request.
   */
  return NextResponse.json(
    { ok: false, error: 'backend_not_configured' },
    { status: 501 },
  );
}

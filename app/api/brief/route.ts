import { NextResponse } from 'next/server';
import {
  ProjectBrief, LIMITS,
  PROJECT_TYPES, BUDGETS, TIMELINES,
} from '@/lib/brief/schema';

/*
 * Project Brief endpoint — the server side of the submission boundary.
 *
 * TODAY (P5): parses the payload and validates it at the boundary,
 * independently of the client. Nothing is stored, so it answers
 * 501 `backend_not_configured`. That is deliberate — a brief that is not
 * persisted must never be reported to the visitor as received.
 *
 * PHASE 6 ADDS: persist `parsed` plus a server receivedAt, issue a reference
 * with makeReference(), and return 201 { ok: true, reference }. Notification
 * (Telegram) is a later, separate concern and must not gate this response.
 *
 * The validation below intentionally duplicates lib/brief/validate.ts. The
 * client copy is for UX; this copy protects the system and must keep working
 * if the client is bypassed entirely.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldErrors = Record<string, string>;

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const pick = <T extends readonly string[]>(list: T, v: unknown): T[number] | '' =>
  typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T[number]) : '';

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const body = (raw?.data ?? {}) as Record<string, unknown>;

  // Honeypot: accept quietly, but never claim success.
  if (typeof raw?.hp === 'string' && raw.hp.length > 0) {
    return NextResponse.json({ ok: false, error: 'rejected' }, { status: 202 });
  }

  const parsed: ProjectBrief = {
    projectType: pick(PROJECT_TYPES, body.projectType),
    projectTypeOther: str(body.projectTypeOther, LIMITS.projectTypeOther),
    goal: str(body.goal, LIMITS.goal.max),
    description: str(body.description, LIMITS.description.max),
    functionality: str(body.functionality, LIMITS.functionality),
    existingUrl: str(body.existingUrl, LIMITS.url),
    referenceLinks: str(body.referenceLinks, LIMITS.links),
    notes: str(body.notes, LIMITS.notes),
    budget: pick(BUDGETS, body.budget),
    timeline: pick(TIMELINES, body.timeline),
    name: str(body.name, LIMITS.name.max),
    company: str(body.company, LIMITS.company),
    email: str(body.email, LIMITS.email),
    telegram: str(body.telegram, LIMITS.handle),
    whatsapp: str(body.whatsapp, LIMITS.handle),
    consent: body.consent === true,
  };

  const fieldErrors: FieldErrors = {};
  if (!parsed.projectType) fieldErrors.projectType = 'pickOne';
  if (parsed.projectType === 'other' && !parsed.projectTypeOther) fieldErrors.projectTypeOther = 'required';
  if (!parsed.goal) fieldErrors.goal = 'required';
  else if (parsed.goal.length < LIMITS.goal.min) fieldErrors.goal = 'tooShort';
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

  /* ── Phase 6 seam ────────────────────────────────────────────────────────
   * import { makeReference } from '@/lib/brief/reference';
   * const reference = makeReference();
   * await storeBrief({ ...parsed, reference, receivedAt: new Date().toISOString(),
   *                    locale: str((raw.meta as Record<string, unknown>)?.locale, 8) });
   * return NextResponse.json({ ok: true, reference }, { status: 201 });
   *
   * Until that exists, say so plainly. The client renders this as "not
   * accepting briefs through the site yet", never as a delivered request.
   */
  return NextResponse.json(
    { ok: false, error: 'backend_not_configured' },
    { status: 501 },
  );
}

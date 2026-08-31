import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { checkRateLimit, clientKey } from '@/lib/rate-limit';
import { makeReference } from '@/lib/brief/reference';
import {
  ProjectBrief, LIMITS,
  PROJECT_TYPES, BUDGETS, TIMELINES,
} from '@/lib/brief/schema';

/*
 * Project Brief endpoint.
 *
 * The boundary. Everything arriving here is treated as hostile: the payload is
 * size-capped before parsing, every field is re-validated independently of the
 * client, enums are matched against the real allow-lists, and only whitelisted
 * columns reach the database. lib/brief/validate.ts exists for UX; this file
 * is what actually protects the system, and it must hold if the client is
 * bypassed entirely.
 *
 * Idempotency: the client sends a submissionId (also as Idempotency-Key), and
 * the column is unique. A double click or a network retry therefore resolves
 * to the lead that already exists and returns its original reference, rather
 * than creating a second one.
 *
 * Nothing internal leaves this file: no Prisma messages, no stack traces, no
 * row objects. The response carries a reference and nothing else.
 */

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 32 * 1024; // a brief is a few KB; 32 KB is generous
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldErrors = Record<string, string>;

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const pick = <T extends readonly string[]>(list: T, v: unknown): T[number] | '' =>
  typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T[number]) : '';

function looksLikeUrl(value: string): boolean {
  if (!value) return true;
  return /^[^\s/.]+\.[^\s/.]{2,}/.test(value.replace(/^https?:\/\//i, ''));
}

function eachLinkValid(value: string): boolean {
  return value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).every(looksLikeUrl);
}

/** ISO-8601 in, Date out. Rejects nonsense rather than storing epoch 0. */
function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: Request) {
  /* 1 — content type */
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'unsupported_media_type' }, { status: 415 });
  }

  /* 2 — size cap, before parsing anything */
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }
  const rawText = await req.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  /* 3 — parse */
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  /* 4 — honeypot. Never stored; answered as accepted so bots learn nothing. */
  if (typeof raw.hp === 'string' && raw.hp.length > 0) {
    return NextResponse.json({ ok: false, error: 'rejected' }, { status: 202 });
  }

  /* 5 — rate limit (see lib/rate-limit for the per-instance caveat) */
  const limited = checkRateLimit(clientKey(req));
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  /* 6 — normalise into exactly the fields we accept */
  const body = (raw.data ?? {}) as Record<string, unknown>;
  const meta = (raw.meta ?? {}) as Record<string, unknown>;

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

  /* 7 — validate */
  const fieldErrors: FieldErrors = {};
  if (!parsed.projectType) fieldErrors.projectType = 'pickOne';
  if (parsed.projectType === 'other' && !parsed.projectTypeOther) fieldErrors.projectTypeOther = 'required';
  if (!parsed.goal) fieldErrors.goal = 'required';
  else if (parsed.goal.length < LIMITS.goal.min) fieldErrors.goal = 'tooShort';
  if (!parsed.description) fieldErrors.description = 'required';
  else if (parsed.description.length < LIMITS.description.min) fieldErrors.description = 'tooShort';
  if (!looksLikeUrl(parsed.existingUrl)) fieldErrors.existingUrl = 'url';
  if (!eachLinkValid(parsed.referenceLinks)) fieldErrors.referenceLinks = 'url';
  if (!parsed.budget) fieldErrors.budget = 'pickOne';
  if (!parsed.timeline) fieldErrors.timeline = 'pickOne';
  if (!parsed.name) fieldErrors.name = 'required';
  else if (parsed.name.length < LIMITS.name.min) fieldErrors.name = 'tooShort';
  if (!parsed.email) fieldErrors.email = 'required';
  else if (!EMAIL.test(parsed.email)) fieldErrors.email = 'email';
  if (!parsed.consent) fieldErrors.consent = 'consent';

  const submissionId =
    str(raw.submissionId, 100) || str(req.headers.get('idempotency-key'), 100);
  if (!submissionId) fieldErrors.submissionId = 'required';

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ ok: false, error: 'validation', fieldErrors }, { status: 422 });
  }

  /* 8 — storage */
  const prisma = getPrisma();
  if (!prisma) {
    // No DATABASE_URL. Say so plainly; never pretend the brief was received.
    return NextResponse.json(
      { ok: false, error: 'backend_not_configured' },
      { status: 501 },
    );
  }

  const startedAt = parseDate(meta.startedAt) ?? new Date();
  const completedAt = parseDate(meta.completedAt) ?? new Date();
  const locale = str(meta.locale, 8) || 'ru';

  const columns = {
    submissionId,
    ...parsed,
    locale,
    startedAt,
    completedAt,
  };

  try {
    const lead = await prisma.projectLead.create({
      data: { reference: makeReference(), ...columns },
      select: { reference: true },
    });
    return NextResponse.json({ ok: true, reference: lead.reference }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = (e.meta?.target as string[] | undefined) ?? [];

      // Same submission arriving twice — return the original reference.
      if (target.includes('submissionId')) {
        const existing = await prisma.projectLead
          .findUnique({ where: { submissionId }, select: { reference: true } })
          .catch(() => null);
        if (existing) {
          return NextResponse.json(
            { ok: true, reference: existing.reference, duplicate: true },
            { status: 200 },
          );
        }
      }

      // Reference collision — astronomically unlikely, but retry once.
      if (target.includes('reference')) {
        try {
          const retry = await prisma.projectLead.create({
            data: { reference: makeReference(), ...columns },
            select: { reference: true },
          });
          return NextResponse.json({ ok: true, reference: retry.reference }, { status: 201 });
        } catch {
          /* fall through to the generic failure below */
        }
      }
    }

    // Anything else: the client learns that storage failed, and nothing more.
    console.error('[brief] storage failure', {
      code: e instanceof Prisma.PrismaClientKnownRequestError ? e.code : 'unknown',
    });
    return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });
  }
}

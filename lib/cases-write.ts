/*
 * Case studies — the write side.
 *
 * SERVER ONLY, and behind `requireAdmin()` in every route that calls it.
 *
 * Normalisation lives here rather than in the routes because POST and PATCH
 * must agree on it exactly. If the two disagreed, a field could be validated
 * on create and not on edit — which is the same as not validating it, since
 * anything can be created empty and then edited.
 *
 * Everything is trimmed and length-capped rather than rejected. An owner
 * pasting a long description should get a saved case, not a form error they
 * have to negotiate with.
 */

import { slugify } from '@/lib/cases';
import { getPrisma } from '@/lib/prisma';

const LIMITS = {
  title: 120,
  summary: 240,
  description: 20_000,
  liveUrl: 500,
  year: 12,
  slug: 60,
  tech: 40,
  techCount: 24,
  screenshots: 24,
} as const;

export interface CaseInput {
  title: string;
  slug: string;
  summary: string;
  description: string;
  technologies: string[];
  liveUrl: string;
  screenshots: string[];
  year: string;
  published: boolean;
  position: number;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Only http(s), and only an absolute URL.
 *
 * A relative value here would be written into an anchor on a public page, and
 * `javascript:` in an href is a scripting hole — so the scheme is checked
 * against an allow-list rather than merely searched for a bad prefix.
 */
function safeUrl(value: unknown): string {
  const raw = text(value, LIMITS.liveUrl);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function list(value: unknown, max: number, itemMax: number): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const entry of value) {
    const item = text(entry, itemMax);
    if (item) seen.add(item);
    if (seen.size >= max) break;
  }
  return [...seen];
}

/** Screenshots are URLs we issued; they get the same scheme check as liveUrl. */
function urlList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    const url = safeUrl(entry);
    if (url && !out.includes(url)) out.push(url);
    if (out.length >= max) break;
  }
  return out;
}

/* String discriminants, for the reason spelled out in admin-api/guard.ts:
   tsconfig sets `strict: false`, and boolean-literal unions do not narrow. */
export type ParseResult =
  | { status: 'ok'; value: CaseInput }
  | { status: 'invalid'; fieldErrors: Record<string, string> };

export function parseCaseInput(body: unknown): ParseResult {
  const raw = (body ?? {}) as Record<string, unknown>;

  const title = text(raw.title, LIMITS.title);
  // A slug the owner did not supply is derived from the title, so publishing
  // never blocks on a field nobody wants to think about.
  const slug = slugify(text(raw.slug, LIMITS.slug) || title);

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'required';
  if (!slug) fieldErrors.slug = 'required';
  if (Object.keys(fieldErrors).length > 0) return { status: 'invalid', fieldErrors };

  const position = Number(raw.position);

  return {
    status: 'ok',
    value: {
      title,
      slug,
      summary: text(raw.summary, LIMITS.summary),
      description: text(raw.description, LIMITS.description),
      technologies: list(raw.technologies, LIMITS.techCount, LIMITS.tech),
      liveUrl: safeUrl(raw.liveUrl),
      screenshots: urlList(raw.screenshots, LIMITS.screenshots),
      year: text(raw.year, LIMITS.year),
      published: raw.published === true,
      position: Number.isFinite(position) ? Math.trunc(position) : 0,
    },
  };
}

export type WriteResult =
  | { status: 'ok'; id: string; slug: string }
  | { status: 'failed'; code: number; error: string };

/** Prisma's error codes: unique violation, and no-such-row. */
const UNIQUE_VIOLATION = 'P2002';
const NOT_FOUND = 'P2025';

function codeOf(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null
    ? (error as { code?: string }).code
    : undefined;
}

export async function createCase(input: CaseInput): Promise<WriteResult> {
  const prisma = getPrisma();
  if (!prisma) return { status: 'failed', code: 503, error: 'storage_unavailable' };
  try {
    const row = await prisma.project.create({ data: input });
    return { status: 'ok', id: row.id, slug: row.slug };
  } catch (error) {
    if (codeOf(error) === UNIQUE_VIOLATION) return { status: 'failed', code: 409, error: 'slug_taken' };
    return { status: 'failed', code: 503, error: 'storage_unavailable' };
  }
}

export async function updateCase(id: string, input: CaseInput): Promise<WriteResult> {
  const prisma = getPrisma();
  if (!prisma) return { status: 'failed', code: 503, error: 'storage_unavailable' };
  try {
    const row = await prisma.project.update({ where: { id }, data: input });
    return { status: 'ok', id: row.id, slug: row.slug };
  } catch (error) {
    const code = codeOf(error);
    if (code === UNIQUE_VIOLATION) return { status: 'failed', code: 409, error: 'slug_taken' };
    if (code === NOT_FOUND) return { status: 'failed', code: 404, error: 'not_found' };
    return { status: 'failed', code: 503, error: 'storage_unavailable' };
  }
}

export async function deleteCase(id: string): Promise<WriteResult> {
  const prisma = getPrisma();
  if (!prisma) return { status: 'failed', code: 503, error: 'storage_unavailable' };
  try {
    const row = await prisma.project.delete({ where: { id } });
    return { status: 'ok', id: row.id, slug: row.slug };
  } catch (error) {
    if (codeOf(error) === NOT_FOUND) return { status: 'failed', code: 404, error: 'not_found' };
    return { status: 'failed', code: 503, error: 'storage_unavailable' };
  }
}

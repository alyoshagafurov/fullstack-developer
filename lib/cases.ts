/*
 * Case studies — the read side.
 *
 * SERVER ONLY. It touches Prisma, so nothing here may be imported from a
 * client component; the pages that use it are server components and pass
 * plain objects down.
 *
 * Two audiences, and the split is the point:
 *
 *   listPublishedCases / getPublishedCase   the public /work pages
 *   listAllCases / getCase                  the admin, behind its own gate
 *
 * The public functions filter on `published` inside the query rather than in
 * the caller. A draft that leaks is a draft published by accident, and the way
 * to make that impossible is to never load one on a public path at all.
 *
 * When DATABASE_URL is absent `getPrisma()` returns null and these return
 * empty rather than throwing — the same posture as /api/brief answering 501.
 * A /work page that says "no cases yet" is recoverable; one that renders a
 * stack trace is not.
 */

import { getPrisma } from '@/lib/prisma';

/** A card in the register. No description, no screenshot list — just enough. */
export interface CaseRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  technologies: string[];
  liveUrl: string;
  year: string;
  /** First screenshot, or '' when the case has none yet. */
  cover: string;
  /** ISO-8601. The register never renders it; the sitemap needs it. */
  updatedAt: string;
}

/** The whole record. */
export interface CaseDetail extends CaseRow {
  description: string;
  screenshots: string[];
  published: boolean;
  position: number;
  createdAt: string;
}

/* Prisma hands back Date objects and a screenshots array; the pages want ISO
   strings and a cover. Mapping here stops every caller repeating it. */
type Row = {
  id: string; slug: string; title: string; summary: string; description: string;
  technologies: string[]; liveUrl: string; screenshots: string[]; year: string;
  published: boolean; position: number; createdAt: Date; updatedAt: Date;
};

function toDetail(row: Row): CaseDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    technologies: row.technologies,
    liveUrl: row.liveUrl,
    screenshots: row.screenshots,
    cover: row.screenshots[0] ?? '',
    year: row.year,
    published: row.published,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Manual order first, then newest — the same ordering the admin shows. */
const ORDER = [{ position: 'asc' as const }, { createdAt: 'desc' as const }];

/**
 * Run a read, and treat any database failure as "no cases".
 *
 * The specific failure this exists for is a real one: the Project table is
 * created by a migration that has not been applied yet, so until someone runs
 * it every query here raises "relation Project does not exist". Without this,
 * /work would answer 500 — the page would be broken by a table that is simply
 * not there yet, rather than being empty, which is what it actually is.
 *
 * The class name is logged and nothing else. A Prisma error message quotes the
 * failing statement, and a statement carries whatever was being queried.
 */
async function safely<T>(what: string, fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error('[cases] read failed', { what, code: (error as Error)?.name });
    return fallback;
  }
}

export async function listPublishedCases(): Promise<CaseRow[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  return safely('listPublished', [], async () => {
    const rows = await prisma.project.findMany({ where: { published: true }, orderBy: ORDER });
    return rows.map(toDetail);
  });
}

export async function getPublishedCase(slug: string): Promise<CaseDetail | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return safely('getPublished', null, async () => {
    // `published` is part of the lookup, not a check afterwards: a draft is
    // not reachable by guessing its slug.
    const row = await prisma.project.findFirst({ where: { slug, published: true } });
    return row ? toDetail(row) : null;
  });
}

/** Every case, drafts included. Admin only — the caller must be authenticated. */
export async function listAllCases(): Promise<CaseDetail[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  return safely('listAll', [], async () => {
    const rows = await prisma.project.findMany({ orderBy: ORDER });
    return rows.map(toDetail);
  });
}

/** One case by id, draft or not. Admin only. */
export async function getCase(id: string): Promise<CaseDetail | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return safely('getOne', null, async () => {
    const row = await prisma.project.findUnique({ where: { id } });
    return row ? toDetail(row) : null;
  });
}

/**
 * Turn a title into a URL segment.
 *
 * Cyrillic is transliterated rather than stripped: the titles here are mostly
 * Russian, and dropping non-Latin characters would turn "Интернет-магазин"
 * into an empty string, and then every such case into a slug collision.
 */
const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

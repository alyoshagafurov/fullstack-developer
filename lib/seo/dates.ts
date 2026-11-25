import type { LocalCase } from '@/lib/cases';
import { prisma, safely } from '@/lib/prisma';

/*
 * When things last changed, for the sitemap's <lastmod>.
 *
 * It used to say "now" for every address on every regeneration, and a search
 * engine soon stops believing a date that is always today. The dated content —
 * cases, prices, reviews — answers from the database; the fixed pages carry
 * the date their words last changed.
 */

/** When the words on the fixed pages last changed. Move it forward with the copy. */
export const CONTENT_UPDATED = new Date('2026-11-25T00:00:00Z');

/* A checkout with no database has no dates to read. */
const noDatabase = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL;

/** Each published case's last edit, by slug — retired ones too: the sitemap reads only the cases the site shows. */
export async function getCaseDates(): Promise<Map<string, Date>> {
  if (noDatabase) return new Map();
  const rows = await safely(
    'case dates',
    () => prisma.case.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    [],
  );
  return new Map(rows.map((row) => [row.slug, row.updatedAt]));
}

/** The last price the owner changed in the admin. */
export async function getPricesUpdated(): Promise<Date | null> {
  if (noDatabase) return null;
  const row = await safely('price dates', () => prisma.servicePrice.aggregate({ _max: { updatedAt: true } }), null);
  return row?._max.updatedAt ?? null;
}

/** The last review published or edited. */
export async function getReviewsUpdated(): Promise<Date | null> {
  if (noDatabase) return null;
  const row = await safely(
    'review dates',
    () => prisma.testimonial.aggregate({ where: { published: true }, _max: { updatedAt: true } }),
    null,
  );
  return row?._max.updatedAt ?? null;
}

/** The latest of some dates; the fixed content date when none is known. */
export function latest(...dates: (Date | null | undefined)[]): Date {
  const times = dates.filter((date): date is Date => date instanceof Date).map((date) => date.getTime());
  return times.length > 0 ? new Date(Math.max(...times)) : CONTENT_UPDATED;
}

/**
 * A case with none of its words in English yet. Its English address shows the
 * Russian text under English menus, so it is not a translation: both its
 * addresses point at the Russian page, and only that one goes in the sitemap.
 */
export function isUntranslated(row: Pick<LocalCase, 'fallback'>): boolean {
  return row.fallback.task && row.fallback.solution && row.fallback.result;
}


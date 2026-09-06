import { prisma, safely } from '@/lib/prisma';
import type { Gender } from '@/lib/content/review';

/*
 * Reading published cases and testimonials.
 *
 * This database is shared with the previous version of the site and the new
 * tables may not exist yet in a given environment, so every read goes through
 * `safely`: a missing table yields an empty list and the section simply does
 * not render. The landing page must never 500 because a table is absent.
 *
 * Only published rows ever leave this module. Drafts belong to the admin.
 */

export type CaseRow = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  year: string;
  task: string;
  solution: string;
  result: string;
  technologies: string[];
  liveUrl: string | null;
  objectImage: string;
  ghostWord: string | null;
  screenshots: string[];
  featured: boolean;
  order: number;
};

const caseSelect = {
  id: true,
  slug: true,
  title: true,
  client: true,
  year: true,
  task: true,
  solution: true,
  result: true,
  technologies: true,
  liveUrl: true,
  objectImage: true,
  ghostWord: true,
  screenshots: true,
  featured: true,
  order: true,
} as const;

export async function getPublishedCases(): Promise<CaseRow[]> {
  return safely(
    'getPublishedCases',
    () =>
      prisma.case.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: caseSelect,
      }),
    [],
  );
}

export async function getFeaturedCases(limit = 6): Promise<CaseRow[]> {
  return safely(
    'getFeaturedCases',
    () =>
      prisma.case.findMany({
        where: { published: true, featured: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        select: caseSelect,
      }),
    [],
  );
}

export async function getCase(slug: string): Promise<CaseRow | null> {
  return safely(
    'getCase',
    () => prisma.case.findFirst({ where: { slug, published: true }, select: caseSelect }),
    null,
  );
}

export type TestimonialRow = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  text: string;
  avatarUrl: string | null;
  /** 1–5, or null for a testimonial entered without a rating. */
  rating: number | null;
  /** Which of the two fixed portraits stands beside it; null draws a monogram. */
  gender: Gender | null;
  caseSlug: string | null;
};

/**
 * Published testimonials.
 *
 * There are none until the owner enters real ones from the admin, and none are
 * ever generated: an invented endorsement is a lie about a real person. A
 * testimonial links to its case only when that case is public too.
 */
export async function getTestimonials(limit?: number): Promise<TestimonialRow[]> {
  const rows = await safely(
    'getTestimonials',
    () =>
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        select: {
          id: true,
          name: true,
          company: true,
          role: true,
          text: true,
          avatarUrl: true,
          rating: true,
          gender: true,
          case: { select: { slug: true, published: true } },
        },
      }),
    [],
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    role: row.role,
    text: row.text,
    avatarUrl: row.avatarUrl,
    rating: row.rating,
    gender: row.gender === 'male' || row.gender === 'female' ? row.gender : null,
    caseSlug: row.case?.published ? row.case.slug : null,
  }));
}

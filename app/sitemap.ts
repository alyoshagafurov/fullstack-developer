import type { MetadataRoute } from 'next';

import { listPublishedCases } from '@/lib/cases';
import { SITE_URL } from '@/lib/seo';

/*
 * The landing page, the case register, and one entry per published case.
 *
 * Case pages have returned — as /work and /work/[slug], reading the database
 * rather than the hard-coded list this file used to point at. So the map is
 * built from the same query the register uses, which means it cannot list a
 * case that /work would not show: `listPublishedCases` filters on `published`
 * inside the query, and a draft has no URL to advertise.
 *
 * `lastModified` per case comes from its own updatedAt rather than from build
 * time. A sitemap that stamps every URL with "now" on each deploy tells a
 * crawler nothing about what actually changed.
 *
 * If the database is unreachable the read degrades to an empty list, so this
 * returns the two static routes instead of failing the build.
 */
/*
 * Rebuilt hourly rather than at deploy time.
 *
 * Cases are published from the admin, not from a commit, so a sitemap frozen
 * at build time would omit every case added since the last deploy — which,
 * for a site whose whole point is publishing cases, is most of them.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = await listPublishedCases();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: cases[0] ? new Date(cases[0].updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...cases.map((item) => ({
      url: `${SITE_URL}/work/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

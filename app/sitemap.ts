import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/*
 * The rebuild collapsed the site into one continuous composition, so there is
 * exactly one indexable URL right now. The old per-section routes and case
 * pages were removed with the old UI — listing them here would advertise 404s.
 *
 * When case pages return, add them back from lib/projects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}

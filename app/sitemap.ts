import type { MetadataRoute } from 'next';
import { getPublishedCases, getTestimonials } from '@/lib/cases';
import { services } from '@/lib/content/services';
import { site } from '@/lib/content/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cases, voices] = await Promise.all([getPublishedCases(), getTestimonials()]);
  const now = new Date();

  return [
    { url: site.url, lastModified: now, priority: 1 },
    { url: `${site.url}/work`, lastModified: now, priority: 0.9 },
    { url: `${site.url}/services`, lastModified: now, priority: 0.9 },
    { url: `${site.url}/about`, lastModified: now, priority: 0.7 },
    { url: `${site.url}/contacts`, lastModified: now, priority: 0.6 },
    { url: `${site.url}/start`, lastModified: now, priority: 0.8 },
    // /reviews answers 404 until the first testimonial is published.
    ...(voices.length > 0 ? [{ url: `${site.url}/reviews`, lastModified: now, priority: 0.5 }] : []),
    ...services.map((service) => ({
      url: `${site.url}/services/${service.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
    ...cases.map((row) => ({
      url: `${site.url}/work/${row.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
  ];
}

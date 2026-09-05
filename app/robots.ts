import type { MetadataRoute } from 'next';
import { site } from '@/lib/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin and the write endpoint have no business in an index.
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

import type { MetadataRoute } from 'next';
import { site } from '@/lib/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin and the write endpoint have no business in an index.
      // Nor does /mini: it is the brief and the review as Telegram runs them,
      // the same forms the site already offers at /start and /reviews/new. In
      // an index it would compete with those pages for the same words and send
      // a searcher to a page built to sit inside a Telegram window.
      disallow: ['/admin', '/api/', '/mini'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

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
      // ?lang= only sets the language cookie and redirects to the clean address: nothing to index there.
      disallow: ['/admin', '/api/', '/mini', '/*?lang='],
    },
    // No `Host:` line: Yandex retired the directive in 2018 and Google never
    // read it. The one address is set by the www → aly.lat redirect and the
    // canonical on every page.
    sitemap: `${site.url}/sitemap.xml`,
  };
}

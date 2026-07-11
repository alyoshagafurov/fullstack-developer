import type { MetadataRoute } from 'next';
import { projects } from '@/lib/projects';

const SITE = 'https://alishergafurov.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['', '/services', '/work', '/process', '/pricing', '/about', '/contact'];
  return [
    ...pages.map((path) => ({
      url: `${SITE}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...projects.map((p) => ({
      url: `${SITE}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}

import type { MetadataRoute } from 'next';
import { getPublishedCases } from '@/lib/cases';
import { services } from '@/lib/content/services';
import { site } from '@/lib/content/site';
import { localePath, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

/*
 * Every public page, once, at its English address, with its Russian twin
 * named beside it — so a search engine learns they are one page in two
 * languages rather than two pages saying the same thing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = await getPublishedCases();
  const now = new Date();

  const address = (lang: Locale, path: string) => {
    const local = localePath(lang, path);
    return local === '/' ? site.url : `${site.url}${local}`;
  };

  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: address('en', path),
    lastModified: now,
    priority,
    alternates: { languages: { en: address('en', path), ru: address('ru', path) } },
  });

  return [
    entry('/', 1),
    entry('/work', 0.9),
    entry('/services', 0.9),
    entry('/prices', 0.8),
    entry('/about', 0.7),
    entry('/contacts', 0.6),
    entry('/start', 0.8),
    entry('/reviews', 0.6),
    entry('/reviews/new', 0.5),
    ...services.map((service) => entry(`/services/${service.slug}`, 0.6)),
    ...cases.map((row) => entry(`/work/${row.slug}`, 0.7)),
  ];
}

import type { MetadataRoute } from 'next';
import { getPublishedCases, localizeCases } from '@/lib/cases';
import { site } from '@/lib/content/site';
import { locales, type Locale } from '@/lib/i18n';
import { getPriceList } from '@/lib/prices';
import {
  CONTENT_UPDATED,
  getCaseDates,
  getPricesUpdated,
  getReviewsUpdated,
  isUntranslated,
  latest,
} from '@/lib/seo/dates';
import { absoluteUrl } from '@/lib/seo/metadata';

export const revalidate = 3600;

/*
 * Every public page, at both of its addresses — the English one and the
 * Russian one under /ru — each naming the other and the default.
 *
 * It used to list only the English address, with /ru as an alternate beside
 * it, so the Russian pages — the ones a search for «программист в Душанбе»
 * can find — were never submitted at all. Google wants each language version
 * as its own <url> carrying the full set of alternates, itself included.
 *
 * <lastmod> is when the page's content last changed (lib/seo/dates.ts), not
 * the moment the sitemap was regenerated.
 *
 * Left out: /reviews/new (a form for past clients, noindex), /start/thanks
 * (noindex), and /admin, /api and /mini (closed in robots.ts).
 */

type Page = {
  path: string;
  priority: number;
  modified: Date;
  /** Pictures on the page worth finding in image search, as site paths or full URLs. */
  images?: readonly string[];
  /** A page that exists in one language only. */
  only?: Locale;
};

/*
 * A picture's full address, escaped for XML. Next writes <image:loc> as given
 * (next/dist/build/webpack/loaders/metadata/resolve-route-data.js), and case
 * screenshots are addresses typed in the admin: one with `?w=1200&q=80` would
 * put a bare «&» in the file and make the whole sitemap invalid XML — every
 * address in it rejected, not just that picture.
 */
const full = (src: string) =>
  (src.startsWith('http') ? src : `${site.url}${src}`)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/* What the home shows: his photos and the two live sites on the first screen. */
const HOME_IMAGES = ['/me/call.webp', '/me/mirror.webp', '/me/avatar.webp', '/cases/arusdomod-desktop.webp', '/cases/mimi-phone.webp'];
const ABOUT_IMAGES = ['/me/leather.webp', '/me/blue-street.webp', '/me/evening.webp', '/me/records.webp', '/me/night-code.webp'];
const DUSHANBE_IMAGES = ['/me/laptop.webp', '/me/avatar.webp'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cases, priceList, caseDates, pricesUpdated, reviewsUpdated] = await Promise.all([
    getPublishedCases(),
    // only the services the owner shows; one he hid stays reachable but is not put forward
    getPriceList('ru'),
    getCaseDates(),
    getPricesUpdated(),
    getReviewsUpdated(),
  ]);
  const english = await localizeCases(cases, 'en');

  // only the cases the site shows: an edit to a retired one changes no page
  const newestCase = latest(...cases.map((row) => caseDates.get(row.slug)));
  const priced = latest(CONTENT_UPDATED, pricesUpdated);

  const pages: Page[] = [
    { path: '/', priority: 1, modified: latest(CONTENT_UPDATED, newestCase, pricesUpdated, reviewsUpdated), images: HOME_IMAGES },
    { path: '/dushanbe', priority: 0.9, modified: latest(priced, newestCase), images: DUSHANBE_IMAGES },
    { path: '/services', priority: 0.9, modified: priced },
    { path: '/work', priority: 0.9, modified: latest(CONTENT_UPDATED, newestCase) },
    { path: '/prices', priority: 0.8, modified: priced },
    { path: '/about', priority: 0.7, modified: CONTENT_UPDATED, images: ABOUT_IMAGES },
    { path: '/start', priority: 0.7, modified: CONTENT_UPDATED },
    { path: '/contacts', priority: 0.6, modified: CONTENT_UPDATED },
    { path: '/reviews', priority: 0.6, modified: latest(CONTENT_UPDATED, reviewsUpdated) },
    ...priceList.map((service) => ({ path: `/services/${service.slug}`, priority: 0.8, modified: priced })),
    ...english.map((row) => ({
      path: `/work/${row.slug}`,
      priority: 0.7,
      modified: caseDates.get(row.slug) ?? CONTENT_UPDATED,
      images: row.screenshots,
      // no English words yet: the English address points at the Russian one, so only that is listed
      only: isUntranslated(row) ? ('ru' as const) : undefined,
    })),
  ];

  return pages.flatMap((page) => {
    const languages = page.only
      ? undefined
      : {
          en: absoluteUrl('en', page.path),
          ru: absoluteUrl('ru', page.path),
          'x-default': absoluteUrl('en', page.path),
        };
    return (page.only ? [page.only] : locales).map((lang) => ({
      url: absoluteUrl(lang, page.path),
      lastModified: page.modified,
      priority: page.priority,
      ...(languages ? { alternates: { languages } } : {}),
      ...(page.images && page.images.length > 0 ? { images: page.images.map(full) } : {}),
    }));
  });
}

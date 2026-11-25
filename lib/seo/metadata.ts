import type { Metadata } from 'next';
import { site } from '@/lib/content/site';
import { alternatesFor, localePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The head of a page: title, description, canonical, its twin in the other
 * language, and the card Telegram, WhatsApp and Instagram draw from a link.
 *
 * Next merges metadata one key deep: a page that sets only a title inherits
 * the layout's whole `openGraph`, so every inner page used to be shared with
 * the home page's title, description and address. Every page builds its head
 * here instead, so the card always describes the page the link points to.
 */

/*
 * The share card, one per language: «Программист в Душанбе» for Russian pages,
 * 'Web developer in Dushanbe' for English ones. A page with a picture of its
 * own passes it in. New files rather than a replaced /og.png, because
 * Telegram and WhatsApp keep a card by its address.
 */
export const OG_IMAGES = {
  ru: { url: '/og-ru.jpg', width: 1200, height: 630 },
  en: { url: '/og-en.jpg', width: 1200, height: 630 },
} as const;
/** The Russian card, for code that has no language to hand. */
export const OG_IMAGE = OG_IMAGES.ru;

/** A site path's full public address in a language: https://aly.lat/ru/prices. */
export function absoluteUrl(lang: Locale, path = '/'): string {
  return `${site.url}${localePath(lang, path)}`;
}

/** A page's own title with the site's suffix, as the browser tab and a share card show it. */
export function fullTitle(t: Dictionary, title: string): string {
  return t.meta.titleTemplate.replace('%s', title);
}

/** Text cut to a snippet's length at a word, never mid-word. */
export function snippet(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).replace(/[,;:—–-]\s*$/, '')}…`;
}

type Alternates = { canonical: string; languages?: Record<string, string> };

export type PageMeta = {
  lang: Locale;
  t: Dictionary;
  /** The path without a language prefix: '/services/sites'. */
  path: string;
  title: string;
  description: string;
  /** Used as written, without the "%s | name" suffix. The home page's title already carries the name. */
  absoluteTitle?: boolean;
  image?: { url: string; width?: number; height?: number; alt?: string };
  /**
   * Replaces the usual self-canonical plus en/ru/x-default. A case that has
   * no English yet points both its addresses at the Russian one.
   */
  alternates?: Alternates;
  robots?: Metadata['robots'];
};

export function pageMetadata({ lang, t, path, title, description, absoluteTitle, image, alternates, robots }: PageMeta): Metadata {
  const shown = absoluteTitle ? title : fullTitle(t, title);
  const links: Alternates = alternates ?? alternatesFor(lang, path);
  const url = `${site.url}${links.canonical}`;
  const picture: NonNullable<PageMeta['image']> = image ?? OG_IMAGES[lang];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: links,
    openGraph: {
      type: 'website',
      locale: t.meta.ogLocale,
      alternateLocale: lang === 'en' ? ['ru_RU'] : ['en_US'],
      url,
      siteName: site.brand,
      title: shown,
      description,
      images: [{ ...picture, alt: picture.alt ?? shown }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shown,
      description,
      images: [picture.url],
    },
    ...(robots ? { robots } : {}),
  };
}

/**
 * The head of an address with nothing behind it — an unknown path, a retired
 * case, a service that does not exist: its own title, not indexed, and none
 * of the canonical, language links or share card of another page.
 */
export function notFoundMetadata(t: Dictionary): Metadata {
  return {
    title: t.notFound.metaTitle,
    robots: { index: false, follow: true },
    alternates: null,
    openGraph: null,
    twitter: null,
  };
}

/**
 * Proof of ownership for Google Search Console and Yandex Webmaster, by meta tag.
 *
 *   GOOGLE_SITE_VERIFICATION — the content="…" value from Search Console's
 *                              "HTML tag" method (only the code, not the tag).
 *   YANDEX_VERIFICATION      — the content="…" value from Yandex Webmaster's
 *                              "Meta tag" method.
 *
 * Set them in Vercel → Project → Settings → Environment Variables for
 * Production, then redeploy: most pages are prerendered and read them at
 * build time. Unset, nothing is rendered. Verifying by DNS needs neither.
 */
export function siteVerification(): Metadata['verification'] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const yandex = process.env.YANDEX_VERIFICATION?.trim();
  if (!google && !yandex) return undefined;
  return { ...(google ? { google } : {}), ...(yandex ? { yandex } : {}) };
}

/*
 * The site's two languages, and how a path is spelled in each.
 *
 * English is the default and owns the bare addresses — aly.lat/about — because
 * that is who the owner works with now and who a search engine should meet
 * first. Russian lives under /ru, so a Russian-speaking client can be sent
 * aly.lat/ru/about and every link on the page keeps them there.
 *
 * Client-safe on purpose: the header and the switcher import it too. The
 * server-only half — reading the language of the request — is in ./server.
 */

export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** The public address of a site path in a language. English carries no prefix. */
export function localePath(lang: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLocale) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/**
 * A pathname with any language prefix taken off. Handles `/en/…` as well:
 * the proxy rewrites bare addresses to it internally, and depending on where
 * a pathname is read from it can arrive in either form.
 */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ru)(?=\/|$)/);
  if (!match) return pathname || '/';
  return pathname.slice(match[0].length) || '/';
}

/**
 * The canonical address of a page and its twin in the other language, for
 * `metadata.alternates`. Search engines read these as hreflang links, so the
 * English and Russian versions count as one page in two languages rather than
 * two pages saying the same thing.
 */
export function alternatesFor(lang: Locale, path = '/') {
  return {
    canonical: localePath(lang, path),
    languages: {
      en: localePath('en', path),
      ru: localePath('ru', path),
      'x-default': localePath(defaultLocale, path),
    },
  };
}

/** `{n}` placeholders, filled. Plain strings so a dictionary can cross into a client component. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

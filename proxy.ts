import { NextResponse, type NextRequest } from 'next/server';

/*
 * How a public address becomes a page in a language.
 *
 * English owns the bare addresses: aly.lat/about is served from the `/en`
 * branch of app/(site)/[lang] by an internal rewrite, so the URL a visitor
 * sees never carries a prefix. Russian is the real path /ru/about.
 *
 * /en/… itself is redirected to the bare address, so the English pages have
 * one address each rather than two — duplicates split a page's standing in a
 * search engine.
 *
 * The admin, the Mini App, the API and every file with an extension never
 * reach this: they are not localised and the matcher below leaves them alone.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/ru' || pathname.startsWith('/ru/')) return NextResponse.next();

  /*
   * A first visit from a Russian-reading browser goes to /ru. Local clients in
   * Tajikistan and abroad are equal audiences, so the browser decides — but
   * only once: a language picked in the switcher is stored in a cookie and
   * outranks it. Crawlers send no Accept-Language and keep the English pages.
   */
  const chosen = request.cookies.get('aly-lang')?.value;
  if (!chosen && prefersRussian(request.headers.get('accept-language'))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/ru' : `/ru${pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

/* Languages whose readers are better served by the Russian site than the English one. */
const RUSSIAN_READERS = new Set(['ru', 'tg', 'uz', 'ky', 'kk', 'be', 'uk', 'az', 'hy', 'ka', 'tk']);

function prefersRussian(header: string | null): boolean {
  if (!header) return false;
  const first = header.split(',')[0]?.trim().split(';')[0]?.toLowerCase() ?? '';
  return RUSSIAN_READERS.has(first.split('-')[0] ?? '');
}

export const config = {
  matcher: ['/((?!api(?:/|$)|admin(?:/|$)|mini(?:/|$)|lab(?:/|$)|_next|_vercel|.*\\..*).*)'],
};

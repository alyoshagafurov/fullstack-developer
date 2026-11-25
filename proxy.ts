import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, localePath, stripLocale } from '@/lib/i18n';

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

const LANG_COOKIE = 'aly-lang';
const YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  /*
   * ?lang=en or ?lang=ru: a language picked with a plain link. The switcher
   * also writes the cookie from its click handler, but that never runs for a
   * click before the page has loaded its script, a link opened in a new tab,
   * or a browser without JavaScript. Here the choice is stored on the way
   * through and the visitor lands on the clean address in that language, so
   * the marker never becomes a second address for a page.
   */
  const asked = searchParams.get('lang');
  if (isLocale(asked)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('lang');
    url.pathname = localePath(asked, stripLocale(pathname));
    const response = NextResponse.redirect(url, 307);
    response.cookies.set(LANG_COOKIE, asked, { path: '/', maxAge: YEAR, sameSite: 'lax' });
    return response;
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/ru' || pathname.startsWith('/ru/')) return NextResponse.next();

  if (sendToRussian(request, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/ru' : `/ru${pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

/*
 * Whether a bare address should send this visitor to its Russian page.
 *
 * A first visit from a Russian-reading browser goes to /ru. Local clients in
 * Tajikistan and abroad are equal audiences, so the browser decides — but only
 * once: a language picked in the switcher is stored in a cookie and outranks it.
 *
 * A stored "ru" also sends the home page, aly.lat, to /ru: someone who picked
 * Russian and later types the address should not be shown English. It does not
 * send any other English address there. Those are links — from a search, a
 * share, the switcher itself — and a link to an English page opens in English.
 *
 * Never for a crawler or a link preview. Some send a Russian Accept-Language
 * (YandexBot does), and redirected by it they could never fetch an English
 * page: the en and x-default hreflang targets would all turn into redirects,
 * and a shared English link would preview as the Russian page.
 *
 * Never for the router fetching data for a page that is already open, or a
 * form posting back to one: those belong to the page the visitor is on.
 */
function sendToRussian(request: NextRequest, pathname: string): boolean {
  if (!isPageVisit(request) || isCrawler(request.headers.get('user-agent'))) return false;
  const chosen = request.cookies.get(LANG_COOKIE)?.value;
  if (chosen) return chosen === 'ru' && pathname === '/';
  return prefersRussian(request.headers.get('accept-language'));
}

/** A browser opening a page, not the client router or a server action. */
function isPageVisit(request: NextRequest): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return !request.headers.has('rsc') && !request.headers.has('next-action');
}

/*
 * Search engines, link previews and audit tools. Most name a page about
 * themselves in their user agent (`+http://yandex.com/bots`); the rest are
 * listed. «cubot» is a phone maker, not a robot.
 */
const CRAWLER =
  /(?<!cu)bot\b|crawl|spider|slurp|mediapartners|google-|googleother|bingpreview|facebookexternalhit|facebookcatalog|whatsapp|vkshare|skypeuripreview|lighthouse|ia_archiver|\+https?:\/\//i;

function isCrawler(userAgent: string | null): boolean {
  return Boolean(userAgent && CRAWLER.test(userAgent));
}

/* Languages whose readers are better served by the Russian site than the English one. */
const RUSSIAN_READERS = new Set(['ru', 'tg', 'uz', 'ky', 'kk', 'be', 'uk', 'az', 'hy', 'ka', 'tk']);

function prefersRussian(header: string | null): boolean {
  if (!header) return false;
  const first = header.split(',')[0]?.trim().split(';')[0]?.toLowerCase() ?? '';
  return RUSSIAN_READERS.has(first.split('-')[0] ?? '');
}

export const config = {
  matcher: ['/((?!api(?:/|$)|admin(?:/|$)|mini(?:/|$)|_next|_vercel|.*\\..*).*)'],
};

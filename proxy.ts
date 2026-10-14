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

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api(?:/|$)|admin(?:/|$)|mini(?:/|$)|_next|_vercel|.*\\..*).*)'],
};

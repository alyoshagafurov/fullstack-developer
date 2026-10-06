/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nothing about the stack belongs in a response header.
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Case screenshots are uploaded from the admin into Vercel Blob.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },

  /*
   * Addresses the previous version of the site left behind.
   *
   * Google still holds /contact from the old build: it was indexed, the page
   * is gone, and a visitor searching his name lands on a 404 instead of the
   * site. A permanent redirect hands the old address's standing to the new
   * one rather than throwing it away, which is the whole difference between
   * moving a page and deleting it.
   *
   * The singular forms next to it are the same mistake waiting to happen —
   * /service, /price, /review — and cost nothing to answer.
   */
  async redirects() {
    const moved = [
      ['/contact', '/contacts'],
      ['/service', '/services'],
      ['/price', '/prices'],
      ['/pricing', '/prices'],
      ['/review', '/reviews'],
      ['/projects', '/work'],
      ['/portfolio', '/work'],
      ['/cases', '/work'],
    ];
    return moved.map(([source, destination]) => ({ source, destination, permanent: true }));
  },

  async headers() {
    /* Carried by every page, Mini App included. */
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];

    /*
     * The Mini App's set: the common guards, no X-Frame-Options, and a
     * `frame-ancestors` that says the same thing more precisely. See the note
     * on the block that uses it.
     */
    const mini = [
      ...common,
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org;",
      },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ];

    return [
      {
        /*
         * Everything except /mini.
         *
         * This used to be `/:path*`, which matched /mini too and sent it
         * `X-Frame-Options: DENY`. Telegram Web runs a Mini App inside an
         * iframe, so that header would make the page refuse to render there —
         * while the phone clients, which use a plain webview and never frame
         * anything, worked. "Works on my phone, blank on the client's laptop"
         * is the worst shape a bug can take, so /mini is cut out of this rule
         * rather than patched over by the next one.
         *
         * It has to be cut out, not overridden: Next's header blocks are
         * additive. /admin already proves it — it receives this block's
         * headers AND its own X-Robots-Tag. A second block for /mini would
         * send X-Frame-Options twice, and a browser reads a repeated one as
         * the strictest of them.
         */
        source: '/((?!mini(?:/|$)).*)',
        headers: [...common, { key: 'X-Frame-Options', value: 'DENY' }],
      },
      {
        /*
         * The Mini App: the same guards, minus the one that would stop
         * Telegram opening it, plus a narrower replacement.
         *
         * `frame-ancestors` is what X-Frame-Options was for, said precisely:
         * Telegram may frame this page and nobody else may. Modern browsers
         * give it precedence over X-Frame-Options, so one header does the work
         * of both and says more while doing it.
         *
         * Only the web client is affected by it at all — iOS, Android, macOS
         * and Windows load a Mini App as the top-level document of a webview,
         * where nothing frames anything and this header is inert. If a desktop
         * build turns out to frame it from some internal shell, the symptom is
         * loud and immediate: a blank Mini App window on that client and a
         * frame-ancestors violation in its console, and the fix is deleting
         * this one header.
         *
         * Worth knowing when weighing that: neither form here can be driven by
         * a stolen click. The review needs twenty typed characters, the brief
         * needs thirteen answers. Framing this page buys an attacker nothing,
         * so the host list is a tidy precaution rather than the thing holding
         * the door shut.
         *
         * Two sources rather than one: a repeated segment needs a prefix to be
         * one, so `/mini/:path*` cannot also stand in for the bare `/mini`.
         */
        source: '/mini',
        headers: mini,
      },
      {
        source: '/mini/:path*',
        headers: mini,
      },
      {
        // The admin surface never belongs in a search index.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;

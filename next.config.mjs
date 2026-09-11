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
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
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

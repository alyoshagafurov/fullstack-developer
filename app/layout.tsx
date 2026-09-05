import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/onest';
import './globals.css';
import { site } from '@/lib/content/site';

/*
 * The document, and nothing else.
 *
 * The site's header and footer live in app/(site)/layout.tsx, and the admin has
 * its own shell. Keeping them out of here is what stops the marketing
 * navigation appearing over the admin login form.
 *
 * One typeface for everything: the owner's wordmark is a geometric grotesque
 * and eight of the ten brands he named as references are set in one, so a
 * display serif would be a borrowed voice. Onest Variable ships every weight in
 * a single file per subset and the browser fetches only the subset the page
 * needs. Hierarchy comes from size, weight and space instead of a second family.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.seo.title,
    template: `%s — ${site.brand}`,
  },
  description: site.seo.description,
  applicationName: site.brand,
  authors: [{ name: site.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: site.url,
    siteName: site.brand,
    title: site.seo.title,
    description: site.seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

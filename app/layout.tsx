import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/onest';
import './globals.css';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { Grain } from '@/components/ui/Grain';
import { site } from '@/lib/content/site';

/*
 * One typeface for the whole site.
 *
 * The owner's wordmark is a geometric grotesque and eight of the ten brands he
 * named as references are set in one too, so a display serif would be a
 * borrowed voice. Onest Variable ships every weight in a single file per
 * subset, and the browser fetches only the subset a page actually needs.
 * Hierarchy comes from size, space and letterspacing instead of a second
 * family.
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
  themeColor: '#f1f0ee',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
        >
          К содержанию
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Grain />
      </body>
    </html>
  );
}

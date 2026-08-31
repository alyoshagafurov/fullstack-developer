import type { Metadata, Viewport } from 'next';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import JsonLd from '@/components/JsonLd';
import { LanguageProvider } from '@/lib/i18n';
import { SITE_URL, BRAND, PERSON, DEFAULT_TITLE, DEFAULT_DESCRIPTION, KEYWORDS, siteGraph } from '@/lib/seo';

/*
 * Two voices, both served from this origin — the woff2 files live in
 * public/fonts and are declared in globals.css. No Google Fonts, no CDN, and
 * no third-party request at runtime or at build.
 *
 *   Playfair Display — the display voice. High-contrast serif, real variable
 *   weights, full Cyrillic (non-negotiable: the site is Russian first).
 *   Onest — text, UI and the micro labels.
 *
 * Only the two Cyrillic slices are preloaded: they are what the first screen
 * actually renders for a Russian visitor.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s — ${PERSON} (${BRAND})` },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: BRAND,
  authors: [{ name: PERSON, url: SITE_URL }],
  creator: PERSON,
  publisher: PERSON,
  category: 'technology',
  alternates: { canonical: SITE_URL },
  manifest: '/manifest.webmanifest',
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: `${PERSON} — ${BRAND}`,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  appleWebApp: { capable: true, title: BRAND, statusBarStyle: 'black-translucent' },
  // `appleWebApp.capable` emits only the legacy apple-prefixed tag, which
  // Chrome reports as deprecated. Ship the standard name alongside it.
  other: { 'mobile-web-app-capable': 'yes' },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: '#191817',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload" href="/fonts/playfair-cyrillic.woff2"
          as="font" type="font/woff2" crossOrigin="anonymous"
        />
        <link
          rel="preload" href="/fonts/onest-cyrillic.woff2"
          as="font" type="font/woff2" crossOrigin="anonymous"
        />
        <JsonLd data={siteGraph()} />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">Перейти к содержимому</a>
        <SmoothScroll />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

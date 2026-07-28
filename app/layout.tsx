import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Backdrop from '@/components/Backdrop';
import Cursor from '@/components/Cursor';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollFX from '@/components/ScrollFX';
import JsonLd from '@/components/JsonLd';
import { LanguageProvider } from '@/lib/i18n';
import { CurrencyProvider } from '@/lib/currency';
import { SITE_URL, BRAND, PERSON, DEFAULT_TITLE, DEFAULT_DESCRIPTION, KEYWORDS, siteGraph } from '@/lib/seo';

/* Inter — self-hosted by next/font (no external request, no layout shift, full Cyrillic). */
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <JsonLd data={siteGraph()} />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">Перейти к содержимому</a>
        <SmoothScroll />
        <Backdrop />
        <Cursor />
        <ScrollProgress />
        <ScrollFX />
        <LanguageProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

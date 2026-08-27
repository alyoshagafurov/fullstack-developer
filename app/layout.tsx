import type { Metadata, Viewport } from 'next';
import { Unbounded, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import JsonLd from '@/components/JsonLd';
import { LanguageProvider } from '@/lib/i18n';
import { SITE_URL, BRAND, PERSON, DEFAULT_TITLE, DEFAULT_DESCRIPTION, KEYWORDS, siteGraph } from '@/lib/seo';

/*
 * Three voices, all self-hosted by next/font and all carrying Cyrillic —
 * non-negotiable, since the site's primary languages are Russian and Tajik.
 *
 *   Unbounded      — display. Wide, geometric, technical. The brand's face.
 *   Manrope        — text/UI. Modern grotesk that stays quiet next to it.
 *   JetBrains Mono — indices, years, stack, meta. The developer's voice.
 */
const display = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

const sans = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
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
  themeColor: '#191817',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
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

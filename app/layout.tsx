import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Backdrop from '@/components/Backdrop';
import Cursor from '@/components/Cursor';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollFX from '@/components/ScrollFX';
import { LanguageProvider } from '@/lib/i18n';
import { CurrencyProvider } from '@/lib/currency';

/*
 * Inter — self-hosted by next/font (no external request, no layout shift,
 * full Cyrillic). Exposed as the --font-sans CSS variable used across the
 * design system.
 */
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE = 'https://alishergafurov.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Алишер Гафуров — Full-Stack разработчик',
    template: '%s — Алишер Гафуров',
  },
  description:
    'Full-Stack веб-разработчик. Создаю современные, быстрые сайты и веб-приложения под ключ — от лендинга до полноценного продукта. React, Next.js, Node.js.',
  keywords: [
    'Full-Stack разработчик',
    'веб-разработчик',
    'разработка сайтов',
    'сайт под ключ',
    'Next.js',
    'React',
    'Node.js',
    'Душанбе',
    'Alisher Gafurov',
  ],
  authors: [{ name: 'Алишер Гафуров' }],
  creator: 'Алишер Гафуров',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE,
    siteName: 'Алишер Гафуров',
    title: 'Алишер Гафуров — Full-Stack разработчик',
    description:
      'Современные сайты и веб-приложения под ключ — быстро, чисто, профессионально.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Алишер Гафуров — Full-Stack разработчик',
    description: 'Современные сайты и веб-приложения под ключ.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.webmanifest',
  alternates: { canonical: SITE },
};

export const viewport: Viewport = {
  themeColor: '#070707',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: 'Алишер Гафуров',
      jobTitle: 'Full-Stack веб-разработчик',
      url: SITE,
      address: { '@type': 'PostalAddress', addressLocality: 'Душанбе', addressCountry: 'TJ' },
      email: 'mailto:gafurovalyosha@gmail.com',
      sameAs: ['https://t.me/alishergafurovv', 'https://instagram.com/alishergafurow'],
      knowsAbout: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'UI/UX', 'SEO'],
    },
    {
      '@type': 'ProfessionalService',
      name: 'Алишер Гафуров — веб-разработка',
      description: 'Разработка сайтов и веб-приложений под ключ.',
      url: SITE,
      areaServed: 'Worldwide',
      priceRange: '$$',
      provider: { '@type': 'Person', name: 'Алишер Гафуров' },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* If JS is disabled, never keep reveal content hidden. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;}.split-line>.line-inner{transform:none!important;}`}</style>
        </noscript>
      </head>
      <body>
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

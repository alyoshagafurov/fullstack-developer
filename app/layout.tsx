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
    // His name on every tab, not just the home page: the inner pages are the
    // ones that rank for «обо мне» and «услуги», and a title that says only
    // "aly" tells a search engine nothing about whose site it is.
    template: `%s — ${site.name} (${site.brand})`,
  },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
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
    images: [{ url: '/og.png', width: 1200, height: 630, alt: site.seo.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'light',
};

/*
 * What a search engine is told about the person behind the site. Every value
 * is one he gave; nothing here is inferred.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${site.url}/#person`,
      name: site.name,
      // Every spelling he is looked up by, so the two scripts resolve to one
      // person rather than to two strangers.
      alternateName: [...site.alsoKnownAs],
      jobTitle: site.role,
      description: site.seo.description,
      url: site.url,
      email: site.contact.email,
      telephone: site.contact.phoneHref,
      knowsLanguage: ['ru', 'en', 'tg'],
      knowsAbout: [
        'Веб-разработка',
        'Next.js',
        'React',
        'TypeScript',
        'Node.js',
        'Python',
        'Telegram-боты',
        'Интернет-магазины',
      ],
      address: { '@type': 'PostalAddress', addressLocality: 'Душанбе', addressCountry: 'TJ' },
      workLocation: {
        '@type': 'Place',
        name: 'Душанбе, Таджикистан',
        address: { '@type': 'PostalAddress', addressLocality: 'Душанбе', addressCountry: 'TJ' },
      },
      sameAs: [
        `https://t.me/${site.contact.telegram}`,
        `https://instagram.com/${site.contact.instagram}`,
        site.contact.github,
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.brand,
      description: site.seo.description,
      inLanguage: 'ru',
      publisher: { '@id': `${site.url}/#person` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* The inline script below adds a class to <html> before React hydrates;
       React would otherwise report the server/client attribute difference. */
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/*
          Marks the document before first paint so the opening can start hidden
          and arrive, rather than appear and then re-appear. Only when motion is
          welcome; and never without JavaScript, when the page is simply there.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')",
          }}
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

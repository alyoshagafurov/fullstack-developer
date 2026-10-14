import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/onest';
import '../../globals.css';
import { SiteChrome } from '@/components/chrome/SiteChrome';
import { Footer } from '@/components/chrome/Footer';
import { Grain } from '@/components/ui/Grain';
import { MotionRoot } from '@/components/motion/MotionRoot';
import { site } from '@/lib/content/site';
import { alternatesFor, locales, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The public site's document — its own root layout now.
 *
 * It used to sit under app/layout.tsx, which hard-coded `lang="ru"` for every
 * page. With English as the default and Russian under /ru, the language is a
 * route segment, and the one place that can put it on <html> is a root layout
 * below that segment. The admin and the Mini App keep their own documents
 * (app/admin/layout.tsx, app/(mini)/layout.tsx), both Russian.
 *
 * Both languages are prerendered; any other value in the segment is a 404.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'light',
};

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.siteTitle, template: t.meta.titleTemplate },
    description: t.meta.siteDescription,
    keywords: t.meta.keywords,
    applicationName: site.brand,
    authors: [{ name: t.person.name }],
    alternates: alternatesFor(lang, '/'),
    openGraph: {
      type: 'website',
      locale: t.meta.ogLocale,
      alternateLocale: lang === 'en' ? ['ru_RU'] : ['en_US'],
      url: `${site.url}${localePath(lang, '/')}`,
      siteName: site.brand,
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: t.meta.siteTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
      images: ['/og.png'],
    },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getDictionary();

  /*
   * What a search engine is told about the person behind the site, in the
   * page's own language. Every value is one he gave.
   */
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${site.url}/#person`,
        name: t.person.name,
        alternateName: [...site.alsoKnownAs, site.name],
        jobTitle: t.person.role,
        description: t.meta.siteDescription,
        url: site.url,
        email: site.contact.email,
        telephone: site.contact.phoneHref,
        knowsLanguage: ['ru', 'en', 'tg'],
        knowsAbout: ['Web development', 'Next.js', 'React', 'TypeScript', 'Node.js', 'Python', 'Telegram bots', 'Online stores'],
        address: { '@type': 'PostalAddress', addressLocality: 'Dushanbe', addressCountry: 'TJ' },
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
        description: t.meta.siteDescription,
        inLanguage: lang,
        publisher: { '@id': `${site.url}/#person` },
      },
    ],
  };

  return (
    /* The inline script below adds a class to <html> before React hydrates;
       React would otherwise report the server/client attribute difference. */
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Marks the document before first paint so the opening can start hidden
            and arrive, rather than appear and then re-appear. Only when motion is
            welcome; never without JavaScript, when the page is simply there. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')",
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
        >
          {t.common.skipToContent}
        </a>
        <SiteChrome
          lang={lang}
          copy={{
            header: t.header,
            nav: t.nav,
            getQuote: t.common.getQuote,
          }}
        />
        <main id="main">{children}</main>
        <Footer />
        <Grain />
        <MotionRoot />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

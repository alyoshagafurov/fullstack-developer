import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { Grain } from '@/components/ui/Grain';
import { MotionRoot } from '@/components/motion/MotionRoot';
import { site } from '@/lib/content/site';

/*
 * The public site's shell.
 *
 * The marketing header and footer live here rather than in the root layout so
 * that /admin does not inherit them. Before this split the admin login screen
 * carried the site navigation across the top — "Проекты, Услуги, Обо мне" over
 * a password field — which read as a broken page.
 *
 * The structured data below is here for the same reason, and moved here when
 * the Telegram Mini App arrived: it is addressed to a search engine, and a
 * search engine reads these pages and nothing else.
 */

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

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
      <MotionRoot />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}

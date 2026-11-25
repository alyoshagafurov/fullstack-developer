import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '../../globals.css';
import { SiteChrome } from '@/components/chrome/SiteChrome';
import { Footer } from '@/components/chrome/Footer';
import { GalleryMotion } from '@/components/museum/GalleryMotion';
import { whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import { locales } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { JsonLd } from '@/lib/seo/JsonLd';
import { siteVerification } from '@/lib/seo/metadata';
import { siteGraph } from '@/lib/seo/schema';
import { cachedPriceList, startingPrice } from '@/lib/seo/services';

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

/*
 * Two faces, as Apple and Porsche do it: Inter Tight, tight and heavy, for
 * headlines; Inter for everything read. Both carry Cyrillic.
 */
const interTight = Inter_Tight({ subsets: ['latin', 'cyrillic'], variable: '--font-inter-tight', display: 'swap' });
const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'light',
};

/*
 * What every page starts from: the title template, the robots rules and the
 * verification tags. Nothing here names an address.
 *
 * It used to carry the home page's whole head — canonical, language links,
 * share card — which any page without one of its own inherited: a 404 (when
 * Next builds its head from the layouts and not-found.tsx), a retired case, the
 * thanks page. Each of them then told a search engine it was the home page.
 * The home page sets its head in its own page.tsx now, and every other page
 * builds its own with lib/seo/metadata.ts.
 *
 * The default title is only ever seen on such a page, so it is his name: true
 * for every page, and never a copy of the home page's title.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    metadataBase: new URL(site.url),
    title: { default: t.person.name, template: t.meta.titleTemplate },
    keywords: t.meta.keywords,
    applicationName: site.brand,
    authors: [{ name: t.person.name, url: site.url }],
    creator: t.person.name,
    robots: {
      index: true,
      follow: true,
      // let Google show the case screenshots large and the whole description
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    // Search Console / Yandex Webmaster meta tags, from env; see lib/seo/metadata.ts
    verification: siteVerification(),
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getDictionary();

  /*
   * What a search engine is told about the person, his business and the site,
   * in the page's own language: lib/seo/schema.ts. Every value is one he gave;
   * the price range is the lowest starting price on his live price list.
   */
  const structuredData = siteGraph({ t, priceRange: startingPrice(lang, t, await cachedPriceList(lang)) });

  return (
    <html lang={lang} className={`${inter.variable} ${interTight.variable}`}>
      <body className="museum">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-bone focus:px-5 focus:py-3 focus:text-sm focus:text-wall"
        >
          {t.common.skipToContent}
        </a>
        <SiteChrome
          lang={lang}
          copy={{
            header: t.header,
            nav: t.nav,
            getQuote: t.common.getQuote,
            whatsapp: t.common.whatsapp,
          }}
          whatsappHref={whatsappHref(t)}
        />
        <main id="main">{children}</main>
        <Footer />
        <GalleryMotion />
        <Analytics />
        <JsonLd data={structuredData} />
      </body>
    </html>
  );
}

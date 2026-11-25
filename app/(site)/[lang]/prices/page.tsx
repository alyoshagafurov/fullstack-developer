import type { Metadata } from 'next';
import Link from 'next/link';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/site/Closing';
import { priceFormatter } from '@/lib/price-display';
import { fill, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { localizeService } from '@/lib/i18n/services';
import { JsonLd } from '@/lib/seo/JsonLd';
import { absoluteUrl, pageMetadata } from '@/lib/seo/metadata';
import { lowerFirst, parsePrice } from '@/lib/seo/price';
import { breadcrumbs, graph, offerCatalog } from '@/lib/seo/schema';
import { cachedPriceList } from '@/lib/seo/services';

/*
 * The price catalogue. This is the one page where the detail is the point, so
 * it is set as a museum's printed price list: name on the left, the time it
 * takes in thin type, the starting price on the right. Nothing else per row.
 * On the English site the figures read in dollars, converted at today's rate.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  const [list, shown] = await Promise.all([cachedPriceList(lang), priceFormatter(lang)]);
  // «лендинг — от 1 500 сомони, сайт — от 3 000 сомони, …», the four most asked about, as the page shows them:
  // somoni in Russian, dollars in English
  const named = Object.entries(t.meta.priceNames).flatMap(([slug, name]) => {
    const price = list.find((row) => row.slug === slug)?.price;
    const said = price ? (shown(price) ?? price) : null;
    return said ? [`${name} — ${lowerFirst(said.trim())}`] : [];
  });
  return pageMetadata({
    lang,
    t,
    path: '/prices',
    title: t.prices.metaTitle,
    description: named.length > 0 ? fill(t.prices.metaDescription, { list: named.join(', ') }) : t.prices.lede,
  });
}

export default async function PricesPage() {
  const { lang, t } = await getDictionary();
  const [items, price] = await Promise.all([cachedPriceList(lang), priceFormatter(lang)]);

  return (
    <>
      <JsonLd
        data={graph(
          offerCatalog(
            absoluteUrl(lang, '/prices'),
            t.prices.metaTitle,
            items.map((row) => ({
              name: localizeService(row, t).title,
              url: absoluteUrl(lang, `/services/${row.slug}`),
              figure: parsePrice(row.price),
            })),
          ),
          breadcrumbs(lang, t, [{ name: t.nav.prices, path: '/prices' }]),
        )}
      />
      <HallHead title={t.prices.title} script={t.prices.lede} />

      <section className="hall pb-28 md:pb-40" aria-label={t.prices.title}>
        <ul className="border-t border-seam">
          {items.map((service) => (
            <li key={service.slug} className="border-b border-seam">
              <Link
                href={localePath(lang, `/services/${service.slug}`)}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 md:grid-cols-[1fr_14rem_12rem] md:py-7"
              >
                <span className="font-display text-[clamp(1.25rem,2.2vw,1.875rem)] leading-tight font-black transition-colors duration-500 group-hover:underline group-hover:decoration-brass group-hover:decoration-2 group-hover:underline-offset-8">
                  {service.title}
                </span>
                <span className="order-last col-span-2 text-sm text-bone-3 md:order-none md:col-span-1">
                  {service.term}
                </span>
                <span className="text-right text-base text-bone tabular-nums md:text-lg">
                  {price(service.price) ?? t.common.priceOnRequest}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Closing lang={lang} t={t} />
    </>
  );
}

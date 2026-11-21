import type { Metadata } from 'next';
import Link from 'next/link';
import { HallHead } from '@/components/museum/HallHead';
import { Doorway, Draft } from '@/components/home/Spaces';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The price catalogue. This is the one page where the detail is the point, so
 * it is set as a museum's printed price list: name on the left, the time it
 * takes in thin type, the starting price on the right. Nothing else per row.
 * On the English site the figures read in dollars, converted at today's rate.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.prices.metaTitle,
    description: t.prices.metaDescription,
    alternates: alternatesFor(lang, '/prices'),
  };
}

export default async function PricesPage() {
  const { lang, t } = await getDictionary();
  const [items, price] = await Promise.all([getPriceList(lang), priceFormatter(lang)]);

  return (
    <>
      <HallHead title={t.prices.title} script={t.home.draftScript} note={t.prices.lede} />

      <section className="hall pb-28 md:pb-40" aria-label={t.prices.metaTitle}>
        <ul className="border-t border-seam">
          {items.map((service) => (
            <li key={service.slug} className="border-b border-seam">
              <Link
                href={localePath(lang, `/services/${service.slug}`)}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 md:grid-cols-[1fr_14rem_12rem] md:py-7"
              >
                <span className="font-display text-[clamp(1.25rem,2.2vw,1.875rem)] leading-tight font-black transition-colors duration-500 [font-synthesis:none] group-hover:text-brass">
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

      <Draft t={t} />
      <Doorway lang={lang} t={t} />
    </>
  );
}

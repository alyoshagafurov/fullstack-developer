import type { Metadata } from 'next';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { getPriceList } from '@/lib/prices';
import { terms } from '@/lib/content/process';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Цены',
  description:
    'Сколько стоит работа: цены на сайты, интернет-магазины, веб-приложения и Telegram-боты. Алишер Гафуров, разработчик из Душанбе, Таджикистан.',
  alternates: { canonical: '/prices' },
};

/*
 * The price list, set as a printed catalogue.
 *
 * A table of prices is the one page a visitor arrives at already deciding, so
 * it is built to be read down the right edge: the figure is the largest thing
 * in the row, in tabular numerals so the columns of digits line up, and a
 * leader runs from the name to the price the way a menu or an auction
 * catalogue does. Everything else on the row is smaller than the price.
 *
 * The figures come from the database where the owner has set one and from his
 * original answers where he has not, so this page is his to change without a
 * deploy. Revalidated for the same reason: a price edited in the admin has to
 * reach the site on its own.
 */
export default async function PricesPage() {
  const items = await getPriceList();

  return (
    <>
      <PageOpening
        eyebrow="Цены"
        title="Сколько стоит работа"
        lede="Это стартовые цены. Итог зависит от объёма — точную сумму называю после разговора."
      />

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <ol data-reveal="group" className="divide-y divide-line border-y border-line">
          {items.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                /* The row fills with ink from the left under the pointer, and
                   the type inverts with it: a catalogue line that answers. */
                className="group relative flex flex-col gap-2 overflow-hidden px-4 py-7 transition-colors md:flex-row md:items-baseline md:gap-6 md:px-6 md:py-8"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-studio)] group-hover:scale-x-100 motion-reduce:transition-none"
                />

                <span className="tabular relative shrink-0 text-[0.6875rem] tracking-[0.18em] text-ink-3 transition-colors group-hover:text-paper/50">
                  {service.num}
                </span>

                <span className="relative min-w-0 flex-1 md:flex md:items-baseline md:gap-6">
                  <span className="block text-[clamp(1.125rem,2.2vw,1.625rem)] leading-snug tracking-[-0.02em] transition-colors group-hover:text-paper">
                    {service.title}
                  </span>

                  {/* The leader. Decorative, and only where there is room. */}
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 translate-y-[-0.35em] border-b border-dotted border-line-2 transition-colors group-hover:border-paper/25 md:block"
                  />

                  {service.term && (
                    <span className="mt-1 block shrink-0 text-sm text-ink-3 transition-colors group-hover:text-paper/55 md:mt-0">
                      {service.term}
                    </span>
                  )}
                </span>

                <span className="relative shrink-0 md:text-right">
                  <span className="tabular block text-[clamp(1.25rem,2.6vw,1.875rem)] leading-none tracking-[-0.025em] transition-colors group-hover:text-paper">
                    {service.price ?? 'По договорённости'}
                  </span>
                  {service.note && (
                    <span className="mt-2 block max-w-xs text-xs leading-snug text-ink-3 transition-colors group-hover:text-paper/55">
                      {service.note}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Band>

      {/* His own terms: how payment is split, what support covers, what comes after. */}
      <Band tone="shelf" innerClassName="py-20 md:py-28">
        <dl data-reveal="group" className="grid gap-10 md:grid-cols-3">
          {terms.map((term) => (
            <div key={term.label}>
              <dt className="label mb-3">{term.label}</dt>
              <dd className="text-sm leading-relaxed text-ink-2">{term.value}</dd>
            </div>
          ))}
        </dl>
      </Band>

      <Invite />
    </>
  );
}

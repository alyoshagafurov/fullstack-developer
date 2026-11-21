import type { Metadata } from 'next';
import Link from 'next/link';
import { HallHead } from '@/components/museum/HallHead';
import { Doorway } from '@/components/home/Spaces';
import { ArrowIcon } from '@/components/museum/Icons';
import { SERVICE_HALLS, SERVICE_TYPE, startHref } from '@/components/museum/links';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { localizeService } from '@/lib/i18n/services';

/*
 * The services as four halls rather than fourteen rows. Each hall is one word
 * the size of the room, with the lead service's promise and price in the
 * corner and the neighbouring services as a quiet line of links underneath.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.services.metaTitle,
    description: t.services.metaDescription,
    alternates: alternatesFor(lang, '/services'),
  };
}

export default async function ServicesPage() {
  const { lang, t } = await getDictionary();
  const [list, price] = await Promise.all([getPriceList(lang), priceFormatter(lang)]);
  const bySlug = new Map(list.map((row) => [row.slug, row]));
  const words = new Map(t.home.directions.map((d) => [d.key, d]));

  return (
    <>
      <HallHead title={t.services.title} script={t.home.directionsTitle} note={t.about.difference} />

      {SERVICE_HALLS.map((hall, index) => {
        const lead = bySlug.get(hall.lead);
        const word = words.get(hall.key);
        if (!lead || !word) return null;
        const neighbours = hall.rest.map((slug) => bySlug.get(slug)).filter((row) => row !== undefined);

        return (
          <section
            key={hall.key}
            className={`py-24 md:py-36 ${index % 2 === 0 ? 'bg-wall-2' : ''}`}
            aria-labelledby={`hall-${hall.key}`}
          >
            <div className="hall grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <h2 id={`hall-${hall.key}`} data-rise className="hall-title">
                  <span className="line-mask">
                    <span>{word.word}</span>
                  </span>
                </h2>
                <p className="script mt-2 ml-1 -rotate-[3deg] text-[clamp(1.5rem,2.8vw,2.5rem)]">{word.script}</p>
              </div>

              <div className="lg:col-span-4 lg:text-right">
                <p className="wall-note lg:ml-auto">{localizeService(lead, t).tagline}</p>
                <p className="mt-5 text-sm text-bone">
                  {[price(lead.price), lead.term].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-8 flex flex-wrap gap-3 lg:justify-end">
                  <Link href={localePath(lang, `/services/${lead.slug}`)} className="btn-line">
                    {t.common.learnMore}
                  </Link>
                  <Link href={startHref(lang, SERVICE_TYPE[lead.slug])} className="btn-bone group">
                    {t.common.getQuote}
                    <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {neighbours.length > 0 && (
              <p className="hall mt-16 flex flex-wrap gap-x-6 gap-y-3 md:mt-20">
                {neighbours.map((row) => (
                  <Link key={row.slug} href={localePath(lang, `/services/${row.slug}`)} className="link-quiet text-sm">
                    {row.title}
                  </Link>
                ))}
              </p>
            )}
          </section>
        );
      })}

      <Doorway lang={lang} t={t} />
    </>
  );
}

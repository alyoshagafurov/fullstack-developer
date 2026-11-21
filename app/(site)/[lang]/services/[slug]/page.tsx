import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/apple/Sections';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { SERVICE_TYPE, startHref, whatsappHref } from '@/components/museum/links';
import { getService, services } from '@/lib/content/services';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { localizeService } from '@/lib/i18n/services';

/*
 * One service: what it is in the corner, what you get as the room's one
 * statement, and the price as large as a headline, because it is the number
 * everyone came to check.
 */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = getService(slug);
  if (!found) return {};
  const { lang, t } = await getDictionary();
  const service = localizeService(found, t);
  return {
    title: service.title,
    description: service.tagline,
    alternates: alternatesFor(lang, `/services/${service.slug}`),
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const found = getService(slug);
  if (!found) notFound();
  const { lang, t } = await getDictionary();
  const service = localizeService(found, t);
  const [list, price] = await Promise.all([getPriceList(lang), priceFormatter(lang)]);
  const priced = list.find((row) => row.slug === slug);
  const figure = price(priced?.price ?? service.budget) ?? t.common.priceOnRequest;
  const term = priced?.term ?? service.duration;
  const labels = t.services;

  return (
    <>
      <HallHead
        title={service.title}
        size="room"
        back={{ href: localePath(lang, '/services'), label: labels.eyebrow }}
        note={service.tagline}
      >
        <Link href={startHref(lang, SERVICE_TYPE[slug])} className="btn-bone group">
          {t.common.getQuote}
          <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
        <a href={whatsappHref(t)} target="_blank" rel="noopener noreferrer" className="btn-line">
          <WhatsAppIcon className="size-[1.1rem]" />
          {t.common.whatsapp}
        </a>
      </HallHead>

      <section className="bg-wall-2 py-24 md:py-36">
        <div className="hall grid gap-12 lg:grid-cols-12">
          <h2 data-rise className="room-title lg:col-span-7">
            <span className="line-mask">
              <span>{labels.youGet}</span>
            </span>
          </h2>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="wall-note">{service.deliverable}</p>
            <p className="wall-label mt-8">{labels.forWho}</p>
            <p className="wall-note mt-3">{service.who}</p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-36" aria-label={labels.budget}>
        <div className="hall flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <p data-rise className="hall-title text-[clamp(3rem,9vw,9rem)]">
            <span className="line-mask">
              <span>{figure}</span>
            </span>
          </p>
          <p className="wall-note md:text-right">
            {term ? `${labels.timeline}: ${term}. ` : ''}
            {t.prices.lede}
          </p>
        </div>
      </section>

      <Closing lang={lang} t={t} />
    </>
  );
}

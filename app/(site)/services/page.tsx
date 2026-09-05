import type { Metadata } from 'next';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { CTA } from '@/components/ui/CTA';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { services } from '@/lib/content/services';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Услуги',
  description: `Что я делаю: ${services
    .slice(0, 5)
    .map((s) => s.title.toLowerCase())
    .join(', ')} и другое.`,
  alternates: { canonical: '/services' },
};

/*
 * The full shelf.
 *
 * Rows alternate: the object sits left on one and right on the next, so
 * fourteen entries read as a walk past a display case instead of a table of
 * contents.
 */
export default function ServicesPage() {
  return (
    <>
      <PageOpening eyebrow="Услуги" title={site.shortStatement} lede={site.difference} />

      <Band tone="paper" innerClassName="py-12 md:py-20">
        <ol className="divide-y divide-line">
          {services.map((service, index) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className={`group grid items-center gap-6 py-10 md:gap-12 md:py-14 ${
                  index % 2 === 1 ? 'md:grid-cols-[1fr_10rem]' : 'md:grid-cols-[10rem_1fr]'
                }`}
              >
                <div
                  className={`relative aspect-square w-24 md:w-40 ${
                    index % 2 === 1 ? 'md:order-2' : ''
                  }`}
                >
                  <StudioObject
                    src={service.object}
                    alt=""
                    sizes="160px"
                    className="transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-2"
                  />
                </div>

                <div className={`min-w-0 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <p className="label mb-4">{service.num}</p>
                  <h2 className="text-[clamp(1.5rem,3.4vw,2.5rem)] leading-tight tracking-[-0.03em]">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
                    {service.tagline}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-3">
                    {service.duration && <span>{service.duration}</span>}
                    {service.budget && <span>{service.budget}</span>}
                    <span className="label transition-colors group-hover:text-ink">Подробнее</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Band>

      <Band tone="ground" innerClassName="py-24 md:py-32">
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.03em]">
          {site.contactInvite}
        </p>
        <CTA href="/start" className="mt-10">
          {site.heroCta}
        </CTA>
      </Band>
    </>
  );
}

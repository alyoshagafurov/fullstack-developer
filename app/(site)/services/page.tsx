import type { Metadata } from 'next';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { CTA } from '@/components/ui/CTA';
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
 * The full shelf — «Что я делаю», moved here off the landing page.
 *
 * It used to run twice: an index on black at home and a set of alternating
 * rows here, both listing the same fourteen services. The index is the better
 * of the two — rows of type rather than a grid of equal cards — so it lives on
 * the page that exists to answer this question, and the landing keeps the
 * vitrine instead.
 *
 * Hovering a row brings its one-liner in from the right and lifts nothing else;
 * the device stays visible at all times, because the object is what tells a
 * scanner what kind of thing each service produces.
 */
export default function ServicesPage() {
  return (
    <>
      {/*
       * The greeting says what the page is, not the site's statement again —
       * the statement is already on the first screen, in the marquee and in the
       * footer, and a fourth repetition read as a template filling a slot.
       */}
      <PageOpening eyebrow="Услуги" title="Что я делаю" lede={site.difference} />

      {/*
       * On paper rather than on black: the greeting above is already black, and
       * two dark bands in a row would read as one long section with a heading
       * floating in the middle of it.
       */}
      <Band tone="paper" id="services" innerClassName="py-20 md:py-28">
        <h2 className="label mb-12">{services.length} услуг</h2>

        <ol>
          {services.map((service) => (
            <li key={service.slug} className="border-t border-line last:border-b">
              <Link
                href={`/services/${service.slug}`}
                className="group grid grid-cols-[3rem_1fr] items-center gap-4 py-6 md:grid-cols-[4rem_1fr_auto] md:gap-8 md:py-8"
              >
                <span className="tabular text-[0.6875rem] tracking-[0.18em] text-ink-3">
                  {service.num}
                </span>

                <span className="min-w-0">
                  <span className="display-3 block transition-transform duration-400 ease-[var(--ease-studio)] group-hover:translate-x-3">
                    {service.title}
                  </span>
                  <span className="mt-2 block max-w-xl text-sm leading-relaxed text-ink-2 md:hidden">
                    {service.tagline}
                  </span>
                  {(service.duration || service.budget) && (
                    <span className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.75rem] text-ink-3">
                      {service.duration && <span>{service.duration}</span>}
                      {service.budget && <span>{service.budget}</span>}
                    </span>
                  )}
                </span>

                <span className="hidden max-w-md items-center gap-8 md:flex">
                  <span className="text-sm leading-relaxed text-ink-2 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                    {service.tagline}
                  </span>
                  {/* Always on screen, not only on hover: the device is what
                      tells a scanner what kind of thing this service produces. */}
                  <span className="relative block aspect-square w-36 shrink-0 lg:w-44">
                    <StudioObject
                      src={service.object}
                      alt=""
                      sizes="176px"
                      className="transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-2"
                    />
                  </span>
                </span>
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

import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { ServiceReel } from '@/components/services/ServiceReel';
import { CTA } from '@/components/ui/CTA';
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
      <Band tone="paper" innerClassName="pt-20 pb-10 md:pt-28 md:pb-12">
        <h2 data-reveal className="label">
          {services.length} услуг
        </h2>
      </Band>

      <ServiceReel items={services} />

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

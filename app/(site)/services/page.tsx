import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { ServiceReel } from '@/components/services/ServiceReel';
import { services } from '@/lib/content/services';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Услуги',
  description: `Что я делаю: ${services
    .slice(0, 5)
    .map((s) => s.title.toLowerCase())
    .join(', ')} и другое. Разработка на заказ в Душанбе, Таджикистан.`,
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
      <PageOpening
        eyebrow="Услуги"
        title="Что я делаю"
        lede={site.difference}
        video={{ src: '/gallery/desk.mp4', poster: '/gallery/desk-poster.webp' }}
      />

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

      <Invite />
    </>
  );
}

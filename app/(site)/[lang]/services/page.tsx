import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { ServiceReel } from '@/components/services/ServiceReel';
import { services } from '@/lib/content/services';
import { alternatesFor, fill } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { localizeService } from '@/lib/i18n/services';

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.services.metaTitle,
    description: t.services.metaDescription,
    alternates: alternatesFor(lang, '/services'),
  };
}

/*
 * The full shelf — "What I do", moved here off the landing page.
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
export default async function ServicesPage() {
  const { t } = await getDictionary();
  const items = services.map((service) => localizeService(service, t));

  return (
    <>
      {/*
       * The greeting says what the page is, not the site's statement again —
       * the statement is already on the first screen, in the marquee and in the
       * footer, and a fourth repetition read as a template filling a slot.
       */}
      <PageOpening
        eyebrow={t.services.eyebrow}
        title={t.services.title}
        lede={t.about.difference}
        video={{ src: '/gallery/desk.mp4', poster: '/gallery/desk-poster.webp' }}
      />

      {/*
       * On paper rather than on black: the greeting above is already black, and
       * two dark bands in a row would read as one long section with a heading
       * floating in the middle of it.
       */}
      <Band tone="paper" innerClassName="pt-20 pb-10 md:pt-28 md:pb-12">
        <h2 data-reveal className="label">
          {fill(t.services.count, { n: items.length })}
        </h2>
      </Band>

      <ServiceReel items={items} />

      <Invite />
    </>
  );
}

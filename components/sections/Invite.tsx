import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * How every page ends.
 *
 * One sentence of his, set the size of a poster on black, and the one button
 * the whole site exists to produce. It used to be written out again on each
 * page, and had drifted: grey on one, black on another, ranged left here,
 * centred there, three different type sizes. The same closing line in six
 * different costumes reads as six different sites.
 *
 * `leading-[0.94]` rather than the 0.84 the display size carries: this
 * sentence has a Д and a Щ, and their descenders reach into the line below at
 * the tighter setting.
 */
export function Invite() {
  return (
    <Band tone="void" innerClassName="py-28 text-center md:py-40">
      <p data-reveal className="display-1 mx-auto max-w-6xl leading-[0.94] text-paper uppercase">
        {site.contactInvite}
      </p>

      <div data-reveal className="mt-14 flex justify-center">
        <CTA href="/start" tone="dark" size="lg">
          {site.heroCta}
        </CTA>
      </div>
    </Band>
  );
}

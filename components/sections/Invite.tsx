import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * How every page ends: one sentence set the size of a poster on black, and the
 * request button. While this button is on screen the floating one sinks away
 * (see components/chrome/StickyCta.tsx), so the page never shows two.
 *
 * `leading-[0.94]` rather than the 0.84 the display size carries: the Russian
 * line has a Д, and its descender reaches into the line below at the tighter
 * setting.
 */
export async function Invite() {
  const { lang, t } = await getDictionary();
  return (
    <Band tone="void" innerClassName="py-28 text-center md:py-40">
      <p data-reveal className="display-1 mx-auto max-w-6xl leading-[0.94] text-paper uppercase">
        {t.closing.invite}
      </p>

      <div data-reveal className="mt-14 flex justify-center">
        <CTA href={localePath(lang, '/start')} tone="dark" size="lg">
          {t.common.getQuote}
        </CTA>
      </div>
    </Band>
  );
}

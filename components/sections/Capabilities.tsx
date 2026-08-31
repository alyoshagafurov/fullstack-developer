'use client';

import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 03 — Capabilities.
 *
 * Compositional idea: THE NUMBER IS THE HEADLINE.
 *
 * This section has no section title at all — it opens straight into the list,
 * which is what breaks it away from every other block on the page. The serif
 * numeral is set enormous and right-aligned, so the numbers build a hard right
 * edge down the page while the titles hang off it to the left in small caps.
 * Reading direction is therefore right-to-left, the opposite of everywhere
 * else on the site.
 *
 * Density is tight — rows sit close together and the whitespace is pushed out
 * to the margins rather than between the items.
 */
export default function Capabilities() {
  const { t } = useI18n();

  return (
    <section id="capabilities" className="relative beat">
      <Shell>
        {/* the only chrome: a single hairline with a running label */}
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-[16px] mb-[64px] md:mb-[96px]">
          <span className="label">03 — {t.services.eyebrow}</span>
          <span className="label text-ink-3">{t.services.items.length}</span>
        </div>

        <h2 className="sr-only">{t.services.title}</h2>
        <ul>
          {t.services.items.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i % 3}
              className="group border-b border-line last:border-b-0"
            >
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_180px] items-baseline gap-x-[24px] md:gap-x-[48px] gap-y-[8px] py-[24px] md:py-[32px]">
                {/* title hangs off the number's edge */}
                <h3 className="order-2 md:order-1 col-span-2 md:col-span-1 text-[15px] md:text-[17px] font-medium tracking-tight text-ink text-left md:text-right transition-colors duration-200 group-hover:text-signal">
                  {s.title}
                </h3>

                {/* the number carries the scale */}
                <span
                  aria-hidden
                  className="order-1 md:order-2 display text-[clamp(3rem,7vw,7rem)] leading-[0.8] text-ink-3 tabular-nums transition-colors duration-200 group-hover:text-signal"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* the description is deliberately small and quiet */}
                <p className="order-3 col-span-2 md:col-span-1 text-[13px] leading-[1.6] text-ink-3 max-w-[26ch]">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Shell>
    </section>
  );
}

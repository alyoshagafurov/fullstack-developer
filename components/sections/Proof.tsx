'use client';

import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { projects } from '@/lib/projects';
import { useI18n } from '@/lib/i18n';

/*
 * 08 — Proof.
 *
 * Compositional idea: THE NUMBERS ARE THE PAGE.
 *
 * No heading and no quote block. Four figures are set at display scale in an
 * uneven two-column arrangement, each dropped to a different height, so the
 * block reads as a scoreboard rather than a stat bar. The project outcomes
 * that used to be the headline are demoted to a caption strip along the
 * bottom rule — the exact inverse of the previous version.
 *
 * CONTENT NOTE: the dictionary's `testimonials` are placeholders (the original
 * implementation carried a TODO to replace them with real reviews), so they
 * are still not rendered. Everything here is a shipped project with a live URL
 * or a figure the owner stands behind.
 */
export default function Proof() {
  const { t } = useI18n();

  const outcomes = projects
    .map((p) => ({ meta: p, case: t.cases[p.slug] }))
    .filter((o) => o.case?.result?.value);

  /* Each figure sits at its own height — the drop is the composition. */
  const drop = ['lg:mt-0', 'lg:mt-[96px]', 'lg:mt-[32px]', 'lg:mt-[128px]'];

  return (
    <section id="proof" className="relative beat">
      <Shell>
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-[16px] mb-[64px] md:mb-[96px]">
          <span className="label">08 — {t.testimonials.eyebrow}</span>
        </div>

        <h2 className="sr-only">{t.testimonials.title}</h2>

        {/* the scoreboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[24px] gap-y-[48px] mb-[96px] md:mb-[128px]">
          {t.stats.items.map((s, i) => (
            <Reveal key={s.label} delay={i} className={drop[i % drop.length]}>
              <div className="display text-[clamp(3.5rem,9vw,8rem)] leading-[0.85] text-ink tabular-nums">
                {s.value}
                <span className="text-signal">{s.suffix}</span>
              </div>
              <p className="text-[13px] leading-[1.5] text-ink-3 mt-[16px] max-w-[16ch]">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>

        {/* the outcomes, demoted to a caption strip */}
        <Reveal>
          <ul className="border-t border-line grid sm:grid-cols-2 lg:grid-cols-5">
            {outcomes.map((o) => (
              <li
                key={o.meta.slug}
                className="border-b lg:border-b-0 lg:border-r border-line last:border-r-0 py-[16px] lg:py-[24px] lg:px-[16px] first:lg:pl-0"
              >
                <span className="display text-[17px] text-ink block">{o.case.result.value}</span>
                <span className="label text-[11px] block mt-[8px]">{o.case.title}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Shell>
    </section>
  );
}

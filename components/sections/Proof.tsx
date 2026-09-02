'use client';

import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Proof — the figures, as a bento row.
 *
 * Two changes, and the second matters more than the look.
 *
 * The scoreboard was four numerals dropped to uneven heights. That reads as a
 * composition rather than a grid, so it is now four panels of equal weight
 * with the figure still carrying the scale inside each one.
 *
 * The outcome strip along the bottom is gone. It listed case titles and their
 * headline results, pulled from the hard-coded `lib/projects.ts` — which is
 * both case content on the landing page, where cases no longer belong, and a
 * second source of truth that would drift the moment a case is edited in the
 * admin. Cases live on /work now, and they come from the database.
 *
 * CONTENT NOTE, unchanged: the dictionary's `testimonials` entries are
 * placeholders, so no quote is rendered. Only figures the owner stands behind.
 */
export default function Proof() {
  const { t } = useI18n();

  return (
    <section id="proof" className="relative beat">
      <Shell>
        {/* The figures' own heading, not the testimonials'. This block used to
            carry "Отзывы / Что говорят клиенты" as a screen-reader-only title,
            which was survivable while it was invisible; promoting it to a
            visible header made the page promise quotes and then hand over
            statistics. The quotes are still placeholders and still unrendered. */}
        <header className="mb-8 md:mb-10">
          <span className="label">{t.stats.eyebrow}</span>
          <h2 className="display text-d-s text-ink mt-3">{t.stats.title}</h2>
        </header>

        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4">
          {t.stats.items.map((stat, index) => (
            <Reveal as="li" key={stat.label} delay={index % 3}>
              <Panel className="h-full p-6 md:p-7">
                <div className="display text-[clamp(2.25rem,5vw,3.5rem)] leading-[0.9] text-ink tabular-nums">
                  {stat.value}
                  <span className="text-ink-2">{stat.suffix}</span>
                </div>
                <p className="m-0 mt-4 text-[13px] leading-[1.5] text-ink-2">{stat.label}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Shell>
    </section>
  );
}

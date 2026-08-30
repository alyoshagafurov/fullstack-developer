'use client';

import { useState } from 'react';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 06 — Principles (why me).
 *
 * Composition: a column of statements, not a grid of reasons. Each line is set
 * at heading scale with its number hung small beside it, and the supporting
 * sentence sits underneath in a narrow measure. The list is indented in a slow
 * stagger so the left edge steps down the page instead of forming a hard rule.
 *
 * Interaction: pointing at one statement dims the others. That is the whole
 * effect — attention, expressed as contrast. It is driven by one piece of
 * state rather than CSS sibling hacks so it also works from the keyboard, and
 * it only touches opacity.
 */
export default function Principles() {
  const { t } = useI18n();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="principles" className="relative py-rhythm-l">
      <Shell>
        <div className="grid-12 items-end gap-y-6 mb-16 md:mb-24">
          <div className="col-span-12 md:col-span-7">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
              06 / {t.why.eyebrow}
            </span>
            <h2 className="display text-d-l text-ink mt-6 max-w-[13ch]">{t.why.title}</h2>
          </div>
        </div>

        <ul className="max-w-4xl" onMouseLeave={() => setActive(null)}>
          {t.why.items.map((item, i) => {
            const dimmed = active !== null && active !== i;
            return (
              <Reveal as="li" key={item.t} delay={i % 4}>
                <div
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  style={{ paddingLeft: `${(i % 4) * 2.5}%` }}
                  className={`flex items-baseline gap-5 md:gap-8 py-6 md:py-7 outline-none
                              transition-opacity duration-500 ease-out
                              focus-visible:ring-1 focus-visible:ring-signal/60
                              focus-visible:ring-offset-4 focus-visible:ring-offset-base
                              ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                >
                  <span
                    className={`shrink-0 font-mono text-[0.625rem] pt-2 transition-colors duration-300
                                ${active === i ? 'text-signal' : 'text-ink-3'}`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3 className="display text-d-s text-ink leading-[1.12]">{item.t}</h3>
                    <p className="text-body text-ink-2 mt-2.5 max-w-md">{item.d}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Shell>
    </section>
  );
}

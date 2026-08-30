'use client';

import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 04 — Process.
 *
 * Composition: a magazine spread, read top to bottom. Each step is a hairline
 * rule with an enormous numeral hung in the left margin — outdented past the
 * text column so the numbers form their own vertical edge down the page. The
 * step's title sits on the rule; its description is held in a narrow column
 * far right, leaving a wide channel of air across the middle.
 *
 * Hover: the numeral drifts a few pixels and brightens, the rule takes the
 * signal colour. Transform and colour only — nothing reflows, nothing loops.
 */
export default function Method() {
  const { t } = useI18n();

  return (
    <section id="process" className="relative py-rhythm-l bg-base-deep overflow-x-clip">
      <Shell>
        <div className="grid-12 items-end gap-y-6 mb-20 md:mb-28">
          <div className="col-span-12 md:col-span-6">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
              04 / {t.process.eyebrow}
            </span>
            <h2 className="display text-d-l text-ink mt-6 max-w-[10ch]">{t.process.title}</h2>
          </div>
          <p className="col-span-12 md:col-span-4 md:col-start-9 text-body text-ink-2">
            {t.process.sub}
          </p>
        </div>

        <ol className="border-t border-line">
          {t.process.steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i % 3} className="group border-b border-line">
              <div className="relative grid-12 items-baseline gap-y-5 py-10 md:py-16">
                {/* the numeral, hung in the margin */}
                <span
                  aria-hidden
                  className="col-span-3 md:col-span-2 display leading-none text-surface-high
                             text-[clamp(3rem,7vw,6.5rem)] md:-ml-[0.06em]
                             transition-[transform,color] duration-500 ease-out
                             group-hover:translate-x-1.5 group-hover:text-ink-3"
                >
                  {s.n}
                </span>

                <h3 className="col-span-9 md:col-span-5 display text-d-s text-ink">{s.t}</h3>

                <p className="col-span-12 md:col-span-4 md:col-start-9 text-body text-ink-2 max-w-sm">
                  {s.d}
                </p>

                {/* the rule that takes the signal on hover */}
                <span
                  aria-hidden
                  className="absolute left-0 -bottom-px h-px w-full origin-left scale-x-0 bg-signal
                             transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
              </div>
            </Reveal>
          ))}
        </ol>
      </Shell>
    </section>
  );
}

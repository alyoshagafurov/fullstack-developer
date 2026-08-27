'use client';

import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 04 — Process.
 *
 * Composition: the title pins to the left while the steps scroll past it, so
 * the section reads as one held thought rather than a stack of equal blocks.
 * Each step's numeral is set oversized in surface grey and sits behind the
 * text — a graphic element, not a badge.
 */
export default function Method() {
  const { t } = useI18n();

  return (
    <section id="process" className="relative py-rhythm-l">
      <Shell grid className="gap-y-16">
        {/* pinned side */}
        <div className="col-span-12 md:col-span-4">
          <div className="md:sticky md:top-32">
            <Meta rule className="mb-6">04 — {t.process.eyebrow}</Meta>
            <h2 className="display text-d-l text-ink mb-6">{t.process.title}</h2>
            <p className="text-body text-ink-2 max-w-xs">{t.process.sub}</p>
          </div>
        </div>

        {/* the sequence */}
        <ol className="col-span-12 md:col-span-7 md:col-start-6">
          {t.process.steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i} className="relative border-t border-line py-10 md:py-14">
              <span
                aria-hidden
                className="display pointer-events-none absolute -top-2 right-0 text-[5.5rem] md:text-[8rem] leading-none text-surface/70 select-none"
              >
                {s.n}
              </span>
              <div className="relative max-w-md">
                <span className="font-mono text-[0.6875rem] text-signal">{s.n}</span>
                <h3 className="display text-d-s text-ink mt-3 mb-3">{s.t}</h3>
                <p className="text-body text-ink-2">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Shell>
    </section>
  );
}

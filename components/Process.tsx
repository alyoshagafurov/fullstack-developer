'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import SectionMore from './SectionMore';
import FloatObject from './FloatObject';
import { useI18n } from '@/lib/i18n';

/* Process — alternating timeline: 01 left, 02 right, 03 left … down a center line. */

export default function Process({ moreHref }: { moreHref?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const STEPS = t.process.steps;

  return (
    <section id="process" ref={ref} className="relative isolate py-28 md:py-44 bg-bg-2/30">
      <FloatObject src="/obj-cluster.jpg" className="bottom-[2%] right-[-8%] w-[56vw] md:w-[26vw]" opacity={0.45} />
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div data-reveal="0" className="label mb-6">{t.process.eyebrow}</div>
            <SplitText as="h2" className="display text-ink text-[10vw] md:text-[3.6rem] max-w-2xl">
              {t.process.title}
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">
            {t.process.sub}
          </p>
        </div>

        <div className="relative">
          {/* connecting line — far-left on mobile, centered on desktop */}
          <span className="absolute top-2 bottom-2 w-px bg-line left-[6px] md:left-1/2 md:-translate-x-1/2" aria-hidden />

          <div className="space-y-8 md:space-y-0">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <div key={s.n} className="relative md:grid md:grid-cols-2 md:gap-x-20 md:items-center">
                  {/* node */}
                  <span
                    className={`absolute left-[6px] md:left-1/2 top-2 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-3 h-3 rounded-full ring-4 ring-bg z-10 ${
                      i === 0 ? 'bg-accent' : 'bg-ink/70'
                    }`}
                    aria-hidden
                  />
                  <div
                    data-reveal={String(i % 2)}
                    className={`pl-10 md:pl-0 py-5 md:py-12 ${left ? 'md:col-start-1 md:text-right md:pr-16' : 'md:col-start-2 md:pl-16'}`}
                  >
                    <div className="display text-dim text-4xl md:text-6xl mb-3 tabular-nums">{s.n}</div>
                    <h3 className="text-ink text-xl md:text-2xl font-semibold tracking-tight mb-2">{s.t}</h3>
                    <p className={`text-ink-2 text-[15px] leading-relaxed md:max-w-sm ${left ? 'md:ml-auto' : ''}`}>{s.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {moreHref && <SectionMore href={moreHref} />}
      </div>
    </section>
  );
}

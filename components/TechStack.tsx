'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import { useI18n } from '@/lib/i18n';

/* Tech stack — chips grouped by layer. They drift gently and light up on hover. */

export default function TechStack() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const GROUPS = t.stack.groups;

  return (
    <section id="stack" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div data-reveal="0" className="label mb-6">{t.stack.eyebrow}</div>
            <SplitText as="h2" className="display text-ink text-[10vw] md:text-[3.6rem] max-w-2xl">
              {t.stack.title}
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">
            {t.stack.sub}
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g, gi) => (
            <div key={g.title} data-reveal={String(gi % 3)} className="glass p-6 md:p-7">
              <div className="label mb-5">{g.title}</div>
              <div className="flex flex-wrap gap-2.5">
                {g.items.map((t, i) => (
                  <span
                    key={t}
                    data-hover
                    className="float-slow inline-flex items-center rounded-xl border border-line bg-white/[0.02] px-3.5 py-2 text-[13px] text-ink-2 hover:text-ink hover:border-line-2 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                    style={{ animationDelay: `${(i % 5) * 0.4}s`, animationDuration: '8s' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

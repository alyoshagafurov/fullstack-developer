'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import SectionMore from './SectionMore';
import { projects } from '@/lib/projects';
import { useI18n } from '@/lib/i18n';

/*
 * Work — text-first case cards (no screenshots). Structure from lib/projects,
 * translatable text from the i18n dictionary (cases[slug]).
 */
export default function Projects({ moreHref }: { moreHref?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="work" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div data-reveal="0" className="label mb-6">{t.work.eyebrow}</div>
            <SplitText as="h2" className="display text-ink text-[11vw] md:text-[4.6rem]">
              {t.work.title}
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">{t.work.sub}</p>
        </div>

        <div className="flex flex-col gap-5">
          {projects.map((p, i) => {
            const c = t.cases[p.slug];
            if (!c) return null;
            return (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                data-reveal={String(i % 2)}
                data-cursor={t.work.open}
                className="group glass p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-center"
              >
                <div className="display text-dim text-5xl md:text-8xl leading-none group-hover:text-ink/60 transition-colors duration-500 tabular-nums">
                  {p.index}
                </div>

                <div>
                  <div className="flex items-center gap-3 label mb-4">
                    <span>{c.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{p.year}</span>
                  </div>
                  <h3 className="display text-ink text-3xl md:text-5xl mb-4 group-hover:translate-x-1 transition-transform duration-500">
                    {c.title}
                  </h3>
                  <p className="text-ink-2 text-[15px] md:text-base leading-relaxed max-w-xl mb-6">{c.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.stack.slice(0, 5).map((s) => (
                      <span key={s} className="text-[11px] text-muted border border-line rounded-full px-3 py-1">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-end md:items-end justify-between gap-6 md:text-right md:min-w-[190px]">
                  <div>
                    <div className="display text-ink text-3xl md:text-4xl tabular-nums">{c.result.value}</div>
                    <div className="text-[12px] text-muted mt-1 max-w-[180px] leading-snug">{c.result.label}</div>
                  </div>
                  <span className="inline-flex items-center gap-2.5 text-[13px] text-ink-2 group-hover:text-ink transition-colors whitespace-nowrap">
                    {t.work.open}
                    <span className="w-10 h-10 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all duration-500">
                      <ArrowUpRight size={17} />
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {moreHref && <SectionMore href={moreHref} />}
      </div>
    </section>
  );
}

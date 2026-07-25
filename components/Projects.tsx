'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import SectionMore from './SectionMore';
import { projects } from '@/lib/projects';
import { useI18n } from '@/lib/i18n';

/*
 * Work — real case cards. A screenshot of each live project (grayscale, turns
 * colour on hover) sits beside the case meta; the card opens the full
 * /work/[slug] case study. Structure from lib/projects, text from i18n.
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

        <div className="flex flex-col gap-5 md:gap-6">
          {projects.map((p, i) => {
            const c = t.cases[p.slug];
            if (!c) return null;
            const flip = i % 2 === 1;
            return (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                data-reveal={String(i % 2)}
                data-cursor={t.work.open}
                className="group glass overflow-hidden grid md:grid-cols-2 items-stretch"
              >
                {/* Screenshot */}
                <div className={`relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden ${flip ? 'md:order-2' : ''}`}>
                  <Image
                    src={p.cover}
                    alt={c.title}
                    fill
                    className="object-cover object-top grayscale scale-[1.01] group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)]"
                    sizes="(max-width:768px) 90vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-70 group-hover:opacity-30 transition-opacity duration-700" />
                  <div className="absolute top-4 left-4 text-[11px] label text-ink bg-black/45 backdrop-blur-sm rounded-full px-3 py-1">{p.index}</div>
                </div>

                {/* Meta */}
                <div className="relative p-7 md:p-11 flex flex-col justify-center">
                  <div className="flex items-center gap-3 label mb-5">
                    <span>{c.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{p.year}</span>
                  </div>
                  <h3 className="display text-ink text-3xl md:text-[2.6rem] leading-[1.02] mb-4 group-hover:translate-x-1 transition-transform duration-500">
                    {c.title}
                  </h3>
                  <p className="text-ink-2 text-[15px] leading-relaxed max-w-md mb-7">{c.summary}</p>

                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <div className="display text-ink text-2xl md:text-3xl tabular-nums">{c.result.value}</div>
                      <div className="text-[12px] text-muted mt-1 max-w-[190px] leading-snug">{c.result.label}</div>
                    </div>
                    <span className="inline-flex items-center gap-2.5 text-[13px] text-ink-2 group-hover:text-ink transition-colors whitespace-nowrap">
                      {t.work.open}
                      <span className="w-10 h-10 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all duration-500">
                        <ArrowUpRight size={17} />
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-7">
                    {c.stack.slice(0, 5).map((s) => (
                      <span key={s} className="text-[11px] text-muted border border-line rounded-full px-3 py-1">{s}</span>
                    ))}
                  </div>
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

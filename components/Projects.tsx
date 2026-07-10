'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import { projects } from '@/lib/projects';

/*
 * Work — large case cards. Image zooms and a gradient + "Смотреть проект" reveal
 * on hover. Each card links to its full /work/[slug] case study.
 */
export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="work" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div data-reveal="0" className="label mb-6">Избранные работы</div>
            <SplitText as="h2" className="display text-ink text-[11vw] md:text-[4.6rem]">
              Работы
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">
            Каждый проект — как кейс: задача, решение, стек и результат. Кликните, чтобы открыть разбор.
          </p>
        </div>

        <div className="flex flex-col gap-5 md:gap-6">
          {projects.map((p, i) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              data-reveal={String(i % 2)}
              data-cursor="Открыть"
              className="group glass overflow-hidden grid md:grid-cols-2 items-stretch"
            >
              {/* Image */}
              <div className={`relative aspect-[16/10] md:aspect-auto md:min-h-[380px] overflow-hidden ${i % 2 ? 'md:order-2' : ''}`}>
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)]"
                  sizes="(max-width:768px) 90vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                <div className="absolute top-4 left-4 text-[11px] label text-ink/90 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">{p.index}</div>
              </div>

              {/* Meta */}
              <div className="relative p-7 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 label mb-6">
                  <span>{p.category}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>{p.year}</span>
                </div>
                <h3 className="display text-ink text-3xl md:text-5xl mb-4">{p.title}</h3>
                <p className="text-ink-2 text-[15px] md:text-base leading-relaxed max-w-md mb-7">{p.summary}</p>

                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="display text-ink text-2xl md:text-3xl tabular-nums">{p.result.value}</div>
                    <div className="text-[12px] text-muted mt-1 max-w-[180px] leading-snug">{p.result.label}</div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[13px] text-ink-2 group-hover:text-ink transition-colors">
                    Смотреть проект
                    <span className="w-9 h-9 rounded-full border border-line grid place-items-center group-hover:bg-white group-hover:text-bg group-hover:border-white transition-all duration-500">
                      <ArrowUpRight size={16} />
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-7">
                  {p.stack.slice(0, 4).map((t) => (
                    <span key={t} className="text-[11px] text-muted border border-line rounded-full px-3 py-1">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

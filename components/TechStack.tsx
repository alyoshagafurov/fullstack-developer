'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import { useI18n } from '@/lib/i18n';

/*
 * Technology — the heading sits left, and the instruments sit right as two
 * overlapping frames: the tall knolled toolkit behind, the daily desk stepped
 * over its lower corner. Asymmetric on purpose, so the photography reads as a
 * composition rather than a pair of cards. Chips run full width underneath.
 */

export default function TechStack() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const GROUPS = t.stack.groups;
  const p = t.photo;

  return (
    <section id="stack" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center mb-20 md:mb-24">
          {/* Text — asymmetric, holds the left half */}
          <div className="lg:col-span-6 lg:pr-8">
            <div data-reveal="0" className="label mb-6">{t.stack.eyebrow}</div>
            <SplitText as="h2" className="display text-ink text-[10vw] md:text-[3.6rem] max-w-xl">
              {t.stack.title}
            </SplitText>
            <p data-reveal="1" className="mt-7 text-ink-2 text-lg leading-relaxed max-w-md">
              {t.stack.sub}
            </p>
          </div>

          {/* Instruments — two overlapping frames */}
          <div data-reveal="2" className="lg:col-span-6">
            <div className="ml-auto w-full max-w-[360px] sm:max-w-[440px] pr-10 sm:pr-14">
              <div className="relative">
              {/* behind — the toolkit, knolled */}
              <div className="relative w-[70%] aspect-[3/4.3] overflow-hidden rounded-2xl border border-line">
                <Image
                  src="/lifestyle-accessories.jpg"
                  alt="Инструменты: техника и аксессуары, разложенные на графитовой поверхности"
                  fill
                  quality={84}
                  sizes="(max-width:640px) 60vw, 320px"
                  data-parallax="0.03"
                  data-pscale="1.1"
                  className="object-cover will-change-transform"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 90px rgba(15,13,11,0.75)' }}
                />
              </div>

              {/* in front — the daily desk, stepped over the corner */}
              <div className="absolute -bottom-[12%] -right-[14%] w-[60%] aspect-[4/5] overflow-hidden rounded-2xl border border-line-2 shadow-[0_36px_80px_-24px_rgba(0,0,0,0.9)]">
                <Image
                  src="/lifestyle-macbook.jpg"
                  alt="Рабочее место: планшет с клавиатурой, наушники и часы на тёмном дереве"
                  fill
                  quality={84}
                  sizes="(max-width:640px) 52vw, 280px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 70px rgba(15,13,11,0.6)' }}
                />
              </div>

              </div>

              {/* caption in the whitespace the overlap leaves behind */}
              <div className="mt-8 w-[52%] hidden sm:block">
                <div className="flex items-center gap-2 label text-[9px] text-accent">
                  <span className="w-4 h-px bg-accent/50" />
                  {p.toolsLabel}
                </div>
                <p className="mt-2 text-muted text-[12px] leading-relaxed">{p.toolsNote}</p>
              </div>
            </div>
          </div>
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
                    className="float-slow inline-flex items-center rounded-xl border border-line bg-white/[0.02] px-3.5 py-2 text-[13px] text-ink-2 hover:text-ink hover:border-accent/40 hover:bg-accent/[0.06] hover:-translate-y-0.5 transition-all duration-300 cursor-default"
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

'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 07 — Technology.
 *
 * Composition: a numbered specimen sheet. Each layer of the stack is a row —
 * mono number, layer name, then the tools themselves set as running display
 * text at heading scale. The words are the texture; there are no chips and no
 * boxes.
 *
 * One photograph anchors the spread: the knolled toolkit, held narrow in the
 * right margin and deliberately smaller than the type. It is 736px wide in the
 * source, so it is never asked to be a hero — it earns its place by being the
 * literal subject (the tools) rather than decoration.
 *
 * Every technology name comes from the dictionary. Nothing is invented here.
 */
export default function Technology() {
  const { t } = useI18n();

  return (
    <section id="stack" className="relative py-rhythm-m bg-base-deep overflow-x-clip">
      <Shell>
        <div className="grid-12 items-end gap-y-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-7">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
              07 / {t.stack.eyebrow}
            </span>
            <h2 className="display text-d-l text-ink mt-6 max-w-[11ch]">{t.stack.title}</h2>
          </div>
          <p className="col-span-12 md:col-span-4 md:col-start-9 text-body text-ink-2">
            {t.stack.sub}
          </p>
        </div>

        <div className="grid-12 gap-y-12 items-start">
          {/* the specimen rows */}
          <div className="col-span-12 lg:col-span-9 border-t border-line">
            {t.stack.groups.map((g, i) => (
              <Reveal key={g.title} delay={i % 3} className="group border-b border-line">
                <div className="grid-12 items-baseline gap-y-3 py-7 md:py-9">
                  <span className="col-span-2 md:col-span-1 font-mono text-[0.625rem] text-ink-3 transition-colors duration-300 group-hover:text-signal">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="col-span-10 md:col-span-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-2">
                    {g.title}
                  </span>
                  <p className="col-span-12 md:col-span-8 display text-d-s text-ink-2 leading-[1.3]">
                    {g.items.map((item, j) => (
                      <span key={item}>
                        <span className="transition-colors duration-200 hover:text-signal cursor-default">
                          {item}
                        </span>
                        {j < g.items.length - 1 && <span className="text-ink-3"> / </span>}
                      </span>
                    ))}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* the toolkit — narrow, offset, never larger than its source */}
          <Reveal className="col-span-12 lg:col-span-2 lg:col-start-11 lg:pt-24">
            <div className="relative aspect-[3/5] w-2/3 sm:w-1/2 lg:w-full max-w-[280px] overflow-hidden">
              <Image
                src="/lifestyle-accessories.jpg"
                alt="Инструменты: техника, разложенная на графитовой поверхности"
                fill
                quality={86}
                sizes="(max-width:1024px) 45vw, 18vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'rgba(12,13,15,0.28)' }}
              />
            </div>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

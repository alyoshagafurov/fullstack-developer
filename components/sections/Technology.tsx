'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 07 — Technology.
 *
 * Compositional idea: A COLOPHON.
 *
 * The stack is set as one continuous run of large serif text — a single
 * paragraph, not rows and not chips. Group names are dropped inline as small
 * sans markers inside the flow, so the block reads like the credits page at
 * the back of a magazine. There is no heading and no grid: the paragraph is
 * the composition, and the only structure is where the lines happen to break.
 *
 * The toolkit photograph overlaps the text block's top-right corner rather
 * than sitting beside it. At 736px wide the source comfortably carries a
 * column this size and nothing larger.
 *
 * Every name comes from the dictionary; nothing here is invented.
 */
export default function Technology() {
  const { t } = useI18n();

  return (
    <section id="stack" className="relative beat-tight bg-base-deep overflow-x-clip">
      <Shell>
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-[16px] mb-[48px] md:mb-[64px]">
          <span className="label">07 — {t.stack.eyebrow}</span>
        </div>

        <h2 className="sr-only">{t.stack.title}</h2>
        <div className="relative">
          {/* the object, overlapping the corner of the text */}
          <Reveal className="hidden md:block absolute -top-[32px] right-0 w-[150px] lg:w-[190px] z-10">
            <div className="relative aspect-[736/1307] overflow-hidden">
              <Image
                src="/lifestyle-accessories.jpg"
                alt="Инструменты: техника, разложенная на графитовой поверхности"
                fill
                quality={84}
                sizes="190px"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'rgba(26,31,38,0.30)' }}
              />
            </div>
          </Reveal>

          {/* the colophon */}
          <Reveal>
            <p className="display text-[clamp(1.5rem,3.4vw,2.75rem)] leading-[1.35] text-ink-2 max-w-[26ch] sm:max-w-[34ch] md:max-w-none md:pr-[210px] lg:pr-[260px]">
              {t.stack.groups.map((g, gi) => (
                <span key={g.title}>
                  <span className="align-middle mr-[12px] text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 whitespace-nowrap">
                    {g.title}
                  </span>
                  {g.items.map((item, i) => (
                    <span key={item}>
                      <span className="transition-colors duration-200 hover:text-signal cursor-default">
                        {item}
                      </span>
                      {i < g.items.length - 1 && <span className="text-ink-3">, </span>}
                    </span>
                  ))}
                  {gi < t.stack.groups.length - 1 && (
                    <span aria-hidden className="text-signal px-[8px]">/</span>
                  )}
                </span>
              ))}
            </p>
          </Reveal>

          <Reveal delay={1}>
            <p className="text-[13px] leading-[1.6] text-ink-3 mt-[32px] max-w-[40ch]">
              {t.stack.sub}
            </p>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

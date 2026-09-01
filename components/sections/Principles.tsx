'use client';

import { useState } from 'react';
import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 06 — Principles.
 *
 * Compositional idea: A MANIFESTO PAGE.
 *
 * No heading, no eyebrow row, no supporting column. The statements themselves
 * are the section: set large in the serif, one per line, with a progressive
 * indent so the left edge steps away down the page. The supporting sentence
 * sits directly underneath in small sans — extreme scale contrast inside a
 * single unit rather than across columns.
 *
 * A narrow vertical photograph runs down the outer margin as a stripe. It is
 * 736px wide in the source, which is exactly right for a column this narrow
 * and would be wrong for anything larger.
 *
 * Pointing at one statement dims the rest — state-driven, so it works from the
 * keyboard too, and it only touches opacity.
 */
export default function Principles() {
  const { t } = useI18n();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="principles" className="relative beat-tight overflow-x-clip">
      <Shell>
        <h2 className="sr-only">{t.why.title}</h2>
        <div className="grid-12 gap-y-[48px]">
          {/* the manifesto */}
          <ul
            className="col-span-12 lg:col-span-9"
            onMouseLeave={() => setActive(null)}
          >
            {t.why.items.map((item, i) => {
              const dimmed = active !== null && active !== i;
              return (
                <Reveal as="li" key={item.t} delay={i % 4}>
                  <div
                    tabIndex={0}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    style={{ paddingLeft: `${Math.min(i, 5) * 3}%` }}
                    className={`py-[16px] md:py-[24px] outline-none transition-opacity duration-300
                                focus-visible:ring-1 focus-visible:ring-signal/70
                                focus-visible:ring-offset-4 focus-visible:ring-offset-base
                                ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                  >
                    <h3 className="display text-[clamp(1.75rem,4.2vw,3.5rem)] leading-[1.02] text-ink">
                      {item.t}
                      <span
                        aria-hidden
                        className={`transition-opacity duration-300 ${
                          active === i ? 'text-signal opacity-100' : 'opacity-0'
                        }`}
                      >
                        .
                      </span>
                    </h3>
                    <p className="text-[13px] leading-[1.6] text-ink-3 mt-[8px] max-w-[44ch]">
                      {item.d}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>

          {/* the stripe — a narrow column at a size the source actually supports */}
          <Reveal className="hidden lg:block col-span-2 col-start-11">
            <div className="sticky top-[128px]">
              <div className="relative aspect-[736/920] w-full overflow-hidden">
                <Image
                  src="/lifestyle-macbook.jpg"
                  alt="Рабочее место: планшет, наушники и часы на тёмном дереве"
                  fill
                  quality={84}
                  sizes="16vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'rgba(12,13,15,0.42)' }}
                />
              </div>
              <span className="label text-[11px] block mt-[12px]">
                {String(t.why.items.length).padStart(2, '0')} принципов
              </span>
            </div>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

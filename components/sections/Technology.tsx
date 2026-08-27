'use client';

import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 06 — Technology.
 *
 * Composition: typographic mass. The stack is set as running text at heading
 * scale rather than as chips in boxes — the words themselves make the texture.
 * Each group is a hairline row with its label held left in mono, so the block
 * reads as a specimen sheet.
 *
 * The signal colour appears only under the cursor.
 */
export default function Technology() {
  const { t } = useI18n();

  return (
    <section id="stack" className="relative py-rhythm-m">
      <Shell>
        <div className="grid-12 mb-14 md:mb-20">
          <div className="col-span-12 md:col-span-7">
            <Meta rule className="mb-6">06 — {t.stack.eyebrow}</Meta>
            <h2 className="display text-d-l text-ink max-w-[12ch]">{t.stack.title}</h2>
          </div>
          <p className="col-span-12 md:col-span-4 md:col-start-9 self-end text-body text-ink-2 mt-6 md:mt-0">
            {t.stack.sub}
          </p>
        </div>

        <div className="border-t border-line">
          {t.stack.groups.map((g, i) => (
            <Reveal key={g.title} delay={i} className="border-b border-line">
              <div className="grid-12 items-baseline gap-y-4 py-8 md:py-10">
                <span className="col-span-12 md:col-span-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-3">
                  {g.title}
                </span>
                <p className="col-span-12 md:col-span-9 display text-d-s text-ink-2 leading-[1.35]">
                  {g.items.map((item, j) => (
                    <span key={item}>
                      <span className="transition-colors duration-200 hover:text-signal cursor-default">
                        {item}
                      </span>
                      {j < g.items.length - 1 && <span className="text-ink-3">, </span>}
                    </span>
                  ))}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

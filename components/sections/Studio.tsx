'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * About — daylight.
 *
 * The one panel on the page lit by a window rather than an LED: warm paper,
 * the photograph exactly as shot in the bright room, and the facts as a
 * small ledger. It carries no light edge because it needs none; the contrast
 * with the room around it is the whole idea.
 */
export default function Studio() {
  const { t } = useI18n();
  const a = t.about;

  return (
    <section id="studio" className="beat relative scroll-mt-20">
      <Shell>
        <Rail>
          <h2 className="display m-0 max-w-[20ch] text-d-m text-ink">{a.title}</h2>
        </Rail>
        <Reveal className="mt-8">
          <Panel
            tone="day"
            edge="none"
            className="grid gap-10 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-6">
              <div className="max-w-[48ch] space-y-4">
                <p className="m-0 text-[15px] leading-[1.7] text-day-2">{a.p1}</p>
                <p className="m-0 text-[15px] leading-[1.7] text-day-2">{a.p2}</p>
              </div>

              {/* The facts as a ledger on hairlines — rows, not boxes in a box. */}
              <dl className="m-0 mt-8 border-t border-day-edge">
                {a.facts.map((fact) => (
                  <div key={fact.k} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-day-edge py-3">
                    <dt className="pt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-day-2">{fact.k}</dt>
                    <dd className="m-0 text-[13px] font-medium text-day-ink">{fact.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-panel lg:aspect-auto lg:h-full lg:min-h-[440px]">
                <Image
                  src="/about-portrait.jpg"
                  alt="Алишер Гафуров за работой в светлой комнате"
                  fill
                  sizes="(max-width:1024px) 100vw, 46vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </Panel>
        </Reveal>
      </Shell>
    </section>
  );
}

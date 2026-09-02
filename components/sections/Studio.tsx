'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * About — portrait panel beside a copy panel.
 *
 * Was a spread: the photograph bled past the grid to the page edge and the
 * word "About" ran vertically down the gutter, stitching the halves together.
 * Neither survives a bento layout — a full-bleed image has no corner radius to
 * share with its neighbours, and type set in the gutter needs a gutter, which
 * a gap-separated grid does not have.
 *
 * The photograph is still used exactly as shot: no filter, no retouch, no
 * recolour. The only overlay is a scrim on its outer edge, and it never
 * reaches the face.
 *
 * The ledger of facts keeps hairline rows inside its panel — it is a table of
 * values, and a table is the one thing here that should still read as rows
 * rather than as blocks.
 */
export default function Studio() {
  const { t } = useI18n();
  const a = t.about;

  return (
    <section id="studio" className="relative beat overflow-x-clip">
      <Shell>
        <header className="mb-8 md:mb-10">
          <span className="label">{a.eyebrow}</span>
          <h2 className="display text-d-s text-ink mt-3 max-w-[20ch]">{a.title}</h2>
        </header>

        <div className="grid gap-3 lg:grid-cols-12">
          {/* The portrait. 3:2 is the source ratio, so it is shown whole. */}
          <Reveal className="lg:col-span-6">
            <Panel className="h-full overflow-hidden p-0">
              <div className="relative aspect-[3/2] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[420px]">
                <Image
                  src="/about-portrait-dark-office.jpg"
                  alt="Алишер Гафуров — портрет"
                  fill
                  quality={92}
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 lg:block"
                  style={{
                    background: 'linear-gradient(90deg, rgba(12,13,15,0.72) 0%, transparent 100%)',
                  }}
                />
              </div>
            </Panel>
          </Reveal>

          {/* The prose. */}
          <Reveal className="lg:col-span-6">
            <Panel className="h-full p-6 md:p-8">
              <div className="space-y-5">
                <p className="m-0 text-[15px] leading-[1.7] text-ink-2">{a.p1}</p>
                <p className="m-0 text-[15px] leading-[1.7] text-ink-2">{a.p2}</p>
                <p className="m-0 text-[15px] leading-[1.7] text-ink-3">{a.p3}</p>
              </div>
            </Panel>
          </Reveal>

          {/* The ledger, spanning the full width beneath both. */}
          <Reveal delay={1} className="lg:col-span-12">
            <Panel className="px-6 py-2 md:px-8">
              <dl className="m-0 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                {a.facts.map((fact) => (
                  <div
                    key={fact.k}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-4 last:border-b-0 lg:border-b-0"
                  >
                    <dt className="label text-[10px]">{fact.k}</dt>
                    <dd className="m-0 text-right text-[14px] text-ink">{fact.v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

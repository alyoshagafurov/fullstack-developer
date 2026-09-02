'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Process — the steps as a bento row.
 *
 * Was a ladder zig-zagging across a central spine, which is a good device and
 * the wrong one here: it needs a great deal of height to read, and it aligns
 * to nothing, so it cannot sit in a grid with the sections around it. The
 * steps are now panels of equal weight, in order, left to right.
 *
 * The workspace photograph stays, but as a cell in the same grid rather than
 * an object floating beneath it — in the references a photo is a panel like
 * any other. It is a 735px source, so it is only ever cropped, never stretched.
 */
export default function Method() {
  const { t } = useI18n();

  return (
    <section id="process" className="relative beat overflow-x-clip">
      <Shell>
        <header className="mb-8 grid gap-4 md:mb-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <span className="label">{t.process.eyebrow}</span>
            <h2 className="display text-d-s text-ink mt-3">{t.process.title}</h2>
          </div>
          <p className="m-0 text-[14px] leading-[1.6] text-ink-2 md:col-span-5 md:col-start-8">
            {t.process.sub}
          </p>
        </header>

        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map((step, index) => (
            <Reveal as="li" key={step.n} delay={index % 3}>
              <Panel className="group h-full p-6 transition-colors duration-200 hover:border-line-2 md:p-7">
                <span
                  aria-hidden
                  className="font-mono text-[11px] tracking-[0.16em] text-ink-3
                             transition-colors duration-200 group-hover:text-ink-2"
                >
                  {step.n}
                </span>
                <h3 className="mb-2 mt-4 text-[17px] font-medium leading-tight tracking-tight text-ink">
                  {step.t}
                </h3>
                <p className="m-0 text-[14px] leading-[1.6] text-ink-2">{step.d}</p>
              </Panel>
            </Reveal>
          ))}

          {/* The photograph closes the row, cropped to a letterbox so it reads
              as a band rather than competing with the step panels above it. */}
          <Reveal as="li" className="sm:col-span-2 lg:col-span-4">
            <Panel className="overflow-hidden p-0">
              <figure className="m-0">
                <div className="relative aspect-[735/247] w-full overflow-hidden">
                  <Image
                    src="/workspace-detail.jpg"
                    alt="Рабочий стол поздним вечером"
                    fill
                    quality={86}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="label text-[11px] px-6 py-4 md:px-7">
                  Dushanbe · 23:11
                </figcaption>
              </figure>
            </Panel>
          </Reveal>
        </ol>
      </Shell>
    </section>
  );
}

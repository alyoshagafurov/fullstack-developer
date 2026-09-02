'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Technology — one panel per group of the stack.
 *
 * Was a colophon: the whole stack set as a single run of large serif text with
 * the group names dropped inline. It read well, and it does not survive the
 * move to monochrome bento — the effect depended on the serif and on having no
 * grid at all.
 *
 * Each group is now a panel and each tool a chip inside it, which is also the
 * more useful shape: a visitor scanning for one technology finds it in a
 * labelled block instead of mid-sentence.
 *
 * The toolkit photograph becomes a tall cell at the end of the row rather than
 * an object overlapping a corner. Its source is 736×1307, so a narrow portrait
 * panel is the one place it goes without being upscaled.
 */
export default function Technology() {
  const { t } = useI18n();

  return (
    <section id="stack" className="relative beat-tight overflow-x-clip">
      <Shell>
        <header className="mb-8 grid gap-4 md:mb-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <span className="label">{t.stack.eyebrow}</span>
            <h2 className="display text-d-s text-ink mt-3">{t.stack.title}</h2>
          </div>
          <p className="m-0 text-[14px] leading-[1.6] text-ink-2 md:col-span-5 md:col-start-8">
            {t.stack.sub}
          </p>
        </header>

        <div className="grid gap-3 lg:grid-cols-4">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:col-span-3">
            {t.stack.groups.map((group, index) => (
              <Reveal as="li" key={group.title} delay={index % 3}>
                <Panel className="h-full p-6 md:p-7">
                  <span className="label text-[10px]">{group.title}</span>
                  <ul className="mt-4 flex list-none flex-wrap gap-1.5 p-0">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-pill border border-line px-2.5 py-1 text-[12px] leading-none text-ink-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Panel>
              </Reveal>
            ))}
          </ul>

          {/* Portrait cell, matching the source's own orientation. Hidden below
              lg: at one column it would be a very tall image carrying nothing
              the panels above do not already say. */}
          <Reveal className="hidden lg:block">
            <Panel className="h-full overflow-hidden p-0">
              <div className="relative h-full min-h-[280px] w-full">
                <Image
                  src="/lifestyle-accessories.jpg"
                  alt="Инструменты: техника, разложенная на графитовой поверхности"
                  fill
                  quality={84}
                  sizes="320px"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'rgba(7,8,9,0.38)' }}
                />
              </div>
            </Panel>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Principles — the statements as panels.
 *
 * Was a manifesto page: each statement set large in the serif with a
 * progressive indent, and hovering one dimmed the rest. Both devices go. The
 * indent depended on there being no grid to align to, and the dimming spent a
 * client-side state hook to make eleven lines of text slightly more
 * theatrical — the references hold statements in blocks and let the reader
 * choose where to look.
 *
 * The photograph keeps its narrow column, now as a panel spanning the row's
 * full height. Its source is 736×920, which is right for a column this width
 * and wrong for anything larger.
 */
export default function Principles() {
  const { t } = useI18n();

  return (
    <section id="principles" className="relative beat-tight overflow-x-clip">
      <Shell>
        <header className="mb-8 md:mb-10">
          <span className="label">
            {String(t.why.items.length).padStart(2, '0')} принципов
          </span>
          <h2 className="display text-d-s text-ink mt-3">{t.why.title}</h2>
        </header>

        <div className="grid gap-3 lg:grid-cols-4">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:col-span-3">
            {t.why.items.map((item, index) => (
              <Reveal as="li" key={item.t} delay={index % 4}>
                <Panel className="h-full p-6 md:p-7">
                  <h3 className="m-0 text-[17px] font-medium leading-tight tracking-tight text-ink">
                    {item.t}
                  </h3>
                  <p className="m-0 mt-3 text-[14px] leading-[1.6] text-ink-2">{item.d}</p>
                </Panel>
              </Reveal>
            ))}
          </ul>

          <Reveal className="hidden lg:block">
            <Panel className="h-full overflow-hidden p-0">
              <div className="relative h-full min-h-[320px] w-full">
                <Image
                  src="/lifestyle-macbook.jpg"
                  alt="Рабочее место: планшет, наушники и часы на тёмном дереве"
                  fill
                  quality={84}
                  sizes="320px"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'rgba(12,13,15,0.42)' }}
                />
              </div>
            </Panel>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

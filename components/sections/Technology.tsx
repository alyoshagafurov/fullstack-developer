'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Technology — the stack as a specification table.
 *
 * One panel, six rows: the group down the left, its tools as chips across
 * the right, hairlines between. A visitor scanning for one technology finds
 * it in a labelled row instead of a box. The toolkit photograph is the tall
 * panel beside it — a 736×1307 source, so a narrow portrait is the one place
 * it goes without being upscaled.
 */
export default function Technology() {
  const { t } = useI18n();

  return (
    <section id="stack" className="beat-tight relative">
      <Shell>
        <Rail>
          <h2 className="display m-0 text-d-m text-ink">{t.stack.title}</h2>
        </Rail>
        <p className="m-0 mt-5 max-w-[52ch] text-[14px] leading-[1.6] text-ink-2">{t.stack.sub}</p>

        <Reveal className="mt-10">
          <div className="grid gap-2 lg:grid-cols-12">
            <Panel className="lg:col-span-8">
              <dl className="m-0">
                {t.stack.groups.map((group, index) => (
                  <div
                    key={group.title}
                    className={`grid gap-3 px-6 py-5 md:grid-cols-[minmax(0,12rem)_1fr] md:gap-8 md:px-8 ${
                      index > 0 ? 'border-t border-edge' : ''
                    }`}
                  >
                    <dt className="label pt-2">{group.title}</dt>
                    <dd className="m-0 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span key={item} className="chip">
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel edge="none" className="relative hidden overflow-hidden lg:col-span-4 lg:block">
              <Image
                src="/lifestyle-accessories.jpg"
                alt="Инструменты: техника, разложенная на графитовой поверхности"
                fill
                sizes="(max-width:1024px) 0px, 30vw"
                className="object-cover"
              />
            </Panel>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

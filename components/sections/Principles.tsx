'use client';

import Image from 'next/image';

import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Principles — a ledger, not a grid of cards.
 *
 * Eight statements in one panel, each a row of title and sentence divided by
 * a hairline, with the wall-mounted photograph as a second panel beside it.
 * Eight identical cards would have been the category default; a ledger is
 * how a studio lists what it stands for.
 */
export default function Principles() {
  const { t } = useI18n();

  return (
    <section id="principles" className="beat-tight relative">
      <Shell>
        <Rail count={String(t.why.items.length).padStart(2, '0')}>
          <h2 className="display m-0 text-d-m text-ink">{t.why.title}</h2>
        </Rail>

        <Reveal className="mt-10">
          <div className="grid gap-2 lg:grid-cols-12">
            <Panel className="lg:col-span-8">
              <ul className="m-0 list-none p-0">
                {t.why.items.map((item, index) => (
                  <li
                    key={item.t}
                    className={`grid gap-1 px-6 py-5 md:grid-cols-[minmax(0,13rem)_1fr] md:gap-8 md:px-8 ${
                      index > 0 ? 'border-t border-edge' : ''
                    }`}
                  >
                    <h3 className="m-0 text-[15px] font-medium leading-tight text-ink">{item.t}</h3>
                    <p className="m-0 text-[14px] leading-[1.6] text-ink-2">{item.d}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel edge="none" className="relative hidden overflow-hidden lg:col-span-4 lg:block">
              <Image
                src="/lifestyle-macbook.jpg"
                alt="Рабочее место: планшет, наушники и часы на тёмном дереве"
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

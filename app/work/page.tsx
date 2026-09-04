import Link from 'next/link';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import Action from '@/components/ui/Action';
import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import { listPublishedCases } from '@/lib/cases';
import { SITE_URL } from '@/lib/seo';

/*
 * /work — the case register.
 *
 * Its own page rather than a band on the landing: a page owes nothing to what
 * follows and can simply be the list, at whatever length the list happens to
 * be. Each case is a panel with a lit edge; the first one is double width,
 * because a register where every item is the same size has no first item.
 *
 * An empty register says so. It never pretends with placeholder cards.
 *
 * Entirely a server component. Nothing here is interactive, so nothing here
 * ships JavaScript beyond the shared chrome.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Работы — Alisher Gafurov',
  description: 'Проекты: сайты, веб-приложения, интеграции и автоматизация.',
  alternates: { canonical: `${SITE_URL}/work` },
};

export default async function WorkPage() {
  const cases = await listPublishedCases();

  return (
    <>
      <Header />
      <main id="main" className="shell pb-24 pt-28 md:pt-32">
        <Rail label="Работы">{cases.length > 0 ? String(cases.length).padStart(2, '0') : undefined}</Rail>

        <header className="mb-10 md:mb-14">
          <h1 className="display max-w-[18ch] text-d-l text-ink">Проекты, которые уже работают</h1>
        </header>

        {cases.length === 0 ? (
          /* Honest rather than decorative: the register is empty, and the two
             places that are not empty are one step away. */
          <Panel tone="raised" className="px-6 py-10 md:px-10 md:py-14">
            <p className="m-0 max-w-[40ch] text-[16px] leading-[1.6] text-ink">
              Пока ни одного опубликованного кейса.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Action href="/services" variant="ghost">
                Услуги
                <span aria-hidden>→</span>
              </Action>
              <Action href="/start-project" variant="signal">
                Обсудить проект
              </Action>
            </div>
          </Panel>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((item, index) => (
              <li key={item.id} className={index === 0 ? 'sm:col-span-2' : undefined}>
                <Panel as={Link} href={`/work/${item.slug}`} className="group flex h-full flex-col">
                  {/* A fixed aspect on every card keeps the grid from going
                      ragged when one case has a tall screenshot and the next
                      a wide one. */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-panel bg-base-deep">
                    {item.cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.cover}
                        alt=""
                        className="h-full w-full object-cover object-top transition-transform
                                   duration-300 ease-out group-hover:scale-[1.02]"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="label text-[10px]">Без скриншота</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="m-0 text-[16px] font-medium leading-tight text-ink">{item.title}</h2>
                      {item.year && <span className="label shrink-0 text-[10px]">{item.year}</span>}
                    </div>

                    {item.summary && (
                      <p className="m-0 text-[14px] leading-[1.55] text-ink-2">{item.summary}</p>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-4 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {item.technologies.slice(0, 5).map((tech) => (
                          <span key={tech} className="chip">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span
                        aria-hidden
                        className="text-ink-3 transition-transform duration-300 ease-out
                                   group-hover:translate-x-1 group-hover:text-copper"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

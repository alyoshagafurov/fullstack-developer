import Link from 'next/link';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import { listPublishedCases } from '@/lib/cases';
import { SITE_URL } from '@/lib/seo';

/*
 * /work — the case register.
 *
 * Its own page rather than a band on the landing. A landing section has to
 * justify its length against everything under it, so it always ends up as
 * three teasers; a page owes nothing to what follows and can simply be the
 * list, at whatever length the list happens to be.
 *
 * The layout is the reference's bento: soft-cornered panels on a near-black
 * field, separated by gap rather than by rules. The first case gets a
 * double-width panel, because a register where every item is the same size has
 * no first item — and the newest work should read as the first item.
 *
 * Entirely a server component. Nothing here is interactive, so nothing here
 * ships JavaScript.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Работы — Alisher Gafurov',
  description: 'Проекты: сайты, веб-приложения, интеграции и автоматизация.',
  alternates: { canonical: `${SITE_URL}/work` },
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-line px-2.5 py-1 text-[11px] leading-none text-ink-2">
      {children}
    </span>
  );
}

export default async function WorkPage() {
  const cases = await listPublishedCases();

  return (
    <>
      <Header />
      <main id="main" className="px-gutter pt-[104px] pb-24">
        <div className="mx-auto w-full max-w-shell">
          <header className="mb-10 md:mb-14">
            <span className="label">Работы</span>
            <h1 className="display text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] text-ink mt-4">
              Проекты, которые уже работают
            </h1>
          </header>

          {cases.length === 0 ? (
            /* Honest rather than decorative. An empty register that pretends
               to be full with placeholder cards is worse than one that says
               it is empty. */
            <div className="rounded-panel border border-line bg-surface-low p-10 text-center">
              <p className="text-ink-2 m-0">Пока ни одного опубликованного кейса.</p>
            </div>
          ) : (
            <ul className="grid list-none gap-4 p-0 m-0 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((item, index) => (
                <li key={item.id} className={index === 0 ? 'sm:col-span-2' : undefined}>
                  <Link
                    href={`/work/${item.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-panel
                               border border-line bg-surface-low transition-colors duration-200
                               hover:border-line-2"
                  >
                    {/* A fixed aspect on every card keeps the grid from going
                        ragged when one case has a tall screenshot and the next
                        a wide one. */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-base-deep">
                      {item.cover ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.cover}
                          alt=""
                          className="h-full w-full object-cover object-top transition-transform
                                     duration-500 ease-out group-hover:scale-[1.03]"
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
                        <h2 className="m-0 text-[17px] font-medium leading-tight text-ink">
                          {item.title}
                        </h2>
                        {item.year && <span className="label text-[10px] shrink-0">{item.year}</span>}
                      </div>

                      {item.summary && (
                        <p className="m-0 text-[14px] leading-[1.55] text-ink-2">{item.summary}</p>
                      )}

                      {item.technologies.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                          {item.technologies.slice(0, 5).map((tech) => (
                            <Pill key={tech}>{tech}</Pill>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import Action from '@/components/ui/Action';
import Arrow from '@/components/ui/Arrow';
import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import { ru } from '@/lib/i18n/ru';
import { SITE_URL } from '@/lib/seo';
import { services } from '@/lib/services';

/*
 * /services — the whole catalogue.
 *
 * The landing shows five services; all fourteen live here as one ledger
 * inside one panel — a numbered index is faster to scan than a wall of
 * tiles, and at fourteen a grid of cards would be a wall. Each row is a link
 * to its page, and the line under a row lights as the pointer reaches it.
 *
 * The service texts are the owner's and Russian only (see lib/services.ts);
 * the section's own strings are read straight from the Russian dictionary
 * for the same reason.
 */

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Услуги — Alisher Gafurov',
  description: 'Сайты, веб-приложения, мобильные приложения, боты, автоматизация и поддержка.',
  alternates: { canonical: `${SITE_URL}/services` },
};

export default function ServicesIndex() {
  const s = ru.servicesSection;

  return (
    <>
      <Header />
      <main id="main" className="shell pb-24 pt-28 md:pt-32">
        <Rail count={String(services.length).padStart(2, '0')}>
          <h1 className="display m-0 max-w-[16ch] text-d-l text-ink">Что я делаю</h1>
        </Rail>
        <p className="m-0 mb-10 mt-5 max-w-[44ch] text-[15px] leading-[1.6] text-ink-2 md:mb-14">{s.sub}</p>

        <Panel>
          <ol className="m-0 list-none p-0">
            {services.map((service, index) => (
              <li key={service.slug} className={index > 0 ? 'border-t border-edge' : ''}>
                <Link
                  href={`/services/${service.slug}`}
                  className="lnk group grid min-h-[64px] grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4
                             px-5 py-4 md:grid-cols-[3rem_minmax(0,22rem)_minmax(0,1fr)_auto] md:gap-x-8 md:px-8"
                >
                  <span
                    aria-hidden
                    className="display text-[13px] tabular-nums text-ink-3 transition-colors duration-200 group-hover:text-copper"
                  >
                    {service.num}
                  </span>
                  <span className="text-[15px] font-medium uppercase leading-[1.25] tracking-[0.02em] text-ink">
                    {service.title}
                  </span>
                  <Arrow
                    className="justify-self-end text-ink-3 transition-transform duration-300 ease-out
                               group-hover:translate-x-1 group-hover:text-copper md:col-start-4"
                  />
                  <span className="col-span-3 row-start-2 text-[13px] leading-[1.5] text-ink-3 md:col-span-1 md:col-start-3 md:row-start-1">
                    {service.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          tone="raised"
          className="mt-3 flex flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-9"
        >
          <div>
            <p className="m-0 text-[15px] font-medium uppercase tracking-[0.04em] text-ink">{s.helpTitle}</p>
            <p className="m-0 mt-1.5 max-w-[48ch] text-[13px] leading-[1.55] text-ink-3">{s.helpSub}</p>
          </div>
          <Action href="/start-project" variant="ghost" className="shrink-0">
            {s.helpCta}
            <Arrow />
          </Action>
        </Panel>
      </main>
      <SiteFooter />
    </>
  );
}

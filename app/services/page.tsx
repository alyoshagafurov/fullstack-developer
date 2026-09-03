import Link from 'next/link';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import { SITE_URL } from '@/lib/seo';
import { services } from '@/lib/services';

/*
 * /services — the whole catalogue.
 *
 * The landing section shows five cards, which is the right number for a
 * section and the wrong number for a catalogue. All fourteen live here, as a
 * list rather than as cards: at this length a grid of tiles becomes a wall,
 * and a numbered index is faster to scan than anything decorated.
 */

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Услуги — Alisher Gafurov',
  description: 'Сайты, веб-приложения, мобильные приложения, боты, автоматизация и поддержка.',
  alternates: { canonical: `${SITE_URL}/services` },
};

export default function ServicesIndex() {
  return (
    <>
      <Header />
      <main id="main" className="px-gutter pb-24 pt-[104px]">
        <div className="mx-auto w-full max-w-shell">
          <header className="mb-12 md:mb-16">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-3">
              Услуги
              <span aria-hidden className="h-px w-8 bg-line-2" />
              <span aria-hidden className="h-1 w-1 rounded-full bg-copper" />
            </span>
            <h1
              className="mt-7 max-w-[20ch] text-[clamp(2rem,1.2rem+2.6vw,3.4rem)] font-light
                         uppercase leading-[1.08] tracking-[-0.015em] text-ink"
            >
              Что я делаю
            </h1>
          </header>

          <ul className="m-0 list-none p-0">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 gap-y-2
                             border-b border-line py-6 transition-colors hover:border-line-2
                             md:grid-cols-[auto_minmax(0,22ch)_1fr_auto] md:gap-x-10"
                >
                  <span
                    aria-hidden
                    className="text-[12px] tabular-nums text-ink-3 transition-colors duration-300 group-hover:text-copper"
                  >
                    {service.num}
                  </span>

                  <span className="text-[17px] font-light uppercase tracking-[0.01em] text-ink md:text-[19px]">
                    {service.title}
                  </span>

                  <span className="col-span-2 text-[13px] leading-[1.55] text-ink-3 md:col-span-1">
                    {service.tagline}
                  </span>

                  <span
                    aria-hidden
                    className="justify-self-end text-ink-3 transition-all duration-300
                               group-hover:translate-x-1 group-hover:text-copper"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

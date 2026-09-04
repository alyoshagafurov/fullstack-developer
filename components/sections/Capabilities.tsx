'use client';

import Link from 'next/link';

import Action from '@/components/ui/Action';
import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import Reveal from '@/components/ui/Reveal';
import ServicePreview from '@/components/ui/ServicePreview';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';
import { featuredServices, services } from '@/lib/services';

/*
 * Services.
 *
 * The claim and the owner's three figures on one line, then the five
 * featured services as a stack of low, wide drawers: no border, no handle,
 * a seam of light along the top of each that brightens under the pointer.
 * The drawing sits at the far end of the drawer, the arrow past it. Every
 * drawer is a link to its page — that is the point of the section.
 *
 * Five, not fourteen. The catalogue in lib/services.ts holds all fourteen and
 * every one of them has a page; the line under the stack leads there.
 */
export default function Capabilities() {
  const { t } = useI18n();
  const s = t.servicesSection;

  return (
    <section id="services" className="beat relative scroll-mt-20">
      <Shell>
        <Rail label={s.eyebrow}>{String(services.length).padStart(2, '0')}</Rail>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h2 className="display max-w-[22ch] text-d-m text-ink">
              {s.titleA} <span className="text-copper">{s.titleB}</span>
            </h2>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-[1.7] text-ink-2">{s.sub}</p>
          </div>

          {/* Three figures on one line, divided by hairlines rather than boxed. */}
          <dl className="m-0 grid grid-cols-3 self-end lg:col-span-5">
            {s.stats.map((stat, index) => (
              <div key={stat.label} className={index > 0 ? 'border-l border-edge pl-5 lg:pl-7' : ''}>
                <dt className="display text-[clamp(1.4rem,1rem+1vw,1.9rem)] leading-none text-ink tabular-nums">
                  {stat.value}
                </dt>
                <dd className="m-0 mt-2 max-w-[14ch] text-[12px] leading-[1.45] text-ink-3">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal className="mt-12 lg:mt-16">
          <ol className="m-0 grid list-none gap-2 p-0">
            {featuredServices.map((service) => (
              <li key={service.slug}>
                <Panel
                  as={Link}
                  href={`/services/${service.slug}`}
                  className="group grid min-h-[96px] grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-5
                             md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)_8rem_auto] md:gap-x-8 md:px-8 md:py-4"
                >
                  <span
                    aria-hidden
                    className="display text-[13px] text-ink-3 tabular-nums transition-colors duration-200 group-hover:text-copper"
                  >
                    {service.num}
                  </span>
                  <h3 className="m-0 text-[15px] font-medium uppercase leading-[1.25] tracking-[0.02em] text-ink">
                    {service.title}
                  </h3>
                  <span
                    aria-hidden
                    className="justify-self-end text-ink-3 transition-transform duration-300 ease-out
                               group-hover:translate-x-1 group-hover:text-copper md:col-start-5"
                  >
                    →
                  </span>
                  <span className="col-span-3 row-start-2 text-[13px] leading-[1.55] text-ink-3 md:col-span-1 md:col-start-3 md:row-start-1">
                    {service.tagline}
                  </span>
                  <span aria-hidden className="hidden h-[64px] w-32 md:col-start-4 md:row-start-1 md:block">
                    {service.preview && <ServicePreview kind={service.preview} />}
                  </span>
                </Panel>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex justify-end">
            <Link
              href="/services"
              className="lnk group inline-flex min-h-[44px] items-center gap-3 text-[12px] uppercase
                         tracking-[0.18em] text-ink-3 hover:text-ink"
            >
              Все услуги
              <span aria-hidden className="tabular-nums text-copper">
                {String(services.length).padStart(2, '0')}
              </span>
              <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-4">
          <Panel
            tone="raised"
            className="flex flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-9"
          >
            <div>
              <p className="m-0 text-[15px] font-medium uppercase tracking-[0.04em] text-ink">{s.helpTitle}</p>
              <p className="m-0 mt-1.5 max-w-[48ch] text-[13px] leading-[1.55] text-ink-3">{s.helpSub}</p>
            </div>
            <Action href="/start-project" variant="ghost" className="shrink-0">
              {s.helpCta}
              <span aria-hidden>→</span>
            </Action>
          </Panel>
        </Reveal>
      </Shell>
    </section>
  );
}

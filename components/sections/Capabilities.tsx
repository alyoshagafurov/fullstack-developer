'use client';

import Link from 'next/link';

import Reveal from '@/components/ui/Reveal';
import ServicePreview from '@/components/ui/ServicePreview';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';
import { featuredServices, services } from '@/lib/services';

/*
 * Services.
 *
 * Three bands, in the reference's proportions: a wide header with the claim on
 * the left and three figures on the right, five equal cards in one row, and a
 * single help panel closing the section.
 *
 * Five cards, not fourteen. The catalogue in lib/services.ts holds all
 * fourteen and every one of them has a page; showing them all here would turn
 * a section into a price list. The five are the ones marked `featured`.
 *
 * Each card is a link, and that is the point of the section — the brief asks
 * for a page per service explaining what it is, what it gives you and who it
 * is for, and the card is how you reach it.
 *
 * The numerals are large and nearly unlit: decoration that gives the row a
 * rhythm, not information anybody reads.
 */
export default function Capabilities() {
  const { t } = useI18n();
  const s = t.servicesSection;

  return (
    <section id="services" className="relative beat">
      <Shell>
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-3">
              {s.eyebrow}
              <span aria-hidden className="h-px w-8 bg-line-2" />
              <span aria-hidden className="h-1 w-1 rounded-full bg-copper" />
            </span>

            <h2
              className="mt-7 max-w-[18ch] text-[clamp(1.9rem,1.1rem+2.5vw,3.1rem)] font-light
                         uppercase leading-[1.1] tracking-[-0.015em] text-ink"
            >
              {s.titleA} <span className="text-copper">{s.titleB}</span>
            </h2>

            <p className="mt-6 max-w-[42ch] text-[15px] leading-[1.7] text-ink-2">{s.sub}</p>

            <Link
              href="/start-project"
              className="group mt-9 inline-flex min-h-[44px] items-center gap-4 text-[12px]
                         uppercase tracking-[0.2em] text-ink transition-colors duration-300
                         hover:text-copper"
            >
              {s.cta}
              <span
                aria-hidden
                className="h-px w-10 bg-line-2 transition-all duration-300
                           group-hover:w-16 group-hover:bg-copper"
              />
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          {/* Three figures on one line, divided by hairlines rather than boxed. */}
          <dl className="m-0 grid grid-cols-3 self-start lg:col-span-5 lg:mt-2">
            {s.stats.map((stat, index) => (
              <div
                key={stat.label}
                className={index > 0 ? 'border-l border-line pl-5 lg:pl-7' : 'pr-5'}
              >
                <dt className="text-[clamp(1.5rem,1.1rem+1vw,2rem)] font-light leading-none text-ink tabular-nums">
                  {stat.value}
                </dt>
                <dd className="m-0 mt-3 max-w-[14ch] text-[12px] leading-[1.45] text-ink-3">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── The five cards ───────────────────────────────────────── */}
        <ul className="m-0 mt-14 grid list-none gap-3 p-0 sm:grid-cols-2 lg:mt-20 lg:grid-cols-5">
          {featuredServices.map((service, index) => (
            <Reveal as="li" key={service.slug} delay={index % 3}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-[18px] border border-line
                           bg-surface-low p-6 transition-all duration-300
                           hover:border-line-2 hover:bg-surface"
              >
                <span
                  aria-hidden
                  className="text-[clamp(2.5rem,3.4vw,3.4rem)] font-extralight leading-none
                             tracking-[-0.03em] text-ink/[0.13] transition-colors duration-300
                             group-hover:text-copper/40"
                >
                  {service.num}
                </span>

                <h3 className="mt-10 text-[15px] font-medium uppercase leading-[1.25] tracking-[0.01em] text-ink">
                  {service.title}
                </h3>

                <p className="mt-3 text-[13px] leading-[1.55] text-ink-3">{service.tagline}</p>

                {/* The drawing sits at the foot of the card and grows a little
                    on hover — the whole interaction, and nothing more. */}
                <div className="mt-8 h-[104px] w-full overflow-hidden">
                  {service.preview && (
                    <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                      <ServicePreview kind={service.preview} />
                    </div>
                  )}
                </div>

                <span
                  aria-hidden
                  className="mt-4 self-end text-[15px] text-ink-3 transition-all duration-300
                             group-hover:translate-x-1 group-hover:text-copper"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        {/* Five cards are a section; the catalogue is fourteen. Without this
            the other nine exist and are unreachable from the landing page. */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/services"
            className="group inline-flex min-h-[44px] items-center gap-3 text-[12px]
                       uppercase tracking-[0.18em] text-ink-3 transition-colors
                       duration-300 hover:text-ink"
          >
            Все услуги
            <span aria-hidden className="tabular-nums text-copper">
              {String(services.length).padStart(2, '0')}
            </span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        {/* ── Help panel ───────────────────────────────────────────── */}
        <Reveal>
          <div
            className="relative mt-3 overflow-hidden rounded-[18px] border border-line
                       bg-surface-low px-6 py-7 md:px-9"
          >
            {/* One thin wave, drawn rather than imported, sitting behind the
                text at the opacity of a watermark. */}
            <svg
              aria-hidden
              viewBox="0 0 900 120"
              fill="none"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-y-0 left-1/4 hidden h-full w-1/2 lg:block"
            >
              {[0, 7, 14, 21, 28].map((offset) => (
                <path
                  key={offset}
                  d={`M0 ${70 + offset} C 220 ${20 + offset} 420 ${104 + offset} 900 ${34 + offset}`}
                  stroke="rgba(192,153,111,0.30)"
                  strokeWidth="0.7"
                />
              ))}
            </svg>

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <span
                  aria-hidden
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-2 text-[15px] text-ink-2"
                >
                  ?
                </span>
                <div>
                  <p className="m-0 text-[15px] font-medium uppercase tracking-[0.04em] text-ink">
                    {s.helpTitle}
                  </p>
                  <p className="m-0 mt-1.5 text-[13px] leading-[1.55] text-ink-3">{s.helpSub}</p>
                </div>
              </div>

              <Link
                href="/start-project"
                className="group inline-flex min-h-[48px] shrink-0 items-center gap-4 rounded-pill
                           border border-line-2 px-7 text-[12px] uppercase tracking-[0.18em]
                           text-ink transition-colors duration-300 hover:border-copper
                           hover:text-copper"
              >
                {s.helpCta}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

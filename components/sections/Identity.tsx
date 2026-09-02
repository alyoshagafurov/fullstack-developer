'use client';

import Link from 'next/link';
import WaveField from '@/components/ui/WaveField';
import { useI18n } from '@/lib/i18n';

/*
 * 01 — Identity.
 *
 * Rebuilt to the reference: one dark panel, an abstract object holding the
 * middle of it, and the words kept deliberately small underneath.
 *
 * That restraint is the whole idea, and it is the opposite of what stood here
 * before — a portrait photograph with the name set enormous in a serif. A
 * masthead that shouts has to be believed; an object that is simply well made,
 * with four quiet lines under it, is believed before it is read.
 *
 * So: no photograph, no serif, no italic. The type is the grotesk at text
 * scale, the controls are pills, and the only filled element on the screen is
 * the primary action — which is what makes it read as primary without a colour
 * to announce it.
 */
export default function Identity() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative w-full px-gutter pt-[88px]">
      {/* The panel. Inset from the viewport on every side, because a bordered
          object floating on the page is the reference's basic unit — a
          full-bleed hero would be a different design language. */}
      <div
        className="relative w-full max-w-shell mx-auto overflow-hidden
                   rounded-panel border border-line bg-base-deep
                   min-h-[680px] md:min-h-[720px] lg:min-h-[calc(100svh-136px)]
                   flex flex-col justify-end"
      >
        <WaveField className="absolute inset-0 h-full w-full" />

        {/* The type sits on the panel's own floor so the object above it has
            room. A gradient rather than a flat overlay: a flat one would put a
            visible edge across the artwork. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[58%] pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.55) 32%, rgba(5,5,5,0.93) 62%, rgba(5,5,5,0.99) 100%)',
          }}
        />

        <div className="relative px-6 pb-8 md:px-10 md:pb-10 lg:px-14 lg:pb-14">
          <div className="hero-fade flex items-center gap-2.5 mb-6" style={{ animationDelay: '0.5s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-ink" aria-hidden />
            <span className="label">{t.hero.badge}</span>
          </div>

          <div
            className="hero-fade grid gap-y-8 lg:grid-cols-12 lg:items-end"
            style={{ animationDelay: '0.62s' }}
          >
            {/* The name, at text scale. */}
            <div className="lg:col-span-4">
              <h1 className="text-[clamp(1.75rem,1.2rem+1.8vw,2.6rem)] leading-[1.08] tracking-[-0.03em] font-medium text-ink">
                Alisher Gafurov
              </h1>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink-2 max-w-[36ch]">
                {t.hero.roleA} · {t.hero.roleB}
              </p>
            </div>

            {/* Four short columns, as the reference sets them — a ledger, not a
                paragraph. They read as specification, which is the tone the
                whole page is aiming for. */}
            <dl className="lg:col-span-4 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:gap-x-5">
              {[
                ['Focus', 'Web · Product'],
                ['Since', '2022'],
                ['Base', 'Dushanbe'],
                ['Stack', 'Full-Stack'],
              ].map(([term, value]) => (
                <div key={term}>
                  <dt className="label text-[10px]">{term}</dt>
                  {/* A ledger entry that wraps stops being a ledger entry —
                      "Web · Product" breaking after the dot reads as two
                      separate values rather than one. */}
                  <dd className="mt-1.5 text-[13px] leading-[1.4] text-ink-2 whitespace-nowrap">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* One filled, one outlined. The reference never puts two filled
                controls next to each other, and neither does this. */}
            <div className="lg:col-span-4 flex flex-wrap gap-2.5 lg:flex-nowrap lg:justify-end">
              <Link
                href="/work"
                className="inline-flex min-h-[44px] items-center rounded-pill bg-ink px-5 py-2.5
                           text-[13px] font-medium text-base transition-colors duration-200
                           hover:bg-signal-deep"
              >
                {t.hero.ctaWork}
              </Link>
              <Link
                href="/start-project"
                className="inline-flex min-h-[44px] items-center rounded-pill border border-line-2
                           px-5 py-2.5 text-[13px] font-medium text-ink transition-colors
                           duration-200 hover:border-ink hover:bg-[rgba(255,255,255,0.06)]"
              >
                {t.hero.ctaContact}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

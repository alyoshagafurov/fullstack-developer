'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n';

/*
 * The hero.
 *
 * Two zones and one piece of type holding them together: the claim on the
 * left, the photograph on the right, and "ЦИФРОВЫЕ ПРОДУКТЫ" set across the
 * seam at a size no headline would ever be.
 *
 * The word is what makes this a composition rather than a layout. It is
 * enormous, hairline-thin and almost transparent — closer to a watermark than
 * to text — so it reads as depth behind the photograph instead of competing
 * with the claim. That faintness is also what makes the overlap work: the
 * photograph is an opaque rectangle, and anything solid behind it would simply
 * be cut in half. At 7% it does not matter where the edge falls.
 *
 * Layers, back to front:
 *
 *   0   graphite ground, one soft overhead light, film grain
 *   10  the word
 *   20  the photograph, feathered on every side so it has air, not edges
 *   30  the claim
 *
 * Everything the brief struck out is absent: no service list, no statistics,
 * no client logos, no pricing, no cards. The hero ends where it ends.
 */

/* Film grain as a data URI rather than an asset — 400 bytes of SVG and no
   request. Very low opacity: it should be felt, never seen. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export default function Identity() {
  const { t } = useI18n();
  const h = t.hero;

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-base"
    >
      {/* 0 — one soft light, high and a little right, the way a single lamp
             falls in the photograph itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(100% 68% at 62% -6%, rgba(247,244,240,0.09) 0%, rgba(247,244,240,0.025) 38%, transparent 72%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.055] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }}
      />

      {/* 10 — the word. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2
                   select-none text-center lg:pl-[26%]"
      >
        <span
          className="block whitespace-nowrap text-[clamp(3.2rem,13.5vw,12rem)] font-extralight
                     leading-[0.9] tracking-[-0.02em] text-ink/[0.07]"
        >
          {h.bigTop}
        </span>
        <span
          className="mt-[0.12em] block whitespace-nowrap text-[clamp(1.6rem,6.6vw,6rem)]
                     font-extralight uppercase leading-none tracking-[0.28em] text-ink/[0.055]"
        >
          {h.bigBottom}
        </span>
      </div>

      {/* 20 — the photograph. Half the screen, feathered on every side so it
             sits in air rather than in a frame. */}
      <div className="absolute inset-y-0 right-0 z-20 w-full opacity-[0.3] lg:w-1/2 lg:opacity-100">
        <div className="relative h-full w-full">
          <Image
            src="/hero-portrait.jpg"
            alt="Алишер Гафуров за работой"
            fill
            priority
            quality={92}
            sizes="(max-width:1024px) 100vw, 50vw"
            /* The source is 1402×1122 with the subject a little left of centre;
               this lands them in the middle of the right half without cropping
               the desk away. */
            className="object-cover object-[38%_50%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, #0C0C0E 0%, rgba(12,12,14,0.62) 16%, transparent 44%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[22%]"
            style={{ background: 'linear-gradient(180deg, #0C0C0E 0%, transparent 100%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%]"
            style={{ background: 'linear-gradient(0deg, #0C0C0E 0%, transparent 100%)' }}
          />
        </div>
      </div>

      {/* 30 — the claim. */}
      <div className="relative z-30 w-full px-gutter">
        <div className="mx-auto w-full max-w-shell">
          <div className="max-w-[30rem] lg:w-1/2 lg:max-w-[26rem] lg:pr-10">
            <span className="block text-[11px] uppercase tracking-[0.24em] text-ink-3">
              {h.eyebrow}
            </span>

            {/* Light weight, tight leading — editorial rather than loud. The
                claim lands on one word, and that word carries the only colour
                anywhere on the page. */}
            <h1
              className="mt-8 text-[clamp(2.1rem,1.1rem+2.9vw,3.6rem)] font-light uppercase
                         leading-[1.08] tracking-[-0.015em] text-ink"
            >
              {h.titleMain} <span className="text-copper">{h.titleAccent}</span>
            </h1>

            <p className="mt-8 max-w-[32ch] text-[15px] leading-[1.7] text-ink-2">{h.sub}</p>

            {/* Text, a rule and an arrow. The rule grows on hover, and that is
                the whole interaction — a filled button here would outweigh the
                photograph. */}
            <Link
              href="/work"
              className="group mt-12 inline-flex min-h-[44px] items-center gap-4 text-[12px]
                         uppercase tracking-[0.2em] text-ink transition-colors duration-300
                         hover:text-copper"
            >
              {h.ctaWork}
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
        </div>
      </div>
    </section>
  );
}

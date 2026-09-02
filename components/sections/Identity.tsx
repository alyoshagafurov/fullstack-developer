'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useI18n } from '@/lib/i18n';

/*
 * The hero.
 *
 * Split down the middle: the claim on the left, the photograph on the right,
 * and the large word running between them, so the two halves are held together
 * by type rather than by a divider. The subject overlaps the word — that
 * overlap is the composition, and it is why the photograph sits above the type
 * in the stack instead of beside it.
 *
 * Three layers, back to front:
 *
 *   1  a single overhead spotlight, so the frame is lit rather than flat
 *   2  the word, set once, large, in two lines
 *   3  the photograph, then the claim, which never sits over the subject
 *
 * The word is `aria-hidden`. It is a graphic, and the page already has one
 * <h1> saying what this is; announcing it a second time would be noise.
 *
 * Below lg the split cannot hold — half a screen is not enough for either the
 * claim or the subject — so the photograph drops behind the text as a dimmed
 * field and the layout becomes a single column.
 */
export default function Identity() {
  const { t } = useI18n();
  const h = t.hero;

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-base"
    >
      {/* 1 — the light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(120% 78% at 50% -12%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 34%, transparent 68%)',
        }}
      />

      {/* 2 — the word. */}
      <div
        aria-hidden
        /* Centred in the band to the RIGHT of the claim, not in the viewport.
           Centring it on the page put it underneath the headline, where the
           first half of the word was simply lost. Starting the band at 32%
           leaves the claim its column and still lets the subject overlap the
           word's tail, which is the effect the reference is built on. */
        className="pointer-events-none absolute inset-x-0 top-[24%] z-10 flex flex-col
                   items-center lg:top-[24%] lg:pl-[33%] lg:pr-[37%]"
      >
        <span
          className="block whitespace-nowrap text-[clamp(2.1rem,5.9vw,5.2rem)] font-medium
                     leading-[0.85] tracking-[-0.045em] text-ink/[0.92]"
        >
          {h.bigTop}
        </span>
        {/* Letter-spaced and quieter: the second line is a caption to the
            first, not a second shout. */}
        <span
          className="mt-2 block whitespace-nowrap text-[clamp(0.65rem,1.45vw,1.15rem)]
                     font-light uppercase leading-none tracking-[0.42em] text-ink-3 lg:mt-4"
        >
          {h.bigBottom}
        </span>
      </div>

      {/* 3a — the photograph. */}
      <div
        className="absolute inset-y-0 right-0 z-20 w-full opacity-[0.28]
                   lg:w-[36%] lg:opacity-100"
      >
        <div className="relative h-full w-full">
          <Image
            src="/hero-portrait.jpg"
            alt="Алишер Гафуров за работой"
            fill
            priority
            quality={90}
            sizes="(max-width:1024px) 100vw, 36vw"
            className="object-cover object-[46%_26%]"
          />
          {/* The photograph has to end without a seam. On large screens it is
              feathered along its left edge so it dissolves into the word
              behind it; on small ones it is sunk under the text instead. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, #0A0A0A 0%, rgba(10,10,10,0.55) 14%, transparent 40%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
            style={{ background: 'linear-gradient(180deg, transparent 0%, #0A0A0A 100%)' }}
          />
        </div>
      </div>

      {/* 3b — the claim. */}
      <div className="relative z-30 w-full px-gutter">
        <div className="mx-auto w-full max-w-shell">
          <div className="max-w-[30rem] lg:max-w-[27rem]">
            <span className="label whitespace-nowrap">{h.eyebrow}</span>

            <h1
              className="mt-6 text-[clamp(2rem,1.2rem+2.4vw,3.15rem)] font-semibold uppercase
                         leading-[1.04] tracking-[-0.03em] text-ink"
            >
              {h.titleMain} <span className="text-ink-3">{h.titleAccent}</span>
            </h1>

            <p className="mt-6 max-w-[34ch] text-[15px] leading-[1.65] text-ink-2">{h.sub}</p>

            <Link
              href="/work"
              className="group mt-9 inline-flex min-h-[52px] items-center gap-4 whitespace-nowrap rounded-pill
                         border border-line-2 px-7 text-[13px] font-medium uppercase
                         tracking-[0.14em] text-ink transition-colors duration-200
                         hover:border-ink hover:bg-[rgba(255,255,255,0.06)]"
            >
              {h.ctaWork}
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

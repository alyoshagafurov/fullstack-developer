'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Action from '@/components/ui/Action';
import { useI18n } from '@/lib/i18n';

/*
 * 01 — Identity.
 *
 * The opening had to become the largest thing on the site rather than the
 * smallest. It now holds a full viewport, and the name is set in the serif at
 * display scale so it reads as a masthead, not a headline.
 *
 * Composition: the photograph is a cropped object on the right half, cut off
 * by the viewport edge instead of framed; the name is hung against it from the
 * left and allowed to overlap its dark side. A vertical label rides the left
 * margin, the meta ledger sits on the bottom rule. Nothing is centred, and the
 * only turquoise is the availability dot and the full stop after the surname.
 */
export default function Identity() {
  const { t } = useI18n();

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden flex flex-col justify-end"
    >
      {/* ── The photograph — a cropped object, right half, bleeding out ── */}
      <div className="hero-settle absolute inset-y-0 right-0 w-full lg:w-[58%]">
        <Image
          src="/hero-workspace.jpg"
          alt="Алишер Гафуров за работой"
          fill
          priority
          quality={88}
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover object-[20%_26%] lg:object-[62%_38%]"
        />
        {/* dissolve the photo into the canvas on its inner edge */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, #222831 0%, rgba(34,40,49,0.72) 34%, rgba(34,40,49,0.18) 72%, rgba(34,40,49,0.45) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(34,40,49,0.82) 0%, rgba(34,40,49,0.1) 30%, rgba(34,40,49,0.55) 78%, #222831 100%)',
          }}
        />
      </div>

      {/* Narrow screens: the name spans nearly the whole frame, so the
          photograph drops further back and its subject is cropped clear of the
          type rather than sitting under it. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(34,40,49,0.60) 0%, rgba(34,40,49,0.34) 32%, rgba(34,40,49,0.88) 66%, #222831 100%)',
        }}
      />

      {/* ── Vertical label riding the left margin ────────────────────── */}
      <div
        aria-hidden
        className="hero-fade pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 hidden xl:block"
        style={{ animationDelay: '0.8s' }}
      >
        <span className="label" style={{ writingMode: 'vertical-rl' }}>
          Dushanbe · Tajikistan
        </span>
      </div>

      <Shell className="relative pt-[128px] pb-[48px] md:pb-[64px]">
        {/* status */}
        <div
          className="hero-fade flex items-center gap-3 mb-[32px] md:mb-[48px]"
          style={{ animationDelay: '0.5s' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-signal" aria-hidden />
          <span className="label">{t.hero.badge}</span>
        </div>

        {/* the masthead */}
        <h1 className="display display-hero text-ink max-w-[11ch]">
          <span className="hero-mask">
            <span className="hero-rise" style={{ animationDelay: '0.1s' }}>Alisher</span>
          </span>
          <span className="hero-mask">
            <span className="hero-rise italic" style={{ animationDelay: '0.22s' }}>
              Gafurov<span className="text-signal not-italic">.</span>
            </span>
          </span>
          <span className="sr-only"> — {t.hero.roleA}, {t.hero.roleB}. Душанбе, Таджикистан.</span>
        </h1>

        {/* the rule and the ledger */}
        <div
          className="hero-fade mt-[48px] md:mt-[64px] pt-[24px] border-t border-line
                     grid-12 gap-y-[24px] items-baseline"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="col-span-12 md:col-span-5 text-[17px] md:text-[18px] leading-[1.6] text-ink-2 max-w-[34ch]">
            {t.hero.roleA} · {t.hero.roleB}
          </p>

          <div className="col-span-12 md:col-span-4 md:col-start-6 flex flex-wrap gap-[12px]">
            <Action href="#work" variant="solid">{t.hero.ctaWork}</Action>
            <Action href="/start-project" variant="ghost">{t.hero.ctaContact}</Action>
          </div>

          <dl className="col-span-12 md:col-span-2 md:col-start-11 flex md:flex-col gap-[24px] md:gap-[12px]">
            <div>
              <dt className="label text-[11px]">Focus</dt>
              <dd className="text-[13px] text-ink-2 mt-[4px]">Web · Product</dd>
            </div>
            <div>
              <dt className="label text-[11px]">Since</dt>
              <dd className="text-[13px] text-ink-2 mt-[4px]">2022</dd>
            </div>
          </dl>
        </div>
      </Shell>
    </section>
  );
}

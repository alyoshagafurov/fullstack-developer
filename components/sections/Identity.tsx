'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Action from '@/components/ui/Action';
import { useI18n } from '@/lib/i18n';

/*
 * 01 — Identity. The site's visual statement.
 *
 * Composition
 * -----------
 * The photograph is the screen: full bleed, cinematic crop, subject held to
 * the right. Everything else is placed against its edges rather than stacked
 * in a column — index top left, a vertical rail down the right margin, the
 * name anchored low, metadata bottom right. Nothing is centred.
 *
 * The name is the object. It is set large enough to cross the frame and
 * overlap the subject's body, but the lockup is bottom-anchored and width-
 * capped so it never runs into the face.
 *
 * Type contrast is deliberate and four-level: giant display, compact mono
 * labels, small metadata, body lead — never one weight for everything.
 *
 * Turquoise appears four times only: the availability dot, the index rule,
 * the surname's period, and interactive hovers.
 */
export default function Identity() {
  const { t } = useI18n();

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full flex flex-col justify-end overflow-hidden"
    >
      {/* ── The photograph ──────────────────────────────────────────────
       * The subject sits mid-frame in the source, which would put him under
       * the name. Two levers move him clear of the type instead of shrinking
       * it: on wide screens the whole frame is pushed right (the source is
       * wider than tall, so object-position has no horizontal effect there);
       * on narrow screens the crop itself favours the left of the source,
       * which pushes him to the right of the viewport.
       */}
      <div className="hero-settle absolute inset-0 lg:left-[15%] lg:right-[-15%]">
        <Image
          src="/hero-workspace.jpg"
          alt="Алишер Гафуров за работой"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[19%_36%] lg:object-[50%_38%]"
        />
      </div>

      {/* Sink the frame into the matte black, top and bottom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(12,13,15,0.88) 0%, rgba(12,13,15,0.30) 24%, rgba(12,13,15,0.42) 52%, rgba(12,13,15,0.96) 100%)',
        }}
      />
      {/* Darken the side the type lives on */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(12,13,15,0.92) 0%, rgba(12,13,15,0.48) 44%, transparent 76%)',
        }}
      />
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute right-0 top-0 h-[36vh] w-[42vw] opacity-20
                   [mask-image:radial-gradient(70%_70%_at_88%_12%,#000,transparent)]"
      />

      {/* ── Index, top left ───────────────────────────────────────────── */}
      <div className="absolute left-0 right-0 top-24 md:top-28 pointer-events-none">
        <Shell className="flex items-start justify-between gap-6">
          <div className="hero-fade" style={{ animationDelay: '0.55s' }}>
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
              01 / Identity
            </span>
            <span
              aria-hidden
              className="hero-draw block mt-3 h-px w-14 bg-signal"
              style={{ animationDelay: '0.7s' }}
            />
          </div>

          <p
            className="hero-fade hidden sm:flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-2"
            style={{ animationDelay: '0.62s' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-signal" aria-hidden />
            {t.hero.badge}
          </p>
        </Shell>
      </div>

      {/* ── Vertical rail, right margin ───────────────────────────────── */}
      <div
        aria-hidden
        className="hero-fade pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block"
        style={{ animationDelay: '0.8s' }}
      >
        <span
          className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-ink-3"
          style={{ writingMode: 'vertical-rl' }}
        >
          Dushanbe · Tajikistan
        </span>
      </div>

      {/* ── The lockup, anchored low ──────────────────────────────────── */}
      <Shell className="relative pb-12 md:pb-14 pt-36">
        <h1 className="display text-[10vw] sm:text-d-xl text-ink max-w-[13ch] lg:max-w-[58%] [text-shadow:0_12px_70px_rgba(0,0,0,0.55)]">
          <span className="hero-mask">
            <span className="hero-rise" style={{ animationDelay: '0.15s' }}>Alisher</span>
          </span>
          <span className="hero-mask">
            <span className="hero-rise text-ink-2" style={{ animationDelay: '0.26s' }}>
              Gafurov<span className="text-signal">.</span>
            </span>
          </span>
          <span className="sr-only"> — {t.hero.roleA}, {t.hero.roleB}. Душанбе, Таджикистан.</span>
        </h1>

        <div className="mt-10 md:mt-12 grid-12 items-end gap-y-8">
          {/* role + actions */}
          <div className="col-span-12 lg:col-span-7">
            <p
              className="hero-fade text-lead text-ink-2 max-w-md text-balance"
              style={{ animationDelay: '0.68s' }}
            >
              {t.hero.roleA} · {t.hero.roleB}
            </p>
            <div
              className="hero-fade mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.76s' }}
            >
              <Action href="#work" variant="solid">{t.hero.ctaWork}</Action>
              <Action href="#start" variant="ghost">{t.hero.ctaContact}</Action>
            </div>
          </div>

          {/* metadata block, bottom right — deliberately off the text column */}
          <dl
            className="hero-fade col-span-12 lg:col-span-4 lg:col-start-9 border-t border-line pt-4
                       grid grid-cols-2 gap-x-6 gap-y-3"
            style={{ animationDelay: '0.84s' }}
          >
            <div>
              <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-3">Focus</dt>
              <dd className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-2 mt-1.5">
                Web · Product
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-3">Since</dt>
              <dd className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-2 mt-1.5">
                2022
              </dd>
            </div>
          </dl>
        </div>

        {/* scroll cue */}
        <div
          className="hero-fade mt-12 hidden md:flex items-center gap-3"
          style={{ animationDelay: '0.92s' }}
        >
          <span aria-hidden className="hero-draw h-px w-10 bg-line-2" style={{ animationDelay: '1s' }} />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
            {t.hero.scroll}
          </span>
        </div>
      </Shell>
    </section>
  );
}

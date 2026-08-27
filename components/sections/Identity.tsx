'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Action from '@/components/ui/Action';
import { useI18n } from '@/lib/i18n';

/*
 * 01 — Identity.
 *
 * Composition: the photograph is the screen. It runs edge to edge for the full
 * viewport, and the lockup sits low and left inside its own negative space —
 * asymmetric, never centred.
 *
 * Two scrims do the work of legibility: a vertical one that sinks the frame
 * into the matte black above and below, and a horizontal one that darkens the
 * left third where the type lives. The photograph itself is not filtered.
 */
export default function Identity() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative min-h-[100svh] w-full flex flex-col justify-end overflow-hidden">
      {/* the photograph — full screen */}
      <Image
        src="/hero-workspace.jpg"
        alt="Алишер Гафуров за работой"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-[68%_42%]"
      />

      {/* sink it into the black, top and bottom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(12,13,15,0.86) 0%, rgba(12,13,15,0.32) 26%, rgba(12,13,15,0.35) 55%, rgba(12,13,15,0.94) 100%)',
        }}
      />
      {/* darken the side the type sits on */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(12,13,15,0.9) 0%, rgba(12,13,15,0.45) 46%, transparent 78%)',
        }}
      />
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute right-0 top-0 h-[38vh] w-[46vw] opacity-25
                   [mask-image:radial-gradient(70%_70%_at_85%_15%,#000,transparent)]"
      />

      <Shell className="relative pb-16 md:pb-20 pt-32">
        <Meta rule signal className="mb-8">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal" aria-hidden />
            {t.hero.badge}
          </span>
        </Meta>

        <h1 className="display text-d-xl text-ink max-w-[15ch] lg:max-w-[12ch] [text-shadow:0_10px_60px_rgba(0,0,0,0.5)]">
          Alisher
          <br />
          <span className="text-ink-2">Gafurov</span>
          <span className="sr-only"> — {t.hero.roleA}, {t.hero.roleB}. Душанбе, Таджикистан.</span>
        </h1>

        <div className="mt-10 grid-12 items-end gap-y-8">
          <p className="col-span-12 md:col-span-6 text-lead text-ink-2 max-w-md text-balance">
            {t.hero.roleA} · {t.hero.roleB}
          </p>

          <div className="col-span-12 md:col-span-5 md:col-start-7 flex flex-wrap items-center gap-3">
            <Action href="#work" variant="solid">{t.hero.ctaWork}</Action>
            <Action href="#start" variant="ghost">{t.hero.ctaContact}</Action>
          </div>
        </div>

        <Meta className="mt-14 hidden md:flex">{t.hero.scroll}</Meta>
      </Shell>
    </section>
  );
}

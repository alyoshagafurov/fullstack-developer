'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';
import { useI18n } from '@/lib/i18n';

/*
 * "Craft" — a full-bleed cinematic break placed between how I work (Process)
 * and what I work with (Technology). One photograph held long enough to change
 * the page's rhythm: the desk at 11:11 PM.
 *
 * The frame is edge-to-edge but dissolves into the page background at the top
 * and bottom, so it reads as a moment in the story rather than a picture pasted
 * into a slot. The lockup sits in the photograph's own empty left side — never
 * over the lamp or the screen.
 */
export default function PhotoStatement() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const { t } = useI18n();
  const p = t.photo;

  return (
    <section ref={ref} aria-label={p.craftLabel} className="relative w-full">
      <div className="relative h-[58vh] min-h-[380px] max-h-[620px] w-full overflow-hidden">
        <Image
          src="/workspace-detail.jpg"
          alt="Рабочий стол поздним вечером — ноутбук и настольная лампа"
          fill
          quality={88}
          sizes="100vw"
          data-parallax="0.05"
          data-pscale="1.16"
          className="object-cover object-[64%_58%] will-change-transform"
        />

        {/* Grade: darken the left third for the text, keep the lamp intact.
            Narrow screens need a wider, heavier pull — the lockup spans most of
            the frame there, so the desk lamp reads as glow instead of subject. */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(15,13,11,0.92) 0%, rgba(15,13,11,0.80) 55%, rgba(15,13,11,0.46) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(15,13,11,0.94) 0%, rgba(15,13,11,0.62) 34%, rgba(15,13,11,0.10) 66%, transparent 100%)',
          }}
        />
        {/* Dissolve into the page, top and bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #191817 0%, rgba(25,24,23,0) 16%, rgba(25,24,23,0) 84%, #191817 100%)',
          }}
        />
        <div className="absolute inset-0 noise pointer-events-none" />

        {/* Lockup — in the frame's own negative space */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-wide w-full px-6 md:px-10">
            <div className="max-w-lg">
              <div data-reveal="0" className="flex items-center gap-3 label text-[10px] text-accent">
                <span className="w-7 h-px bg-accent/50" />
                {p.craftLabel}
              </div>
              <p
                data-reveal="1"
                className="mt-5 display text-ink text-[8.5vw] sm:text-5xl md:text-[3.3rem] leading-[1.04] [text-shadow:0_8px_44px_rgba(0,0,0,0.5)]"
              >
                {p.craftTitle}
              </p>
              <div data-reveal="2" className="mt-6 label text-[10px] text-ink-2/70">
                {p.craftNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

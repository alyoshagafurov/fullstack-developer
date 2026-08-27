'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';
import { useI18n } from '@/lib/i18n';

/*
 * A held breath between the reasons (Why me) and the proof (Testimonials):
 * one wide letterbox crop, no heading, no card — just rhythm.
 *
 * This is the only daylight frame in the set, so it is graded down rather than
 * recoloured (a light brightness/saturation pull plus a vignette) so it sits in
 * the same dark room as the rest of the photography instead of punching a hole
 * in the page. Deliberately short: it punctuates, it does not perform.
 */
export default function PhotoStrip() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const { t } = useI18n();
  const p = t.photo;

  return (
    <section ref={ref} aria-label={p.standardLabel} className="relative py-10 md:py-16">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div
          data-reveal="0"
          className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-line aspect-[16/10] sm:aspect-[21/8]"
        >
          <Image
            src="/lifestyle-car.jpg"
            alt="Улица старого города — деталь образа жизни"
            fill
            quality={86}
            sizes="(max-width:1400px) 100vw, 1400px"
            data-parallax="0.035"
            data-pscale="1.14"
            className="object-cover object-[50%_64%] will-change-transform"
            style={{ filter: 'brightness(0.80) contrast(1.05) saturate(0.85) sepia(0.08)' }}
          />
          {/* vignette so the frame closes into the page */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(125% 135% at 52% 42%, transparent 26%, rgba(15,13,11,0.78) 100%)' }}
          />
          {/* left scrim for the caption */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(15,13,11,0.80) 0%, transparent 46%)' }}
          />
          <div className="absolute inset-0 noise opacity-70 pointer-events-none" />

          <div className="absolute left-5 md:left-9 bottom-5 md:bottom-8 max-w-xs">
            <div className="flex items-center gap-3 label text-[10px] text-accent">
              <span className="w-6 h-px bg-accent/50" />
              {p.standardLabel}
            </div>
            <p className="mt-2.5 text-ink-2 text-[13px] md:text-[15px] leading-relaxed">{p.standardNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

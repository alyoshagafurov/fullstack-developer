'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import Button from './Button';
import { useI18n } from '@/lib/i18n';

/*
 * Hero — one cinematic photograph, full-bleed. The owner at work in a warm,
 * dark studio: the frame IS the atmosphere, so the UI stays out of its way.
 * Editorial lower-left lockup (index, availability, name, roles, CTAs) sits in
 * the negative space; scrims keep it legible without covering the subject.
 * Gentle cursor parallax + an intro settle after the loader lifts.
 */
export default function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  // Gentle cursor parallax on the photograph (desktop, motion allowed)
  useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    const tick = () => {
      cx += (mx - cx) * 0.045;
      cy += (my - cy) * 0.045;
      el.style.transform = `scale(1.06) translate3d(${cx * -14}px, ${cy * -12}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // Intro settle after the loader lifts
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgWrapRef.current,
        { opacity: 0, scale: 1.12 },
        { opacity: 1, scale: 1.06, duration: reduce ? 0.4 : 1.4, ease: 'power3.out', delay: reduce ? 0 : 0.35 },
      );
      gsap.fromTo(
        '[data-hero-fx]',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: reduce ? 0 : 0.9, ease: 'power3.out', stagger: 0.09, delay: reduce ? 0 : 0.7 },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      {/* Cinematic photograph — full bleed */}
      <div ref={imgWrapRef} className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
        <Image
          src="/hero-workspace.jpg"
          alt="Алишер Гафуров (ALY) — Full-Stack разработчик за работой в студии, Душанбе"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[center_42%]"
        />
      </div>

      {/* Legibility grade: top (nav) + bottom (lockup) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,18,16,0.60) 0%, rgba(20,18,16,0.08) 15%, transparent 33%, transparent 46%, rgba(18,16,14,0.55) 73%, rgba(15,13,11,0.95) 100%)',
        }}
      />
      {/* Left column darkening for the text (desktop) */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{ background: 'linear-gradient(90deg, rgba(15,13,11,0.72) 0%, rgba(15,13,11,0.28) 34%, transparent 60%)' }}
      />
      {/* Warm bronze breath from the bottom-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(58% 46% at 6% 100%, rgba(121,82,56,0.22) 0%, transparent 62%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Editorial index — just under the nav */}
      <div
        data-hero-fx
        className="absolute left-6 md:left-10 top-24 md:top-28 z-20 hidden sm:flex items-center gap-3 label text-[10px] text-ink-2/80"
      >
        <span className="tabular-nums">(01)</span>
        <span className="w-8 h-px bg-line-2" />
        <span>{t.hero.marker}</span>
      </div>

      {/* Bottom-left lockup */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-wide px-6 md:px-10 pb-[9vh] md:pb-[8vh]">
          <div className="max-w-2xl text-center md:text-left">
            <div
              data-hero-fx
              className="flex items-center justify-center md:justify-start gap-2.5 label text-[10px] md:text-[11px] text-accent"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-soft" />
              {t.hero.badge}
            </div>

            <h1
              data-hero-fx
              className="mt-5 display-tight text-ink text-[14vw] xs:text-6xl md:text-7xl lg:text-[5.4rem] leading-[0.9] [text-shadow:0_10px_60px_rgba(0,0,0,0.45)]"
            >
              ALISHER
              <br />
              <span className="text-grad">GAFUROV</span>
              <span className="sr-only"> (Aly) — Full-Stack разработчик и Software Engineer из Душанбе, Таджикистан. Основатель ALY.</span>
            </h1>

            <p
              data-hero-fx
              className="mt-6 text-ink-2 text-[15px] md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed"
            >
              {t.hero.roleA} · {t.hero.roleB}
            </p>

            <div
              data-hero-fx
              className="mt-9 flex flex-wrap items-center justify-center md:justify-start gap-3.5"
            >
              <Button href="/work" cursorLabel={t.nav.work}>
                {t.hero.ctaWork} <span aria-hidden>→</span>
              </Button>
              <Button href="/contact" variant="ghost" cursorLabel={t.nav.contact}>
                {t.hero.ctaContact}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint — bottom-right (desktop) */}
      <div
        data-hero-fx
        className="absolute right-8 md:right-10 bottom-[9vh] md:bottom-[8vh] z-20 hidden md:flex flex-col items-center gap-2 label text-[9px] text-ink-2/70"
      >
        <span>{t.hero.scroll}</span>
        <span className="w-px h-10 bg-gradient-to-b from-ink-2/50 to-transparent" />
      </div>
    </section>
  );
}

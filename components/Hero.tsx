'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import SplitText from './SplitText';
import Button from './Button';
import { useI18n } from '@/lib/i18n';

/*
 * Hero — a centered portrait column (not full-bleed), so the cosmic backdrop
 * breathes around it and the photo reads smaller. Colour photo, compact name,
 * supporting line and two CTAs. Cursor parallax on the portrait.
 */
export default function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Cursor parallax on the inner image wrapper (keeps intro scale/opacity separate)
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || window.matchMedia('(max-width: 768px)').matches) return;
    let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    const tick = () => {
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      inner.style.transform = `scale(1.05) translate3d(${cx * -16}px, ${cy * -16}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // Intro reveal after the loader lifts
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(outerRef.current, { opacity: 0, scale: 1.08, filter: 'blur(14px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out', delay: 1.1 });
      gsap.fromTo('[data-hero-fx]', { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 1.5 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const fade = 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)';

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] w-full overflow-hidden">
      {/* Centered portrait column */}
      <div className="absolute inset-0 flex justify-center">
        <div ref={outerRef} className="relative h-full w-full max-w-[300px] sm:max-w-[420px] md:max-w-[560px]" style={{ opacity: 0 }}>
          <div
            ref={innerRef}
            className="absolute inset-0 will-change-transform"
            style={{ WebkitMaskImage: fade, maskImage: fade }}
          >
            <Image
              src="/hero-face.jpg"
              alt="Алишер Гафуров — Full-Stack разработчик"
              fill
              priority
              quality={92}
              sizes="(max-width:768px) 100vw, 560px"
              className="object-cover object-[center_18%]"
              style={{ filter: 'contrast(1.04) saturate(1.02) brightness(0.98)' }}
            />
          </div>
        </div>
      </div>

      {/* Legibility gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(7,7,7,0.6) 0%, transparent 20%, transparent 48%, rgba(7,7,7,0.72) 80%, rgba(7,7,7,0.97) 100%)',
      }} />

      {/* Top-left marker */}
      <div data-hero-fade className="absolute top-24 left-6 md:left-10 z-20 hidden md:flex items-center gap-3 label">
        <span>01</span><span className="w-8 h-px bg-white/40" /><span className="text-ink-2">{t.hero.marker}</span>
      </div>

      {/* Bottom lockup */}
      <div data-hero-fade className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center text-center px-5 pb-[8vh] md:pb-[9vh]">
        <SplitText
          as="h1"
          trigger="load"
          delay={1.35}
          className="display-tight text-white text-[10vw] sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.92] [text-shadow:0_6px_50px_rgba(0,0,0,0.6)]"
        >
          ALISHER GAFUROV
        </SplitText>

        <div data-hero-fx className="mt-5 flex items-center gap-3 label text-[10px] md:text-[11px] text-ink-2">
          <span>{t.hero.roleA}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>{t.hero.roleB}</span>
        </div>

        <div data-hero-fx className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Button href="/work" cursorLabel={t.nav.work}>
            {t.hero.ctaWork} <span aria-hidden>→</span>
          </Button>
          <Button href="/contact" variant="ghost" cursorLabel={t.nav.contact}>
            {t.hero.ctaContact}
          </Button>
        </div>
      </div>

      {/* Scroll hint */}
      <div data-hero-fade className="absolute bottom-8 left-6 md:left-10 z-20 hidden md:flex items-center gap-3">
        <div className="relative w-14 h-px overflow-hidden bg-white/20">
          <div className="absolute top-0 bottom-0 w-3 bg-white/80" style={{ animation: 'marquee 2s linear infinite' }} />
        </div>
        <span className="label text-[9px]">{t.hero.scroll}</span>
      </div>
    </section>
  );
}

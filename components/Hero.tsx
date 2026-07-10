'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import SplitText from './SplitText';
import Button from './Button';

/*
 * Hero — full-bleed portrait. The photo fills the whole screen (grayscale, to
 * stay inside the monochrome system); the name sits large across the bottom
 * with a supporting line and two CTAs. Subtle cursor parallax on the portrait,
 * strong bottom gradient for legibility. No persona toggle, no product mock.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  // Gentle cursor parallax on the portrait
  useEffect(() => {
    const photo = photoRef.current;
    if (!photo || window.matchMedia('(max-width: 768px)').matches) return;
    let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    };
    const tick = () => {
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      photo.style.transform = `scale(1.06) translate3d(${cx * -22}px, ${cy * -22}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // Intro — reveal photo + supporting UI after the loader lifts
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(photoRef.current, { opacity: 0, scale: 1.14, filter: 'blur(16px)' },
        { opacity: 1, scale: 1.06, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out', delay: 1.15 });
      gsap.fromTo('[data-hero-fx]', { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 1.55 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] w-full overflow-hidden bg-bg">
      {/* Portrait */}
      <div ref={photoRef} className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
        <Image
          src="/hero-face.jpg"
          alt="Алишер Гафуров — Full-Stack разработчик"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[center_22%] grayscale"
          style={{ filter: 'grayscale(1) contrast(1.08) brightness(0.95)' }}
        />
      </div>

      {/* Legibility gradients + vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          'linear-gradient(180deg, rgba(7,7,7,0.55) 0%, transparent 22%, transparent 45%, rgba(7,7,7,0.75) 82%, rgba(7,7,7,0.98) 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(7,7,7,0.6) 100%)',
      }} />

      {/* Top-left marker */}
      <div data-hero-fade className="absolute top-24 left-6 md:left-10 z-20 hidden md:flex items-center gap-3 label">
        <span>01</span><span className="w-8 h-px bg-white/40" /><span className="text-ink-2">Портфолио</span>
      </div>

      {/* Bottom lockup */}
      <div data-hero-fade className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center text-center px-5 pb-[7vh] md:pb-[8vh]">
        <SplitText
          as="h1"
          trigger="load"
          delay={1.35}
          className="display-tight text-white text-[15vw] md:text-[12vw] lg:text-[10rem] leading-[0.86] [text-shadow:0_6px_60px_rgba(0,0,0,0.6)]"
        >
          ALISHER GAFUROV
        </SplitText>

        <div data-hero-fx className="mt-5 md:mt-7 flex items-center gap-3 label text-[10px] md:text-[11px] text-ink-2">
          <span>Full-Stack разработчик</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Сайты под ключ</span>
        </div>

        <div data-hero-fx className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Button href="#work" cursorLabel="Работы">
            Смотреть работы <span aria-hidden>→</span>
          </Button>
          <Button href="#contact" variant="ghost" cursorLabel="Написать">
            Обсудить проект
          </Button>
        </div>
      </div>

      {/* Scroll hint */}
      <div data-hero-fade className="absolute bottom-8 left-6 md:left-10 z-20 hidden md:flex items-center gap-3">
        <div className="relative w-14 h-px overflow-hidden bg-white/20">
          <div className="absolute top-0 bottom-0 w-3 bg-white/80" style={{ animation: 'marquee 2s linear infinite' }} />
        </div>
        <span className="label text-[9px]">Scroll</span>
      </div>
    </section>
  );
}

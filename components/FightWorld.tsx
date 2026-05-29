'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * FightWorld — Dimension II. Dark, brutal, slow-motion gym.
 *
 * Pinned for ~400% scroll. Beats:
 *   B1: DISCIPLINE  — image 1 slowly zooms, single word floats
 *   B2: VIOLENCE    — image swaps to ring, counters tick up
 *   B3: CONTROL     — image to moment 2, final stat lockup
 *
 * Aesthetic: heavy grain, vignette, red/orange highlights, fog drift,
 * cold-side darkness. Stats reveal via incrementing GSAP tweens.
 */

const PRINCIPLES = [
  'Режим вместо отговорок',
  'Работа через усталость',
  'Спокойствие под давлением',
  'Характер, который виден в деле',
];

const WORDS = ['ДИСЦИПЛИНА', 'ХАРАКТЕР', 'ВЫДЕРЖКА'];

export default function FightWorld() {
  const wrapRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const wrap = wrapRef.current;
      const pin = pinRef.current;
      if (!wrap || !pin) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: '+=420%',
          scrub: 1.1,
          pin: pin,
          pinSpacing: true,
        },
      });

      // Initial reveal
      tl.fromTo(
        '.fw-bg-1',
        { scale: 1.25, opacity: 0, filter: 'brightness(0.2) blur(20px)' },
        { scale: 1.05, opacity: 1, filter: 'brightness(0.55) blur(0px)', duration: 0.3 },
        0,
      );

      // BEAT 1: DISCIPLINE
      tl.fromTo(
        '.word-1',
        { opacity: 0, y: 60, filter: 'blur(20px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.2 },
        0.05,
      );
      tl.to(
        '.word-1',
        { opacity: 0, y: -60, filter: 'blur(20px)', duration: 0.15 },
        0.3,
      );

      // Swap image 1 → ring
      tl.to(
        '.fw-bg-1',
        { opacity: 0, scale: 1.15, duration: 0.2 },
        0.3,
      );
      tl.fromTo(
        '.fw-bg-2',
        { opacity: 0, scale: 1.18, filter: 'brightness(0.3) blur(12px)' },
        { opacity: 1, scale: 1.03, filter: 'brightness(0.6) blur(0px)', duration: 0.25 },
        0.3,
      );

      // BEAT 2: VIOLENCE
      tl.fromTo(
        '.word-2',
        { opacity: 0, y: 60, filter: 'blur(20px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.2 },
        0.35,
      );

      // Principles reveal one by one — honest copy, no fabricated numbers
      tl.fromTo(
        '.principle-head',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.15 },
        0.38,
      );
      PRINCIPLES.forEach((_, i) => {
        tl.fromTo(
          `.principle-${i}`,
          { opacity: 0, x: -30, filter: 'blur(8px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.2 },
          0.42 + i * 0.05,
        );
      });

      tl.to(
        '.word-2',
        { opacity: 0, y: -60, filter: 'blur(20px)', duration: 0.15 },
        0.65,
      );
      // Clear the principles before the final beat so the close stays clean
      tl.to(
        '.fw-principles',
        { opacity: 0, y: -20, duration: 0.12 },
        0.65,
      );

      // Swap image 2 → moment 2
      tl.to(
        '.fw-bg-2',
        { opacity: 0, scale: 1.12, duration: 0.2 },
        0.65,
      );
      tl.fromTo(
        '.fw-bg-3',
        { opacity: 0, scale: 1.18, filter: 'brightness(0.3) blur(12px)' },
        { opacity: 1, scale: 1.02, filter: 'brightness(0.65) blur(0px)', duration: 0.25 },
        0.65,
      );

      // BEAT 3: CONTROL
      tl.fromTo(
        '.word-3',
        { opacity: 0, scale: 0.9, filter: 'blur(20px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.2 },
        0.72,
      );

      // Final lockup
      tl.fromTo(
        '.fw-lockup',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.2 },
        0.85,
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="fight" ref={wrapRef} className="relative w-full bg-ink-0">
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
        {/* Layered backgrounds */}
        <div className="fw-bg-1 absolute inset-0">
          <Image
            src="/mma-moment-1.jpg"
            alt=""
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.55) contrast(1.2) saturate(0.7)',
            }}
            sizes="100vw"
          />
        </div>
        <div className="fw-bg-2 absolute inset-0 opacity-0">
          <Image
            src="/mma-ring.jpg"
            alt=""
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.55) contrast(1.25) saturate(0.7)',
            }}
            sizes="100vw"
          />
        </div>
        <div className="fw-bg-3 absolute inset-0 opacity-0">
          <Image
            src="/mma-moment-2.jpg"
            alt=""
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.6) contrast(1.18) saturate(0.75)',
            }}
            sizes="100vw"
          />
        </div>

        {/* Overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0) 35%, rgba(5,5,5,0) 65%, rgba(5,5,5,0.85) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(40% 40% at 30% 50%, rgba(255,40,30,0.18), transparent 60%), radial-gradient(35% 35% at 75% 60%, rgba(255,120,30,0.10), transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
        <div className="scanlines absolute inset-0 opacity-30" />

        {/* Fog */}
        <Fog />

        {/* HUD — single quiet marker */}
        <div className="absolute top-24 left-6 md:left-12 z-30 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40">
          <span>05</span>
          <span className="w-8 h-px" style={{ background: '#ff5a3c' }} />
          <span style={{ color: '#ff5a3c' }}>ХАРАКТЕР</span>
        </div>

        {/* Principles column (revealed during the middle beat) */}
        <div className="fw-principles absolute bottom-[16vh] md:bottom-[18vh] left-6 md:left-12 max-w-[80vw] md:max-w-sm space-y-3 md:space-y-4 z-30">
          <div className="principle-head opacity-0 font-mono text-[10px] tracking-[0.4em] text-white/40 mb-2">
            ЧТО ДАЁТ СПОРТ
          </div>
          {PRINCIPLES.map((p, i) => (
            <div
              key={p}
              className={`principle-${i} opacity-0 flex items-center gap-3 md:gap-4`}
            >
              <span
                className="w-6 md:w-8 h-px shrink-0"
                style={{ background: '#ff5a3c', boxShadow: '0 0 10px rgba(255,90,60,0.5)' }}
              />
              <span className="text-white/85 text-base md:text-xl tracking-tight">
                {p}
              </span>
            </div>
          ))}
        </div>

        {/* Big words */}
        <div className="absolute inset-0 flex items-center justify-end pr-6 md:pr-12 pointer-events-none">
          <div className="relative w-full md:w-[60vw] text-right">
            <div className="word-1 absolute inset-x-0 right-0">
              <div className="text-cinematic text-white text-[11vw] md:text-[8vw] leading-[0.85] mix-blend-difference">
                {WORDS[0]}
              </div>
            </div>
            <div className="word-2 absolute inset-x-0 right-0">
              <div
                className="text-cinematic text-[11vw] md:text-[8vw] leading-[0.85]"
                style={{ color: '#ff4a2a', textShadow: '0 0 40px rgba(255,70,40,0.5)' }}
              >
                {WORDS[1]}
              </div>
            </div>
            <div className="word-3 absolute inset-x-0 right-0">
              <div className="text-cinematic text-white text-[11vw] md:text-[8vw] leading-[0.85] mix-blend-difference">
                {WORDS[2]}
              </div>
            </div>
          </div>
        </div>

        {/* Final lockup — honest bridge from the gym to the keyboard */}
        <div className="fw-lockup opacity-0 absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 text-center pointer-events-none">
          <div className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] md:tracking-[0.5em] text-white/60">
            ХАРАКТЕР, ЗАКАЛЁННЫЙ В ЗАЛЕ
          </div>
          <div className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] md:tracking-[0.5em] text-neon-yellow mt-1.5">
            ДИСЦИПЛИНА, КОТОРАЯ РАБОТАЕТ В КОДЕ
          </div>
        </div>
      </div>
    </section>
  );
}

function Fog() {
  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50">
      <div
        className="absolute -inset-20 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 20% 70%, rgba(255,80,40,0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(120,30,10,0.12) 0%, transparent 60%)',
          animation: 'pulse-soft 14s ease-in-out infinite',
        }}
      />
    </div>
  );
}

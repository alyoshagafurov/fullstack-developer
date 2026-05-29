'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Portal — pinned interstellar warp between Code and Fight dimensions.
 *
 * Composition:
 *  - A circular portal (clip-path: circle) that opens from a tiny point
 *    to fill the screen as scroll progresses.
 *  - Inside the portal: the MMA ring photo, distorted by #portal-warp.
 *  - Outer ring: gradient + glow, animated chromatic aberration peaks.
 *  - Big fragmented text: "THROUGH / THE / SCREEN"
 *
 * Animations driven by GSAP scroll-scrub (no JS for the visuals).
 */
export default function Portal() {
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
          end: '+=320%',
          scrub: 1.1,
          pin: pin,
          pinSpacing: true,
        },
      });

      // Phase 1: portal materializes
      tl.fromTo(
        '.portal-circle',
        { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
        { clipPath: 'circle(8% at 50% 50%)', opacity: 1, duration: 0.2 },
        0,
      );
      tl.fromTo(
        '.portal-ring',
        { scale: 0, opacity: 0, rotate: -180 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.25 },
        0,
      );

      // Phase 2: titles fade through
      tl.fromTo(
        '.portal-line-1',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.15 },
        0.05,
      ).to('.portal-line-1', { opacity: 0, y: -40, duration: 0.12 }, 0.25);

      tl.fromTo(
        '.portal-line-2',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.15 },
        0.32,
      ).to('.portal-line-2', { opacity: 0, y: -40, duration: 0.12 }, 0.5);

      tl.fromTo(
        '.portal-line-3',
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.18 },
        0.55,
      ).to('.portal-line-3', { opacity: 0, scale: 1.6, duration: 0.15 }, 0.78);

      // Phase 3: portal expands → fills the screen
      tl.to(
        '.portal-circle',
        {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 0.4,
          ease: 'power3.in',
        },
        0.55,
      );
      tl.to(
        '.portal-ring',
        {
          scale: 4,
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        },
        0.6,
      );

      // Drive the SVG portal-warp filter
      const portalDisp = document.querySelector('#portal-disp');
      const portalTurb = document.querySelector('#portal-turb');
      const proxy = { scale: 0, freq: 0.005 };
      tl.to(
        proxy,
        {
          scale: 200,
          freq: 0.025,
          duration: 0.4,
          onUpdate: () => {
            portalDisp?.setAttribute('scale', String(proxy.scale));
            portalTurb?.setAttribute(
              'baseFrequency',
              String(proxy.freq),
            );
          },
        },
        0.55,
      );
      tl.to(
        proxy,
        {
          scale: 8,
          freq: 0.008,
          duration: 0.2,
          onUpdate: () => {
            portalDisp?.setAttribute('scale', String(proxy.scale));
            portalTurb?.setAttribute(
              'baseFrequency',
              String(proxy.freq),
            );
          },
        },
        0.85,
      );

      // Background fades to red/black
      tl.to(
        '.portal-bg-tint',
        {
          background:
            'radial-gradient(ellipse at center, rgba(120,10,40,0.6) 0%, rgba(5,5,5,0.95) 70%)',
          duration: 0.4,
        },
        0.5,
      );

      // Spinning chromatic flash at the apex
      tl.to(
        '.portal-flash',
        { opacity: 0.7, scale: 1.6, duration: 0.1 },
        0.75,
      );
      tl.to('.portal-flash', { opacity: 0, scale: 2.4, duration: 0.15 }, 0.85);
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="portal" ref={wrapRef} className="relative w-full bg-ink-0">
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
        {/* Tinted base */}
        <div
          className="portal-bg-tint absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,40,80,0.4) 0%, rgba(5,5,5,0.95) 70%)',
          }}
        />

        {/* Concentric energy rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="portal-ring relative w-[110vmin] h-[110vmin]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border opacity-60"
                style={{
                  borderColor:
                    i % 2 === 0
                      ? 'rgba(0,255,255,0.6)'
                      : 'rgba(138,43,226,0.6)',
                  transform: `scale(${0.45 + i * 0.15})`,
                  boxShadow: `0 0 ${20 + i * 10}px ${
                    i % 2 === 0 ? 'rgba(0,255,255,0.4)' : 'rgba(138,43,226,0.4)'
                  }`,
                  animation: `pulse-soft ${3 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-[110vmin] bg-gradient-to-b from-transparent via-neon-yellow/40 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-px w-[110vmin] bg-gradient-to-r from-transparent via-neon-yellow/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* The portal "window" — clipped circle revealing the next world */}
        <div className="portal-circle absolute inset-0" style={{ filter: 'url(#portal-warp)' }}>
          <div className="absolute inset-0">
            <Image
              src="/mma-ring.jpg"
              alt=""
              fill
              className="object-cover"
              style={{
                filter:
                  'brightness(0.65) contrast(1.2) saturate(0.95) hue-rotate(-15deg)',
              }}
              sizes="100vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(40,5,10,0.45) 0%, rgba(5,5,5,0.6) 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          </div>
        </div>

        {/* Spinning chromatic flash */}
        <div
          className="portal-flash absolute inset-0 pointer-events-none opacity-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9), rgba(212,175,55,0.5) 30%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />

        {/* HUD */}
        <div className="absolute top-24 left-6 md:left-12 font-mono text-[10px] tracking-[0.4em] text-white/40 z-30">
          <div>TRANSITION · IV</div>
          <div className="text-neon-purple">[ PORTAL ]</div>
        </div>
        <div className="absolute top-24 right-6 md:right-12 font-mono text-[10px] tracking-[0.4em] text-white/40 z-30 text-right">
          <div>SIGNAL · UNSTABLE</div>
          <div className="text-neon-purple flicker">REROUTING</div>
        </div>

        {/* Big titles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full text-center">
            <div className="portal-line-1 absolute inset-x-0 flex justify-center">
              <span className="text-cinematic text-white text-[12vw] md:text-[8vw] glow-blue mix-blend-difference">
                THROUGH
              </span>
            </div>
            <div className="portal-line-2 absolute inset-x-0 flex justify-center">
              <span className="text-cinematic text-white text-[12vw] md:text-[8vw] glow-purple mix-blend-difference">
                THE&nbsp;SCREEN
              </span>
            </div>
            <div className="portal-line-3 absolute inset-x-0 flex justify-center">
              <span className="text-cinematic text-white text-[14vw] md:text-[10vw] glow-yellow">
                BREAK
              </span>
            </div>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-6 left-6 md:left-12 right-6 md:right-12 flex justify-between font-mono text-[10px] tracking-[0.4em] text-white/40">
          <span>WARP_STAGE · 03/03</span>
          <span className="text-neon-yellow">CONTAINMENT_HOLDING</span>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Finale — four scroll-driven beats.
 *
 *   1 · DISTANCE      Both versions start *far* apart, faint, deep in z.
 *                     There is a deliberate horizontal gap between them
 *                     so the viewer can read the "two of me" composition.
 *
 *   2 · APPROACH      As scroll progresses they ease forward, the gap
 *                     between them closes. By the end of this beat the
 *                     fighter is settled behind-right (z < 0), and the
 *                     developer is in front-left (z > 0), slightly higher
 *                     so he visually sits *on top* of the fighter.
 *
 *   3 · TEXT + ZOOM   "TWO WORLDS · ONE MIND" appears at the bottom in
 *                     mix-blend. Then both portraits AND the text rush
 *                     toward the camera (z and scale climbing together).
 *                     Colors stay TRUE — no brightness fade. The lockup
 *                     detonates: each glyph flies off on its own vector.
 *                     The figures overshoot the lens.
 *
 *   4 · THE END       Black → theend.png emerges full-bleed (the fighter
 *                     on a planet, facing a wormhole). A bottom scrim holds
 *                     one clean, centered lockup: name · tagline · value
 *                     line · contact. No clutter — the close breathes.
 */

/**
 * The closing line — an editorial epigraph in italic serif.
 * Three short lines fit the shatter beat without crowding the figures.
 * Opening/closing quotation marks are baked into the first/last line.
 */
const TITLE_LINES = [
  '«За каждым сильным разумом',
  'стоит версия себя,',
  'которая не сдалась.»',
];

export default function Finale() {
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
          end: '+=700%',
          scrub: 1.1,
          pin: pin,
          pinSpacing: true,
        },
      });

      // ─── BEAT 1 · DISTANCE → BEAT 2 · APPROACH (0.00 – 0.40) ──────
      // Both come in from far away, gap between them gradually closes,
      // and they settle BIG — almost filling the screen — so the viewer
      // reads "two of me" clearly before the text appears.

      tl.fromTo(
        '.fin-fighter',
        {
          x: '34vw',
          y: '2vh',
          z: -2600,
          scale: 0.3,
          opacity: 0,
          rotateY: -6,
        },
        {
          x: '15vw',          // settled right, BEHIND + a touch lower
          y: '4vh',
          z: -250,
          scale: 1.25,        // BIG — fills its side of the frame
          opacity: 1,
          rotateY: 0,
          duration: 0.40,
          ease: 'power1.inOut',
        },
        0,
      );

      tl.fromTo(
        '.fin-dev',
        {
          x: '-34vw',
          y: '-2vh',
          z: -2600,
          scale: 0.3,
          opacity: 0,
          rotateY: 6,
        },
        {
          x: '-15vw',         // settled left, IN FRONT, slightly higher
          y: '-3vh',
          z: 220,
          scale: 1.35,        // BIG — fills its side of the frame
          opacity: 1,
          rotateY: 0,
          duration: 0.40,
          ease: 'power1.inOut',
        },
        0,
      );

      // ─── BEAT 2.5 · HOLD (0.40 – 0.50) ──────────────────────────────
      // Brief breath — figures stand huge in the void before the line lands.
      tl.to({}, { duration: 0.10 }, 0.40);

      // ─── BEAT 3a · TEXT REVEAL — per-line so each line fully lands
      //   (0.50 – 0.68). Per-char stagger is tiny so chars in a line come in
      //   nearly together; lines stagger 0.05 apart. All three are fully
      //   visible BEFORE shatter starts.
      tl.fromTo(
        '.fin-stmt-line',
        { opacity: 0, y: 24, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.06,
          stagger: 0.05,
          ease: 'power2.out',
        },
        0.50,
      );
      tl.fromTo(
        '.fin-stmt-char',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.02,
          stagger: 0.0015,
          ease: 'power2.out',
        },
        0.50,
      );

      // Hold the full quote so the reader can take it in (0.62 – 0.72)
      tl.to({}, { duration: 0.10 }, 0.62);

      // ─── BEAT 3b · ZOOM-THROUGH + SHATTER (0.72 – 0.85) ─────────────
      // Portraits + text rush forward TOGETHER and overshoot the lens.

      tl.to(
        '.fin-dev',
        {
          z: 1600,
          scale: 3.2,
          x: '-2vw',
          y: '0vh',
          duration: 0.13,
          ease: 'power2.in',
        },
        0.72,
      );
      tl.to(
        '.fin-fighter',
        {
          z: 1900,
          scale: 3.4,
          x: '3vw',
          y: '0vh',
          duration: 0.13,
          ease: 'power2.in',
        },
        0.72,
      );

      // Text grows as it shatters
      tl.to(
        '.fin-stmt-line',
        { scale: 1.25, duration: 0.08 },
        0.72,
      );
      tl.to(
        '.fin-stmt-char',
        {
          x: (i: number, el: HTMLElement) => parseFloat(el.dataset.dx || '0'),
          y: (i: number, el: HTMLElement) => parseFloat(el.dataset.dy || '0'),
          rotate: (i: number, el: HTMLElement) => parseFloat(el.dataset.dr || '0'),
          scale: (i: number, el: HTMLElement) => parseFloat(el.dataset.ds || '1'),
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.10,
          ease: 'power2.in',
          stagger: 0.0015,
        },
        0.74,
      );

      // Portraits punch through the lens
      tl.to(
        '.fin-dev',
        { opacity: 0, scale: 4.6, duration: 0.06, ease: 'power2.in' },
        0.80,
      );
      tl.to(
        '.fin-fighter',
        { opacity: 0, scale: 5.0, duration: 0.07, ease: 'power2.in' },
        0.80,
      );

      // ─── BEAT 4 · THE END (0.80 – 1.00) ─────────────────────────────
      // theend.png materializes from the dark
      tl.fromTo(
        '.fin-end-bg',
        { opacity: 0, scale: 1.12, filter: 'blur(16px) brightness(0.3)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px) brightness(0.95)',
          duration: 0.16,
          ease: 'power2.out',
        },
        0.80,
      );

      // Bottom content (kicker · name · tagline · value · contact) rises in
      tl.fromTo(
        '.fin-rv',
        { opacity: 0, y: 50, filter: 'blur(14px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.12,
          stagger: 0.06,
          ease: 'power3.out',
        },
        0.86,
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="finale" ref={wrapRef} className="relative w-full bg-ink-0">
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden perspective-2000"
      >
        {/* ── Backdrop for Beats 1-3 — pure void ─────────────────────── */}
        <div className="absolute inset-0 bg-ink-0" />

        {/* ── THE TWO ME's ───────────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none preserve-3d">
          {/* Fighter — settles BEHIND, right of center */}
          <div
            className="fin-fighter absolute will-change-transform"
            style={{ opacity: 0 }}
          >
            <Portrait src="/hero-helmet.jpg" shiftY="-3%" />
          </div>

          {/* Developer — settles IN FRONT, left of center, slightly higher */}
          <div
            className="fin-dev absolute will-change-transform"
            style={{ opacity: 0 }}
          >
            <Portrait src="/hero-face.jpg" shiftY="1%" />
          </div>
        </div>

        {/* ── HUD — single quiet marker ─────────────────────────────── */}
        <div className="absolute top-24 left-6 md:left-12 z-[45] flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/35">
          <span>07</span>
          <span className="w-8 h-px bg-neon-yellow" />
          <span className="text-neon-yellow">FINALE</span>
        </div>

        {/* ── BEAT 3a — closing credo, below the figures ──────────────
            Editorial italic serif. All three lines share a single tone so
            none gets lost against the dark backdrop. Subtle gold accent
            on the middle line keeps the eye centered.                     */}
        <div className="absolute inset-x-0 bottom-[6vh] md:bottom-[10vh] z-20 pointer-events-none flex flex-col items-center gap-2 md:gap-3 px-5 text-center">
          {TITLE_LINES.map((line, lineIdx) => (
            <ShatterLine
              key={line}
              text={line}
              lineIdx={lineIdx}
              tone={
                lineIdx === 1
                  ? 'text-quote text-gold glow-gold'
                  : 'text-quote text-white glow-gold'
              }
            />
          ))}
        </div>

        {/* ── BEAT 4 · THE END ────────────────────────────────────────
            Desktop: full-bleed cosmic photo with text overlaid on bottom scrim.
            Mobile:  photo confined to the upper half (object-contain so the
                     whole frame is visible), with strong black gradients above
                     and below it; the text block lives in the lower half on
                     pure black.                                              */}
        <div
          className="fin-end-bg absolute inset-0 z-[35] pointer-events-none bg-ink-0"
          style={{ opacity: 0 }}
        >
          {/* Photo container — bounded on mobile, full-bleed on desktop. */}
          <div className="absolute left-0 right-0 top-[6vh] bottom-[52vh] md:inset-0">
            <Image
              src="/theend.png"
              alt="Алишер Гафуров — два мира, один характер"
              fill
              priority={false}
              className="object-contain object-center md:object-cover md:object-center"
              style={{ filter: 'brightness(0.95) contrast(1.08)' }}
              sizes="100vw"
            />
          </div>

          {/* Top scrim — fades black down into the photo (keeps the FINALE
              marker and navbar legible) */}
          <div
            className="absolute inset-x-0 top-0 h-[18vh] md:h-[26%]"
            style={{
              background:
                'linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.6) 55%, transparent 100%)',
            }}
          />
          {/* Bottom scrim — on mobile, fades the photo's bottom into solid
              black so the text block sits on pure ink. On desktop it's the
              usual bottom-of-screen scrim under the lockup. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[54vh] md:h-[56%]"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.75) 22%, #050505 55%, #050505 100%)',
            }}
          />
          <div className="scanlines absolute inset-0 opacity-[0.06]" />
        </div>

        {/* ── BEAT 4 · closing lockup — one clean, centered block ──────── */}
        <div className="absolute inset-x-0 bottom-0 z-[40] flex flex-col items-center text-center px-5 md:px-12 pb-7 md:pb-10">
          {/* Theme kicker */}
          <div
            className="fin-rv font-mono text-[9px] md:text-[11px] tracking-[0.5em] text-white/55"
            style={{ opacity: 0 }}
          >
            ДВА МИРА <span className="text-neon-yellow">·</span> ОДИН ХАРАКТЕР
          </div>

          {/* Name */}
          <h2
            className="fin-rv text-cinematic text-white leading-[0.86] text-[14vw] sm:text-[11vw] md:text-[7vw] lg:text-[5.5rem] mt-4 md:mt-5"
            style={{ opacity: 0, textShadow: '0 6px 40px rgba(0,0,0,0.6)' }}
          >
            ALISHER <span className="text-holographic">GAFUROV</span>
          </h2>

          {/* Tagline */}
          <div
            className="fin-rv mt-4 font-mono text-[9px] md:text-[12px] tracking-[0.4em] text-white/65"
            style={{ opacity: 0 }}
          >
            FULL-STACK РАЗРАБОТЧИК <span className="text-white/35">×</span> MMA БОЕЦ
          </div>

          {/* Value line */}
          <p
            className="fin-rv mt-5 max-w-[620px] text-white/80 text-base md:text-xl leading-snug"
            style={{ opacity: 0 }}
          >
            Создаю современные сайты{' '}
            <span className="text-holographic">для вашего бизнеса.</span>
          </p>

          {/* Contact bar */}
          <div
            className="fin-rv mt-7 md:mt-9 w-full max-w-[920px] pt-5 border-t border-white/12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pointer-events-auto"
            style={{ opacity: 0 }}
          >
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 font-mono text-[10px] md:text-[11px] tracking-[0.25em]">
              <a
                href="https://t.me/alishergafurovv"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
                className="group inline-flex items-center gap-2 text-white hover:text-neon-blue transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue" style={{ boxShadow: '0 0 8px #00FFFF' }} />
                TELEGRAM
                <span className="text-white/50 group-hover:text-neon-blue transition-colors">@alishergafurovv</span>
              </a>
              <a href="mailto:gafurovalyosha@gmail.com" data-hover className="text-white/70 hover:text-neon-yellow transition-colors">
                gafurovalyosha@gmail.com
              </a>
            </div>
            <span className="font-mono text-[9px] tracking-[0.4em] text-white/35 text-center sm:text-right">
              © 2026 АЛИШЕР ГАФУРОВ
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── ShatterLine — each glyph carries a pre-baked random vector that the
   timeline animates to during the zoom-through. ────────────────────── */
function ShatterLine({
  text,
  lineIdx,
  tone,
}: {
  text: string;
  lineIdx: number;
  tone: string;
}) {
  const chars = text.split('');
  // Deterministic-but-varied seed per (line, char) — sin-based so SSR + CSR agree.
  const seed = (i: number) => {
    const s = Math.sin((lineIdx + 1) * 71 + i * 33) * 10000;
    return s - Math.floor(s);
  };

  return (
    <div className={`fin-stmt-line ${tone} text-[6.5vw] sm:text-[5vw] md:text-[3.6vw] lg:text-[3rem] will-change-transform whitespace-nowrap`}>
      {chars.map((c, i) => {
        const r1 = seed(i);
        const r2 = seed(i + 100);
        const r3 = seed(i + 200);
        const r4 = seed(i + 300);
        const half = chars.length / 2;
        const horizBias = (i - half) / half; // -1 .. 1
        const dx = (horizBias * 80 + (r1 - 0.5) * 260).toFixed(1);
        const dy = (-140 + (r2 - 0.5) * 240 - (lineIdx === 0 ? 60 : -40)).toFixed(1);
        const dr = ((r3 - 0.5) * 260).toFixed(1);
        const ds = (0.4 + r4 * 0.6).toFixed(2);

        return (
          <span
            key={i}
            className="fin-stmt-char inline-block will-change-transform"
            data-dx={dx}
            data-dy={dy}
            data-dr={dr}
            data-ds={ds}
            style={{
              opacity: 0,
              width: c === ' ' ? '0.32em' : undefined,
            }}
          >
            {c === ' ' ? ' ' : c}
          </span>
        );
      })}
    </div>
  );
}

/* ── Portrait used in Beats 1-3 — LARGE figure that fills most of its
   half of the viewport. Combined with the GSAP scale on the wrapper, the
   two portraits read as near-fullscreen at the settle point. ─────────── */
function Portrait({ src, shiftY }: { src: string; shiftY: string }) {
  return (
    <div className="relative w-[78vw] sm:w-[62vw] md:w-[52vw] lg:w-[44vw] max-w-[680px] aspect-[3/4]">
      <Image
        src={src}
        alt=""
        fill
        className="object-contain"
        style={{
          transform: `translateY(${shiftY})`,
          filter: 'brightness(1.06) contrast(1.06) saturate(1.02)',
        }}
        sizes="(max-width:640px) 78vw, (max-width:1024px) 52vw, 680px"
      />
      {/* soft ground fade so the figure melts into the void */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.9) 100%)',
        }}
      />
    </div>
  );
}

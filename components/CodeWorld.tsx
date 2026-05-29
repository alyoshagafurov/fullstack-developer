'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * CodeWorld — Dimension I. The programmer's terminal.
 *
 * A single editor window is pinned at center. As the user scrolls, three
 * oversized *code* lines type themselves into the file and stay — they read
 * like the return value of `whoAmI()`:
 *
 *     "I BUILD",
 *     "DIGITAL",
 *     "INTERFACES",
 *
 * The headline now lives INSIDE the monitor, in monospace, with line numbers
 * and string syntax — not as floating display type over the screen.
 */

const LINES = ['I BUILD', 'DIGITAL', 'INTERFACES'] as const;

export default function CodeWorld() {
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
          pin,
          pinSpacing: true,
        },
      });

      // Camera settles, monitor rises into frame
      tl.fromTo(
        '.cw-bg',
        { scale: 1.12, filter: 'brightness(0.28) blur(8px)' },
        { scale: 1, filter: 'brightness(0.45) blur(0px)', duration: 0.32 },
        0,
      );
      tl.fromTo(
        '.cw-grid',
        { opacity: 0, y: 80 },
        { opacity: 0.35, y: 0, duration: 0.32 },
        0,
      );
      tl.fromTo(
        '.cw-monitor',
        { y: 120, opacity: 0, rotateX: 10 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.34, ease: 'power3.out' },
        0.04,
      );

      // Context rows fade in (the scaffolding around the headline)
      tl.fromTo(
        '.cw-ctx',
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.08, stagger: 0.03 },
        0.22,
      );

      // The three big lines type in, one per beat, and STAY on screen
      LINES.forEach((_, i) => {
        const at = 0.36 + i * 0.18;
        tl.fromTo(
          `.cw-line-${i}`,
          { opacity: 0, y: 28, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.14, ease: 'power3.out' },
          at,
        );
        tl.fromTo(
          `.cw-caret-${i}`,
          { opacity: 1 },
          { opacity: 0, duration: 0.08 },
          at + 0.14,
        );
      });

      // Gentle final push-in so the lockup feels resolved
      tl.to('.cw-monitor', { scale: 1.03, duration: 0.18 }, 0.92);
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="code" ref={wrapRef} className="relative w-full bg-ink-0">
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden perspective-2000"
      >
        {/* Color-graded workspace backdrop */}
        <div className="cw-bg absolute inset-0">
          <Image
            src="/workspace.jpg"
            alt=""
            fill
            className="object-cover"
            style={{
              filter:
                'brightness(0.45) contrast(1.12) saturate(0.7) hue-rotate(175deg)',
            }}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.35) 40%, rgba(5,5,5,0.92) 100%)',
            }}
          />
        </div>

        {/* Perspective grid floor */}
        <div
          className="cw-grid absolute left-0 right-0 bottom-0 h-[55vh] pointer-events-none origin-top"
          style={{
            transform: 'perspective(900px) rotateX(66deg)',
            background:
              'linear-gradient(rgba(0,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            opacity: 0,
          }}
        />

        {/* Section marker — single, quiet */}
        <SectionTag index="02" label="THE CODE" color="#00FFFF" />

        {/* The editor window */}
        <div className="absolute inset-0 flex items-center justify-center px-5 md:px-8 pointer-events-none">
          <div
            className="cw-monitor relative w-[92vw] max-w-[1060px] border border-neon-blue/20 backdrop-blur-md preserve-3d will-change-transform"
            style={{
              opacity: 0,
              background:
                'linear-gradient(160deg, rgba(13,13,13,0.82), rgba(16,24,32,0.82))',
              boxShadow:
                '0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,255,0.08), inset 0 0 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between px-5 h-11 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-[10px] tracking-[0.25em] text-white/40">
                  ~/alisher — identity.ts
                </span>
              </div>
              <span className="font-mono text-[9px] tracking-[0.3em] text-neon-blue/70">
                ● RUNNING
              </span>
            </div>

            {/* Code body */}
            <div className="px-4 md:px-9 py-6 md:py-10">
              <Ctx n="01">
                <span className="text-neon-purple/90">export function</span>{' '}
                <span className="text-neon-blue/90">whoAmI</span>() {'{'}
              </Ctx>
              <Ctx n="02">{'  return ['}</Ctx>

              <BigLine i={0} n="03" tone="text-white">
                {LINES[0]}
              </BigLine>
              <BigLine i={1} n="04" tone="text-holographic">
                {LINES[1]}
              </BigLine>
              <BigLine i={2} n="05" tone="text-neon-blue">
                {LINES[2]}
              </BigLine>

              <Ctx n="06">{'  ];'}</Ctx>
              <Ctx n="07">{'}'}</Ctx>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-5 h-9 border-t border-white/10 font-mono text-[9px] tracking-[0.3em] text-white/35">
              <span>TYPESCRIPT · UTF-8</span>
              <span className="text-neon-yellow/80">BUILD · PASSING</span>
            </div>

            <Corners color="rgba(0,255,255,0.6)" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Small context row (the scaffolding code) ─────────────────────────── */
function Ctx({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="cw-ctx flex items-baseline gap-3 md:gap-5 font-mono text-[11px] md:text-[15px] leading-7 md:leading-8 text-white/45">
      <span className="w-5 md:w-7 shrink-0 text-right text-white/20 select-none">
        {n}
      </span>
      <span className="whitespace-pre">{children}</span>
    </div>
  );
}

/* ── Oversized headline line, still rendered as a code string ─────────── */
function BigLine({
  i,
  n,
  tone,
  children,
}: {
  i: number;
  n: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`cw-line-${i} flex items-baseline gap-3 md:gap-5 will-change-transform`}
      style={{ opacity: 0 }}
    >
      <span className="w-5 md:w-7 shrink-0 text-right font-mono text-[11px] md:text-[15px] text-white/20 select-none">
        {n}
      </span>
      <span className="flex items-baseline gap-1 md:gap-2 pl-3 md:pl-6">
        <span className="font-mono text-neon-yellow/60 text-xl md:text-3xl leading-none">
          &quot;
        </span>
        <span
          className={`font-mono font-medium ${tone} text-[8.5vw] md:text-[4.6vw] lg:text-[3.5rem] leading-[1.06] tracking-tight`}
        >
          {children}
        </span>
        <span className="font-mono text-neon-yellow/60 text-xl md:text-3xl leading-none">
          &quot;,
        </span>
        <span
          className={`cw-caret-${i} inline-block w-[3px] md:w-[5px] self-stretch bg-neon-blue/80 ml-1`}
          style={{ boxShadow: '0 0 10px rgba(0,255,255,0.7)' }}
        />
      </span>
    </div>
  );
}

/* ── Quiet section marker, top-left ───────────────────────────────────── */
function SectionTag({
  index,
  label,
  color,
}: {
  index: string;
  label: string;
  color: string;
}) {
  return (
    <div className="absolute top-24 left-6 md:left-12 z-30 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/35">
      <span>{index}</span>
      <span className="w-8 h-px" style={{ background: color }} />
      <span style={{ color }}>{label}</span>
    </div>
  );
}

function Corners({ color }: { color: string }) {
  const c = { borderColor: color };
  return (
    <>
      <span className="absolute -top-px -left-px w-3 h-3 border-t border-l" style={c} />
      <span className="absolute -top-px -right-px w-3 h-3 border-t border-r" style={c} />
      <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l" style={c} />
      <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r" style={c} />
    </>
  );
}

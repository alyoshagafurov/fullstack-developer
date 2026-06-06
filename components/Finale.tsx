'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * Finale — an awwwards-style closing scene.
 *
 * The cosmic photo becomes a soft, blurred nebula of light (no competing
 * figure). Over it, the two portraits read as one cohesive blue-duotone
 * diptych: matched grade, a hairline divider between them, and a clean bottom
 * fade so they ground into the dark instead of floating. Strong centered type,
 * a skills ticker, and one call to action. Generous spacing throughout.
 */

const MARQUEE = [
  'FULL-STACK',
  'REACT',
  'NEXT.JS',
  'NODE.JS',
  'TYPESCRIPT',
  'UI / UX',
  'АНИМАЦИИ',
  'САЙТЫ ПОД КЛЮЧ',
];

export default function Finale() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="finale"
      ref={ref}
      className="relative w-full bg-dark text-white px-5 md:px-12 py-24 md:py-32 overflow-hidden"
    >
      {/* ── Background: cosmic photo blurred into pure light + blue grade ── */}
      <div className="absolute inset-0">
        <Image
          src="/theend.png"
          alt=""
          fill
          data-parallax="0.06"
          data-pscale="1.2"
          className="object-cover object-center will-change-transform"
          style={{ filter: 'blur(46px) brightness(0.42) saturate(1.15)' }}
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 32%, rgba(79,138,224,0.20) 0%, transparent 62%), linear-gradient(180deg, rgba(4,6,12,0.65) 0%, rgba(4,6,12,0.35) 40%, rgba(4,6,12,0.9) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-content w-full flex flex-col items-center text-center">
        {/* Kicker */}
        <div
          data-reveal="0"
          className="flex items-center justify-center gap-3 label text-[10px] text-white/55"
        >
          <span className="w-10 h-px bg-gradient-to-r from-transparent to-accent" />
          ДВА МИРА <span className="text-accent-soft">·</span> ОДИН ХАРАКТЕР
          <span className="w-10 h-px bg-gradient-to-l from-transparent to-accent" />
        </div>

        {/* Duotone diptych */}
        <div className="relative mt-10 md:mt-14 w-full max-w-[300px] sm:max-w-[560px] md:max-w-[720px] grid grid-cols-2 gap-px">
          <DuoPortrait src="/hero-face.jpg" reveal="1" />
          <DuoPortrait src="/hero-helmet.jpg" reveal="2" />

          {/* Hairline divider where the two worlds meet */}
          <div className="pointer-events-none absolute left-1/2 top-[10%] bottom-[26%] w-px -translate-x-1/2 z-10 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        </div>

        {/* Name */}
        <h2
          data-reveal="1"
          className="text-cinematic leading-[0.88] text-[13.5vw] sm:text-[11vw] md:text-[8vw] lg:text-[6.5rem] text-white -mt-[6%] sm:-mt-[5%] md:-mt-[4%]"
          style={{ textShadow: '0 8px 50px rgba(4,6,12,0.7)' }}
        >
          ALISHER <span className="text-gradient">GAFUROV</span>
        </h2>

        {/* Role */}
        <div data-reveal="2" className="mt-5 label text-[10px] md:text-[11px] text-white/65">
          FULL-STACK РАЗРАБОТЧИК <span className="text-white/30">·</span> ДУШАНБЕ
        </div>

        {/* Value */}
        <p
          data-reveal="2"
          className="mt-6 max-w-[640px] text-white/85 text-lg md:text-2xl leading-snug"
        >
          Создаю современные сайты,{' '}
          <span className="text-gradient">которые работают на ваш бизнес.</span>
        </p>

        {/* CTA */}
        <a
          data-reveal="3"
          data-hover
          href="https://t.me/alishergafurovv"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-9 inline-flex items-center gap-3 rounded-full px-8 py-4 bg-accent text-white label text-[11px] hover:bg-accent-deep transition-colors duration-300"
        >
          ОБСУДИТЬ ПРОЕКТ
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>

        {/* Skills ticker */}
        <div data-reveal="0" className="mt-16 md:mt-20 w-full mask-fade-x">
          <div className="marquee-track">
            <Ticker />
            <Ticker />
          </div>
        </div>

        {/* Contacts */}
        <div
          data-reveal="3"
          className="mt-12 md:mt-16 w-full max-w-[820px] pt-6 border-t border-white/12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 label text-[10px] tracking-[0.2em]">
            <a
              href="https://t.me/alishergafurovv"
              target="_blank"
              rel="noopener noreferrer"
              data-hover
              className="inline-flex items-center gap-2 text-white hover:text-accent-soft transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-soft" />
              TELEGRAM
              <span className="text-white/50 normal-case tracking-normal">@alishergafurovv</span>
            </a>
            <a
              href="mailto:gafurovalyosha@gmail.com"
              data-hover
              className="text-white/70 hover:text-accent-soft transition-colors normal-case tracking-normal"
            >
              gafurovalyosha@gmail.com
            </a>
          </div>
          <span className="label text-[9px] text-white/35 text-center sm:text-right">
            © 2026 АЛИШЕР ГАФУРОВ
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── One repetition of the ticker text ─────────────────────────────────── */
function Ticker() {
  return (
    <div className="flex items-center shrink-0">
      {MARQUEE.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-6 md:px-8 label text-sm md:text-base text-white/35">
            {w}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
        </span>
      ))}
    </div>
  );
}

/* ── Half of the diptych — blue-duotone, bottom-faded, no frame/label ──── */
function DuoPortrait({ src, reveal }: { src: string; reveal: string }) {
  const fade =
    'linear-gradient(180deg, #000 0%, #000 60%, rgba(0,0,0,0.5) 82%, transparent 100%)';
  return (
    <div
      data-reveal={reveal}
      data-hover
      className="group relative aspect-[3/4] overflow-hidden"
      style={{ WebkitMaskImage: fade, maskImage: fade }}
    >
      <Image
        src={src}
        alt=""
        fill
        data-parallax="0.05"
        data-pscale="1.1"
        className="object-cover object-[center_12%] will-change-transform"
        style={{ filter: 'grayscale(0.75) contrast(1.08) brightness(0.92)' }}
        sizes="(max-width:768px) 50vw, 360px"
      />
      {/* Blue duotone wash — eases off on hover to reveal the real photo */}
      <div
        className="absolute inset-0 transition-opacity duration-500 opacity-100 group-hover:opacity-30"
        style={{
          background:
            'linear-gradient(165deg, rgba(60,110,190,0.55) 0%, rgba(11,26,51,0.65) 100%)',
          mixBlendMode: 'color',
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500 opacity-100 group-hover:opacity-40"
        style={{
          background:
            'linear-gradient(180deg, transparent 40%, rgba(8,16,32,0.5) 100%)',
        }}
      />
    </div>
  );
}

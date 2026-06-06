'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * Finale — a modern, professional closing scene.
 *
 * The cosmic "fighter in space" photo lives in the background. Over it, the two
 * portraits float frameless — no cards, no borders, no labels — their edges
 * masked so they melt into the scene. Below: the name and a clear, business-
 * focused statement with a single call to action.
 */
export default function Finale() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="finale"
      ref={ref}
      className="relative w-full min-h-screen flex flex-col justify-center bg-dark text-white px-5 md:px-12 py-24 md:py-28 overflow-hidden"
    >
      {/* Cosmic background */}
      <div className="absolute inset-0">
        <Image
          src="/theend.png"
          alt=""
          fill
          data-parallax="0.04"
          data-pscale="1.14"
          className="object-cover object-center will-change-transform"
          style={{ filter: 'brightness(0.5) contrast(1.06) saturate(1.05)' }}
          sizes="100vw"
        />
        {/* Legibility scrims + blue grade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4,6,12,0.92) 0%, rgba(4,6,12,0.45) 32%, rgba(4,6,12,0.55) 62%, rgba(4,6,12,0.95) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(75% 55% at 50% 38%, rgba(79,138,224,0.16), transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-content w-full flex flex-col items-center text-center">
        {/* Kicker */}
        <div
          data-reveal="0"
          className="flex items-center justify-center gap-3 label text-[10px] text-white/60"
        >
          <span className="w-8 h-px bg-accent" />
          ДВА МИРА <span className="text-accent-soft">·</span> ОДИН ХАРАКТЕР
          <span className="w-8 h-px bg-accent" />
        </div>

        {/* Frameless portraits — no card, no border, no label */}
        <div className="mt-10 md:mt-12 flex items-end justify-center gap-3 sm:gap-8 md:gap-14">
          <FramelessPortrait src="/hero-face.jpg" reveal="1" />
          <FramelessPortrait src="/hero-helmet.jpg" reveal="2" />
        </div>

        {/* Name */}
        <h2
          data-reveal="1"
          className="text-cinematic leading-[0.9] text-[13.5vw] sm:text-[11vw] md:text-[7vw] lg:text-[5.5rem] text-white mt-12 md:mt-16"
          style={{ textShadow: '0 6px 40px rgba(0,0,0,0.6)' }}
        >
          ALISHER <span className="text-gradient">GAFUROV</span>
        </h2>

        {/* Role */}
        <div data-reveal="2" className="mt-5 label text-[10px] md:text-[11px] text-white/70">
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

        {/* Contacts */}
        <div
          data-reveal="3"
          className="mt-12 md:mt-14 w-full max-w-[820px] pt-6 border-t border-white/12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
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

/* ── A portrait with no frame, no background and no label — its edges are
   masked so it dissolves softly into the cosmic backdrop. ──────────────── */
function FramelessPortrait({ src, reveal }: { src: string; reveal: string }) {
  const mask =
    'radial-gradient(115% 92% at 50% 40%, #000 45%, rgba(0,0,0,0.6) 66%, transparent 82%)';
  return (
    <div
      data-reveal={reveal}
      className="relative w-[42vw] sm:w-[34vw] md:w-[270px] lg:w-[310px] aspect-[3/4]"
    >
      <Image
        src={src}
        alt=""
        fill
        data-parallax="0.05"
        data-pscale="1.1"
        className="object-cover object-[center_14%] will-change-transform"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          filter: 'contrast(1.05)',
        }}
        sizes="(max-width:768px) 42vw, 310px"
      />
    </div>
  );
}

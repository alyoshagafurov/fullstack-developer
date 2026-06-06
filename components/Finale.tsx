'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * Finale — the closing statement. A grand "two worlds, one mind" diptych:
 * the developer and the fighter stand side by side as two large, commanding
 * portraits — you face both versions of him at once. Below: the name lockup,
 * the credo, and contacts. Black + dark-blue, cinematic, fully responsive.
 */

const QUOTE = [
  '«За каждым сильным разумом',
  'стоит версия себя,',
  'которая не сдалась.»',
];

export default function Finale() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="finale"
      ref={ref}
      className="relative w-full bg-dark text-white px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      {/* Atmospheric blue glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, rgba(79,138,224,0.16) 0%, transparent 55%), radial-gradient(60% 45% at 50% 100%, rgba(56,182,216,0.10) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-content">
        {/* Kicker */}
        <div
          data-reveal="0"
          className="flex items-center justify-center gap-3 label text-[10px] text-white/55 mb-8 md:mb-12"
        >
          <span className="w-8 h-px bg-accent" />
          ДВА МИРА <span className="text-accent-soft">·</span> ОДИН ХАРАКТЕР
          <span className="w-8 h-px bg-accent" />
        </div>

        {/* Credo */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          {QUOTE.map((line, i) => (
            <p
              key={line}
              data-reveal={String(i)}
              className={`text-quote text-[7vw] sm:text-[5vw] md:text-[3.4vw] lg:text-[2.7rem] ${
                i === 1 ? 'text-accent-soft' : 'text-white/90'
              }`}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Diptych — the two worlds */}
        <div className="relative grid grid-cols-2 gap-3 sm:gap-5 md:gap-8">
          <PortraitCard
            src="/hero-face.jpg"
            num="01"
            tag="DEV"
            role="Разработчик"
            reveal="1"
          />
          <PortraitCard
            src="/hero-helmet.jpg"
            num="02"
            tag="FIGHT"
            role="Боец"
            reveal="2"
          />

          {/* Center badge where the two worlds meet */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-dark border border-white/15 backdrop-blur-sm">
            <span className="text-cinematic text-accent-soft text-xl md:text-3xl leading-none">
              ×
            </span>
          </div>
        </div>

        {/* Name lockup */}
        <div className="text-center mt-16 md:mt-24">
          <h2
            data-reveal="1"
            className="text-cinematic leading-[0.9] text-[13.5vw] sm:text-[11vw] md:text-[7vw] lg:text-[5.5rem] text-white"
          >
            ALISHER <span className="text-gradient">GAFUROV</span>
          </h2>

          <div data-reveal="2" className="mt-5 label text-[10px] md:text-[11px] text-white/65">
            FULL-STACK РАЗРАБОТЧИК <span className="text-white/35">×</span> MMA БОЕЦ
          </div>

          <p
            data-reveal="2"
            className="mt-6 max-w-[620px] mx-auto text-white/85 text-base md:text-xl leading-snug"
          >
            Создаю современные сайты{' '}
            <span className="text-gradient">для вашего бизнеса.</span>
          </p>

          {/* Contact bar */}
          <div
            data-reveal="3"
            className="mt-10 md:mt-12 w-full max-w-[920px] mx-auto pt-6 border-t border-white/12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 label text-[10px] md:text-[11px] tracking-[0.2em]">
              <a
                href="https://t.me/alishergafurovv"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
                className="group inline-flex items-center gap-2 text-white hover:text-accent-soft transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-soft" />
                TELEGRAM
                <span className="text-white/50 group-hover:text-accent-soft transition-colors normal-case tracking-normal">
                  @alishergafurovv
                </span>
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
      </div>
    </section>
  );
}

/* ── One half of the diptych — a large, framed portrait with a role label ── */
function PortraitCard({
  src,
  num,
  tag,
  role,
  reveal,
}: {
  src: string;
  num: string;
  tag: string;
  role: string;
  reveal: string;
}) {
  return (
    <div
      data-reveal={reveal}
      data-hover
      className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-paper-2 transition-colors duration-500 hover:border-accent/60"
    >
      <Image
        src={src}
        alt={role}
        fill
        data-parallax="0.05"
        data-pscale="1.14"
        className="object-cover object-[center_15%] will-change-transform"
        sizes="(max-width:768px) 45vw, 560px"
      />

      {/* Top accent line that grows on hover */}
      <span className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-accent transition-[width] duration-500 z-10" />

      {/* Blue tint + bottom scrim */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,10,17,0) 35%, rgba(7,10,17,0.55) 70%, rgba(7,10,17,0.92) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(180deg, rgba(79,138,224,0.12), transparent 60%)' }}
      />

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-7 z-10">
        <div className="flex items-center gap-1.5 md:gap-2 label text-[8px] md:text-[10px] text-accent-soft mb-1 md:mb-2">
          <span>{num}</span>
          <span className="w-4 md:w-7 h-px bg-accent-soft/60" />
          <span>{tag}</span>
        </div>
        <div className="text-cinematic text-white text-[5vw] sm:text-2xl md:text-4xl lg:text-5xl leading-none">
          {role}
        </div>
      </div>

      {/* Corner ticks */}
      <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/25 z-10" />
    </div>
  );
}

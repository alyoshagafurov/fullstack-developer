'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * Discipline — the fighter side, told calmly. No pinned cinema, no red neon,
 * no scanlines: just a clear statement, the principles MMA gives, and a few
 * framed photos. Normal vertical scroll.
 */

const PRINCIPLES = [
  'Режим вместо отговорок',
  'Работа через усталость',
  'Спокойствие под давлением',
  'Характер, который виден в деле',
];

export default function FightWorld() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="fight"
      ref={ref}
      className="relative w-full bg-paper-2 px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-content">
        <div
          data-reveal="0"
          className="flex items-center gap-3 label text-[10px] text-muted mb-12 md:mb-16"
        >
          <span>05</span>
          <span className="w-10 h-px bg-accent" />
          <span className="text-accent">ХАРАКТЕР</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Text */}
          <div className="lg:col-span-6">
            <h2
              data-reveal="1"
              className="text-cinematic text-ink text-[11vw] md:text-[5.2vw] lg:text-[3.6rem] leading-[1.0] mb-8"
            >
              Дисциплина,
              <br />
              характер,{' '}
              <span className="text-gradient">выдержка.</span>
            </h2>

            <p
              data-reveal="2"
              className="text-ink-2 text-base md:text-lg leading-relaxed max-w-xl mb-10"
            >
              Помимо разработки я занимаюсь MMA. Спорт даёт то, что невозможно
              подделать — дисциплину, выдержку и характер. Те же качества я
              приношу в каждый проект.
            </p>

            <div data-reveal="3" className="space-y-4 mb-10">
              {PRINCIPLES.map((p) => (
                <div key={p} className="flex items-center gap-4">
                  <span className="w-7 h-px shrink-0 bg-accent" />
                  <span className="text-ink text-base md:text-lg">{p}</span>
                </div>
              ))}
            </div>

            <div
              data-reveal="4"
              className="rounded-2xl border border-line bg-paper p-6 md:p-7"
            >
              <p className="text-ink text-sm md:text-base leading-relaxed">
                Характер, закалённый в зале —{' '}
                <span className="text-accent font-medium">
                  дисциплина, которая работает в коде.
                </span>
              </p>
            </div>
          </div>

          {/* Feature image */}
          <div data-reveal="2" className="lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
              <Image
                src="/mma-moment-1.jpg"
                alt="Алишер Гафуров — MMA"
                fill
                data-parallax="0.05"
                data-pscale="1.14"
                className="object-cover will-change-transform"
                style={{ filter: 'contrast(1.05) brightness(1.0)' }}
                sizes="(max-width:1024px) 90vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* Secondary images */}
        <div className="mt-8 md:mt-10 grid grid-cols-2 gap-6 md:gap-8">
          <div
            data-reveal="1"
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/mma-ring.jpg"
              alt=""
              fill
              data-parallax="0.06"
              data-pscale="1.16"
              className="object-cover will-change-transform"
              style={{ filter: 'contrast(1.05)' }}
              sizes="(max-width:768px) 45vw, 600px"
            />
          </div>
          <div
            data-reveal="2"
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/mma-moment-2.jpg"
              alt=""
              fill
              data-parallax="0.06"
              data-pscale="1.16"
              className="object-cover will-change-transform"
              style={{ filter: 'contrast(1.05)' }}
              sizes="(max-width:768px) 45vw, 600px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * About — real bio for Alisher Gafurov. Calm light editorial layout.
 */

const FACTS: { k: string; v: string }[] = [
  { k: 'РОЛЬ', v: 'Full-Stack разработчик' },
  { k: 'ГОРОД', v: 'Душанбе, Таджикистан' },
  { k: 'ФОКУС', v: 'Веб-приложения · Интерфейсы · Производительность' },
  { k: 'ТАКЖЕ', v: 'Боец MMA' },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="about"
      ref={ref}
      className="relative w-full bg-paper px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-content">
        <div
          data-reveal="0"
          className="flex items-center gap-3 label text-[10px] text-muted mb-14 md:mb-20"
        >
          <span>01</span>
          <span className="w-10 h-px bg-accent" />
          <span className="text-accent">ОБО МНЕ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div data-reveal="1" className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-[440px] mx-auto lg:mx-0 overflow-hidden rounded-2xl border border-line shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
              <Image
                src="/hero-face.jpg"
                alt="Алишер Гафуров"
                fill
                data-parallax="0.04"
                data-pscale="1.12"
                className="object-cover object-top will-change-transform"
                style={{ filter: 'contrast(1.03) brightness(1.0)' }}
                sizes="(max-width:1024px) 90vw, 440px"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 55%, rgba(4,6,12,0.85) 100%)',
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between label text-[9px] text-white/80">
                <span>А · ГАФУРОВ</span>
                <span className="text-accent-soft">2026</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2
              data-reveal="1"
              className="text-cinematic text-ink text-[8vw] md:text-[4.4vw] lg:text-[3.4rem] leading-[1.02] mb-10"
            >
              Разработчик по призванию.
              <br />
              <span className="text-muted">Боец по дисциплине.</span>
            </h2>

            <div className="space-y-6 max-w-2xl text-ink-2 text-base md:text-lg leading-relaxed">
              <p data-reveal="2">
                Я — Алишер Гафуров, Full-Stack веб-разработчик и студент факультета
                систем обработки информации. Создаю современные, быстрые и
                функциональные сайты, которые помогают бизнесу и личным брендам
                выделяться в цифровом пространстве.
              </p>
              <p data-reveal="3">
                Для меня разработка — это не просто код, а создание сильного
                цифрового продукта, который выглядит профессионально, работает
                быстро и помогает клиенту получать результат.
              </p>
              <p data-reveal="3">
                Помимо IT, активно занимаюсь MMA, что помогает мне сохранять
                дисциплину, выдержку и стремление к постоянному развитию — как
                в спорте, так и в работе.
              </p>
            </div>

            <dl
              data-reveal="4"
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 max-w-2xl"
            >
              {FACTS.map((f) => (
                <div
                  key={f.k}
                  className="flex flex-col gap-1 border-t border-line pt-4"
                >
                  <dt className="label text-[10px] text-muted">{f.k}</dt>
                  <dd className="text-ink text-sm md:text-base">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

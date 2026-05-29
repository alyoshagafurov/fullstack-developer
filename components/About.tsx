'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';

/**
 * About — real bio for Alisher Gafurov.
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
      className="relative w-full bg-ink-0 px-5 md:px-12 py-20 md:py-44 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(50% 60% at 80% 30%, rgba(0,255,255,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-[1300px]">
        <div
          data-reveal="0"
          className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40 mb-14 md:mb-20"
        >
          <span>01</span>
          <span className="w-10 h-px bg-neon-blue" />
          <span className="text-neon-blue">ОБО МНЕ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div data-reveal="1" className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-[440px] mx-auto lg:mx-0 overflow-hidden border border-white/10">
              <Image
                src="/hero-face.jpg"
                alt="Алишер Гафуров"
                fill
                className="object-cover object-top"
                style={{ filter: 'grayscale(0.15) contrast(1.05) brightness(0.95)' }}
                sizes="(max-width:1024px) 90vw, 440px"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 55%, rgba(5,5,5,0.85) 100%)',
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[9px] tracking-[0.35em] text-white/70">
                <span>А · ГАФУРОВ</span>
                <span className="text-neon-blue">2026</span>
              </div>
              <Corners color="rgba(255,255,255,0.25)" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2
              data-reveal="1"
              className="text-cinematic text-white text-[8vw] md:text-[4.4vw] lg:text-[3.4rem] leading-[1.02] mb-10"
            >
              Разработчик по призванию.
              <br />
              <span className="text-white/45">Боец по дисциплине.</span>
            </h2>

            <div className="space-y-6 max-w-2xl text-white/65 text-base md:text-lg leading-relaxed">
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
                  className="flex flex-col gap-1 border-t border-white/10 pt-4"
                >
                  <dt className="font-mono text-[10px] tracking-[0.35em] text-white/35">
                    {f.k}
                  </dt>
                  <dd className="text-white/85 text-sm md:text-base">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Corners({ color }: { color: string }) {
  const c = { borderColor: color };
  return (
    <>
      <span className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={c} />
      <span className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={c} />
      <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l" style={c} />
      <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={c} />
    </>
  );
}

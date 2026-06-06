'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Approach — a calm statement section (this replaces the old code-terminal
 * "CodeWorld"). No monospace, no editor window — just a clear promise and
 * three pillars, on normal vertical scroll.
 */

const PILLARS = [
  {
    n: '01',
    title: 'Дизайн',
    body: 'Чистый, современный интерфейс, который вызывает доверие и приятно ощущается.',
  },
  {
    n: '02',
    title: 'Скорость',
    body: 'Лёгкие и быстрые сайты — ничего лишнего, только то, что действительно важно.',
  },
  {
    n: '03',
    title: 'Результат',
    body: 'Продуманная структура и контент, которые приводят клиентов и заявки.',
  },
];

export default function CodeWorld() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="code"
      ref={ref}
      className="relative w-full bg-paper-2 px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div
        aria-hidden
        data-parallax="0.16"
        className="pointer-events-none select-none absolute top-[2%] right-[-3vw] z-0 font-display font-black leading-none text-ink/[0.04] text-[46vw] md:text-[26vw]"
      >
        02
      </div>

      <div className="relative z-10 mx-auto max-w-content">
        <div
          data-reveal="0"
          className="flex items-center gap-3 label text-[10px] text-muted mb-10 md:mb-14"
        >
          <span>02</span>
          <span className="w-10 h-px bg-accent" />
          <span className="text-accent">ПОДХОД</span>
        </div>

        <h2
          data-reveal="1"
          className="text-cinematic text-ink text-[9vw] md:text-[5vw] lg:text-[4rem] leading-[1.0] max-w-5xl"
        >
          Создаю цифровые продукты,{' '}
          <span className="text-gradient">которые работают на результат.</span>
        </h2>

        <p
          data-reveal="2"
          className="mt-8 text-ink-2 text-base md:text-lg leading-relaxed max-w-2xl"
        >
          Каждый проект — это не просто красивая картинка, а инструмент для
          вашего бизнеса: понятный, быстрый и удобный.
        </p>

        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line rounded-2xl overflow-hidden">
          {PILLARS.map((p, i) => (
            <div
              key={p.n}
              data-reveal={String(i)}
              className="bg-paper p-8 md:p-10"
            >
              <span className="text-cinematic text-accent/30 text-5xl">{p.n}</span>
              <h3 className="mt-5 text-ink text-2xl md:text-3xl font-display font-bold tracking-tight">
                {p.title}
              </h3>
              <p className="mt-3 text-ink-2 text-sm md:text-base leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

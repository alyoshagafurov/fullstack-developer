'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Services — what Alisher builds. Light card grid, calm scroll.
 */

const SERVICES: {
  n: string;
  title: string;
  body: string;
  tags: string[];
}[] = [
  {
    n: '01',
    title: 'Landing Page',
    body: 'Одностраничные сайты для личного бренда, услуг, портфолио или небольшого бизнеса. Стильно, быстро, адаптивно.',
    tags: ['React', 'Next.js', 'Tailwind'],
  },
  {
    n: '02',
    title: 'Бизнес-сайты',
    body: 'Многостраничные сайты с продуманной структурой, SEO-оптимизацией и формами заказов — всё для вашего бизнеса.',
    tags: ['SEO', 'Формы', 'CMS'],
  },
  {
    n: '03',
    title: 'Full-Stack проекты',
    body: 'Индивидуальные веб-решения с админ-панелью, базой данных, бронированием и любым функционалом под ваши задачи.',
    tags: ['Node.js', 'PostgreSQL', 'API'],
  },
  {
    n: '04',
    title: 'Портфолио и бренд',
    body: 'Персональные сайты с premium-дизайном, анимациями и интерактивом. Чтобы вы выделялись в цифровом пространстве.',
    tags: ['GSAP', 'Анимации', 'UX'],
  },
];

const BENEFITS = [
  'Современный premium-дизайн',
  'Адаптивность под все устройства',
  'Быстрая работа сайта',
  'Удобный интерфейс и UX',
  'Чистая архитектура проекта',
  'Решение под ваши задачи',
];

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="services"
      ref={ref}
      className="relative w-full bg-paper px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div
        aria-hidden
        data-parallax="0.16"
        className="pointer-events-none select-none absolute top-[3%] left-[-4vw] z-0 font-display font-black leading-none text-ink/[0.04] text-[46vw] md:text-[26vw]"
      >
        03
      </div>

      <div className="relative z-10 mx-auto max-w-content">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-20">
          <div>
            <div
              data-reveal="0"
              className="flex items-center gap-3 label text-[10px] text-muted mb-8"
            >
              <span>03</span>
              <span className="w-10 h-px bg-accent" />
              <span className="text-accent">УСЛУГИ</span>
            </div>
            <h2
              data-reveal="1"
              className="text-cinematic text-ink text-[10vw] md:text-[5vw] lg:text-[4rem] leading-[1.0] max-w-3xl"
            >
              Разработка сайтов
              <br />
              <span className="text-muted">под ключ.</span>
            </h2>
          </div>
          <p
            data-reveal="2"
            className="text-ink-2 text-sm md:text-base leading-relaxed max-w-xs"
          >
            Стильные, быстрые и современные сайты с акцентом на дизайн,
            удобство и эффективность для бизнеса.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((s, i) => {
            const accent = i % 2 === 0 ? 'var(--accent)' : 'var(--teal)';
            return (
              <div
                key={s.n}
                data-reveal={String(i)}
                data-hover
                className="card-lift group relative bg-surface rounded-2xl border border-line p-8 md:p-10"
              >
                <span
                  className="absolute top-0 left-8 right-8 h-[2px] w-0 group-hover:w-[calc(100%-4rem)] transition-[width] duration-500 rounded-full"
                  style={{ background: accent }}
                />

                <div className="flex items-start justify-between mb-8">
                  <span className="label text-xs" style={{ color: accent }}>
                    {s.n}
                  </span>
                  <span
                    className="text-lg text-muted group-hover:translate-x-1 transition-transform"
                    style={{ color: accent }}
                  >
                    →
                  </span>
                </div>

                <h3 className="text-ink text-2xl md:text-3xl font-display font-bold mb-4 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-ink-2 text-sm md:text-base leading-relaxed max-w-md mb-8">
                  {s.body}
                </p>

                <div className="flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="label text-[10px] text-ink-2 bg-paper-2 rounded-full px-3 py-1.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div
          data-reveal="0"
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4"
        >
          {BENEFITS.map((b) => (
            <div
              key={b}
              className="flex items-center gap-3 text-ink-2 text-sm md:text-base"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

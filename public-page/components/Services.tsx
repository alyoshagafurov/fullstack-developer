'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Services — what Alisher builds. Real content.
 */

const SERVICES: {
  n: string;
  title: string;
  body: string;
  tags: string[];
  accent: string;
}[] = [
  {
    n: '01',
    title: 'Landing Page',
    body: 'Одностраничные сайты для личного бренда, услуг, портфолио или небольшого бизнеса. Стильно, быстро, адаптивно.',
    tags: ['React', 'Next.js', 'Tailwind'],
    accent: '#00FFFF',
  },
  {
    n: '02',
    title: 'Бизнес-сайты',
    body: 'Многостраничные сайты с продуманной структурой, SEO-оптимизацией и формами заказов — всё для вашего бизнеса.',
    tags: ['SEO', 'Формы', 'CMS'],
    accent: '#8A2BE2',
  },
  {
    n: '03',
    title: 'Full-Stack проекты',
    body: 'Индивидуальные веб-решения с админ-панелью, базой данных, бронированием и любым функционалом под ваши задачи.',
    tags: ['Node.js', 'PostgreSQL', 'API'],
    accent: '#D4AF37',
  },
  {
    n: '04',
    title: 'Портфолио и бренд',
    body: 'Персональные сайты с premium-дизайном, анимациями и интерактивом. Чтобы вы выделялись в цифровом пространстве.',
    tags: ['GSAP', 'WebGL', 'Анимации'],
    accent: '#00FFFF',
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
      className="relative w-full bg-ink-0 px-5 md:px-12 py-20 md:py-44 overflow-hidden"
    >
      <div className="relative mx-auto max-w-[1300px]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-24">
          <div>
            <div
              data-reveal="0"
              className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40 mb-8"
            >
              <span>03</span>
              <span className="w-10 h-px bg-neon-yellow" />
              <span className="text-neon-yellow">УСЛУГИ</span>
            </div>
            <h2
              data-reveal="1"
              className="text-cinematic text-white text-[10vw] md:text-[5vw] lg:text-[4rem] leading-[0.98] max-w-3xl"
            >
              Разработка сайтов
              <br />
              <span className="text-white/45">под ключ.</span>
            </h2>
          </div>
          <p
            data-reveal="2"
            className="text-white/55 text-sm md:text-base leading-relaxed max-w-xs"
          >
            Стильные, быстрые и современные сайты с акцентом на дизайн,
            удобство и эффективность для бизнеса.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {SERVICES.map((s, i) => (
            <div
              key={s.n}
              data-reveal={String(i)}
              data-hover
              className="group relative bg-ink-0 p-8 md:p-12 transition-colors duration-300 hover:bg-ink-1"
            >
              <span
                className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-[width] duration-500"
                style={{ background: s.accent }}
              />

              <div className="flex items-start justify-between mb-8">
                <span
                  className="font-mono text-xs tracking-[0.4em]"
                  style={{ color: s.accent }}
                >
                  {s.n}
                </span>
                <span className="font-mono text-[10px] tracking-[0.3em] text-white/25 group-hover:text-white/60 transition-colors">
                  →
                </span>
              </div>

              <h3 className="text-white text-2xl md:text-3xl font-display font-medium mb-4 tracking-tight">
                {s.title}
              </h3>
              <p className="text-white/55 text-sm md:text-base leading-relaxed max-w-md mb-8">
                {s.body}
              </p>

              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] tracking-[0.25em] text-white/55 border border-white/10 px-2.5 py-1"
                  >
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div
          data-reveal="0"
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4"
        >
          {BENEFITS.map((b) => (
            <div
              key={b}
              className="flex items-center gap-3 text-white/60 text-sm md:text-base"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

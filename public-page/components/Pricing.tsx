'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Pricing — three tiers in somoni. Clean, premium card layout.
 */

const PLANS: {
  n: string;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  deadline: string;
  accent: string;
  popular?: boolean;
}[] = [
  {
    n: '01',
    name: 'ЭКОНОМ',
    price: '700',
    subtitle: 'Современный лендинг / одностраничный сайт',
    features: [
      'Адаптивный сайт (телефон, планшет, ПК)',
      'Современный дизайн',
      'Форма обратной связи',
      'Подбор изображений и структуры',
      'Базовая оптимизация скорости',
    ],
    deadline: 'до 6 дней',
    accent: '#00FFFF',
  },
  {
    n: '02',
    name: 'СТАНДАРТ',
    price: '1800',
    subtitle: 'Многостраничный сайт для бизнеса',
    features: [
      'Всё из тарифа «Эконом»',
      'Установка на хостинг',
      'SEO-оптимизация сайта',
      'Форма заказа / заявок',
      'Наполнение контентом',
      'Продуманная структура для бизнеса',
    ],
    deadline: 'до 8 дней',
    accent: '#D4AF37',
    popular: true,
  },
  {
    n: '03',
    name: 'БИЗНЕС',
    price: '3500',
    subtitle: 'Индивидуальный Full-Stack проект',
    features: [
      'Всё из тарифа «Стандарт»',
      'Админ-панель',
      'Бронирование / заявки',
      'Индивидуальный функционал',
      'Работа с базой данных',
      'Full-Stack разработка под задачи',
      'Максимальная оптимизация',
    ],
    deadline: 'до 12 дней',
    accent: '#8A2BE2',
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="pricing"
      ref={ref}
      className="relative w-full bg-ink-0 px-5 md:px-12 py-20 md:py-44 overflow-hidden"
    >
      <div className="relative mx-auto max-w-[1300px]">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div
            data-reveal="0"
            className="flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40 mb-8"
          >
            <span className="w-10 h-px bg-neon-yellow" />
            <span className="text-neon-yellow">ТАРИФЫ</span>
            <span className="w-10 h-px bg-neon-yellow" />
          </div>
          <h2
            data-reveal="1"
            className="text-cinematic text-white text-[10vw] md:text-[5vw] lg:text-[4rem] leading-[0.98]"
          >
            Прозрачные цены,
            <br />
            <span className="text-white/45">чёткий результат.</span>
          </h2>
          <p
            data-reveal="2"
            className="mt-6 text-white/55 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
          >
            Количество правок не ограничено — работаю до полного утверждения.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6">
          {PLANS.map((p, i) => (
            <div
              key={p.n}
              data-reveal={String(i)}
              data-hover
              className={`group relative border bg-ink-0 p-7 md:p-9 flex flex-col transition-colors duration-300 hover:bg-ink-1 ${
                p.popular
                  ? 'border-neon-yellow/40 md:-mt-4 md:mb-0 md:pb-12'
                  : 'border-white/10'
              }`}
            >
              {/* Popular badge */}
              {p.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 font-mono text-[9px] tracking-[0.4em] text-ink-0 bg-neon-yellow"
                  style={{ boxShadow: '0 0 20px rgba(212,175,55,0.5)' }}
                >
                  ПОПУЛЯРНЫЙ
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span
                    className="font-mono text-[10px] tracking-[0.4em] block mb-2"
                    style={{ color: p.accent }}
                  >
                    {p.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-cinematic text-white text-5xl md:text-4xl lg:text-5xl">
                      {p.price}
                    </span>
                    <span className="font-mono text-xs text-white/40 ml-1">
                      сомони
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] tracking-[0.3em] text-white/25">
                  {p.n}
                </span>
              </div>

              <p className="text-white/55 text-sm leading-relaxed mb-8">
                {p.subtitle}
              </p>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-8">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-white/70 text-sm">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: p.accent }}
                    />
                    {f}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 pt-5 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.3em] text-white/40">
                  СРОК: {p.deadline.toUpperCase()}
                </span>
                <a
                  href="https://t.me/alishergafurovv"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover
                  className="font-mono text-[10px] tracking-[0.3em] transition-colors hover:text-neon-yellow"
                  style={{ color: p.accent }}
                >
                  ЗАКАЗАТЬ →
                </a>
              </div>

              {/* Corner accents */}
              <Corners color={p.popular ? 'rgba(212,175,55,0.5)' : `${p.accent}40`} />
            </div>
          ))}
        </div>
      </div>
    </section>
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

'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Pricing — three tiers in somoni. Clean light cards, the popular one lifted.
 */

const PLANS: {
  n: string;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  deadline: string;
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
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="pricing"
      ref={ref}
      className="relative w-full bg-paper-2 px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-content">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div
            data-reveal="0"
            className="flex items-center justify-center gap-3 label text-[10px] text-muted mb-8"
          >
            <span className="w-10 h-px bg-accent" />
            <span className="text-accent">ТАРИФЫ</span>
            <span className="w-10 h-px bg-accent" />
          </div>
          <h2
            data-reveal="1"
            className="text-cinematic text-ink text-[10vw] md:text-[5vw] lg:text-[4rem] leading-[1.0]"
          >
            Прозрачные цены,
            <br />
            <span className="text-muted">чёткий результат.</span>
          </h2>
          <p
            data-reveal="2"
            className="mt-6 text-ink-2 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
          >
            Количество правок не ограничено — работаю до полного утверждения.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((p, i) => (
            <div
              key={p.n}
              data-reveal={String(i)}
              data-hover
              className={`relative flex flex-col rounded-2xl p-7 md:p-9 transition-shadow duration-300 ${
                p.popular
                  ? 'bg-surface border-2 border-accent shadow-[0_30px_60px_-30px_rgba(194,86,43,0.45)] md:-mt-4 md:pb-12'
                  : 'bg-surface border border-line hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.6)]'
              }`}
            >
              {/* Popular badge */}
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 label text-[9px] text-white bg-accent rounded-full">
                  ПОПУЛЯРНЫЙ
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="label text-[10px] block mb-2 text-accent">
                    {p.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-cinematic text-ink text-5xl md:text-4xl lg:text-5xl">
                      {p.price}
                    </span>
                    <span className="label text-xs text-muted ml-1">сомони</span>
                  </div>
                </div>
                <span className="label text-[10px] text-muted">{p.n}</span>
              </div>

              <p className="text-ink-2 text-sm leading-relaxed mb-8">
                {p.subtitle}
              </p>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-8">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-ink-2 text-sm">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://t.me/alishergafurovv"
                target="_blank"
                rel="noopener noreferrer"
                data-hover
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 label text-[10px] transition-colors ${
                  p.popular
                    ? 'bg-accent text-white hover:bg-accent-deep'
                    : 'border border-line text-ink hover:border-accent hover:text-accent'
                }`}
              >
                ЗАКАЗАТЬ <span>→</span>
              </a>

              <div className="mt-4 text-center label text-[10px] text-muted">
                СРОК: {p.deadline.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

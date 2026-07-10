'use client';

import { useRef } from 'react';
import { Check } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import Button from './Button';

const PLANS = [
  {
    name: 'Эконом', price: '700', unit: 'сомони', subtitle: 'Лендинг / одностраничный сайт',
    features: ['Адаптив (телефон, планшет, ПК)', 'Современный дизайн', 'Форма обратной связи', 'Подбор структуры и изображений', 'Базовая оптимизация скорости'],
    deadline: 'до 6 дней',
  },
  {
    name: 'Стандарт', price: '1800', unit: 'сомони', subtitle: 'Многостраничный сайт для бизнеса',
    features: ['Всё из «Эконом»', 'Установка на хостинг', 'SEO-оптимизация', 'Форма заказа / заявок', 'Наполнение контентом', 'Структура под бизнес'],
    deadline: 'до 8 дней', popular: true,
  },
  {
    name: 'Бизнес', price: '3500', unit: 'сомони', subtitle: 'Индивидуальный Full-Stack проект',
    features: ['Всё из «Стандарт»', 'Админ-панель', 'Бронирование / заявки', 'Индивидуальный функционал', 'Работа с базой данных', 'Максимальная оптимизация'],
    deadline: 'до 12 дней',
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="pricing" ref={ref} className="relative py-28 md:py-44 bg-bg-2/40">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="text-center mb-16 md:mb-20">
          <div data-reveal="0" className="label mb-6">Тарифы</div>
          <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] mx-auto max-w-3xl">
            Прозрачные цены
          </SplitText>
          <p data-reveal="1" className="mt-6 text-ink-2 text-lg max-w-lg mx-auto leading-relaxed">
            Количество правок не ограничено — работаю до полного утверждения.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              data-reveal={String(i)}
              className={`glass p-8 md:p-9 flex flex-col ${p.popular ? 'md:-mt-4 md:pb-12 border-line-2 !bg-white/[0.05]' : ''}`}
            >
              {p.popular && (
                <div className="self-start mb-6 inline-flex items-center rounded-full bg-white text-bg text-[11px] font-semibold tracking-wide px-3 py-1">
                  Популярный
                </div>
              )}
              <div className="label mb-4">{p.name}</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="display text-ink text-5xl md:text-6xl tabular-nums">{p.price}</span>
                <span className="text-muted text-sm">{p.unit}</span>
              </div>
              <p className="text-ink-2 text-[15px] leading-relaxed mb-8">{p.subtitle}</p>

              <div className="flex-1 space-y-3.5 mb-8">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-ink-2 text-[14px]">
                    <Check size={16} className="mt-0.5 text-ink shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Button
                href="https://t.me/alishergafurovv"
                external
                variant={p.popular ? 'primary' : 'ghost'}
                cursorLabel="Заказать"
                className="w-full"
              >
                Заказать <span aria-hidden>→</span>
              </Button>
              <div className="mt-4 text-center label text-[10px]">Срок: {p.deadline}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';
import Button from './Button';

/*
 * Pricing — a price-range table (15 services, from/to in somoni) framed by a
 * big "от 700 / до 30 000" statement and a calm "цена зависит от задачи" block
 * with a free-estimate CTA. Monochrome, editorial.
 */

const SERVICES: { n: string; name: string; from: string; to: string }[] = [
  { n: '01', name: 'Одностраничный сайт (лендинг)', from: '700', to: '3 000' },
  { n: '02', name: 'Сайт-визитка', from: '1 000', to: '4 000' },
  { n: '03', name: 'Корпоративный сайт', from: '3 000', to: '10 000' },
  { n: '04', name: 'Интернет-магазин', from: '5 000', to: '20 000' },
  { n: '05', name: 'Telegram-бот', from: '1 000', to: '8 000' },
  { n: '06', name: 'Telegram Mini App', from: '3 000', to: '15 000' },
  { n: '07', name: 'AI-бот для бизнеса', from: '3 000', to: '15 000' },
  { n: '08', name: 'AI-агент с базой знаний', from: '8 000', to: '30 000' },
  { n: '09', name: 'CRM для малого бизнеса', from: '10 000', to: '30 000' },
  { n: '10', name: 'Веб-приложение', from: '8 000', to: '30 000' },
  { n: '11', name: 'Система бронирования', from: '5 000', to: '20 000' },
  { n: '12', name: 'Онлайн-платформа', from: '15 000', to: '30 000+' },
  { n: '13', name: 'Android-приложение', from: '10 000', to: '30 000' },
  { n: '14', name: 'iOS-приложение', from: '15 000', to: '30 000' },
  { n: '15', name: 'AI для генерации фото', from: '10 000', to: '30 000' },
];

const FACTORS = [
  'сложность проекта',
  'количество страниц',
  'интеграции и автоматизация',
  'дизайн и функционал',
  'сроки реализации',
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="pricing" ref={ref} className="relative py-28 md:py-44 bg-bg-2/30">
      <div className="mx-auto max-w-content px-6 md:px-10">
        {/* ── Intro: price range ── */}
        <div className="text-center">
          <div data-reveal="0" className="label mb-10">Цены на услуги</div>
          <div data-reveal="1" className="flex items-center justify-center gap-5 sm:gap-10 md:gap-14">
            <div className="text-center">
              <div className="label text-[10px] mb-3">от</div>
              <div className="display font-light text-ink text-6xl sm:text-7xl md:text-8xl tabular-nums leading-none">700</div>
            </div>
            <span className="text-dim text-4xl md:text-6xl font-light">/</span>
            <div className="text-center">
              <div className="label text-[10px] mb-3">до</div>
              <div className="display font-light text-ink text-6xl sm:text-7xl md:text-8xl tabular-nums leading-none">30 000</div>
            </div>
          </div>
          <div data-reveal="2" className="label mt-8">сомони</div>
        </div>

        {/* ── Table ── */}
        <div data-reveal="0" className="mt-20 md:mt-28">
          <div className="hidden md:grid md:grid-cols-[3rem_1fr_11rem_11rem] md:gap-6 label text-[10px] pb-5 px-3">
            <span>№</span>
            <span>Услуга</span>
            <span>От · сомони</span>
            <span>До · сомони</span>
          </div>

          <div className="border-t border-line">
            {SERVICES.map((s) => (
              <div
                key={s.n}
                data-hover
                className="border-b border-line py-5 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors md:grid md:grid-cols-[3rem_1fr_11rem_11rem] md:gap-6 md:items-center"
              >
                <div className="flex items-center gap-4 md:contents">
                  <span className="label text-[10px] text-muted tabular-nums">{s.n}</span>
                  <h3 className="flex-1 uppercase tracking-[0.1em] text-ink text-[12.5px] md:text-[13px]">{s.name}</h3>
                </div>
                <div className="mt-3 md:mt-0 flex items-center gap-8 md:contents text-[13px] tabular-nums">
                  <span>
                    <span className="text-muted md:hidden mr-1.5">от</span>
                    <span className="hidden md:inline text-muted mr-3">—</span>
                    <span className="text-ink-2">{s.from}</span>
                  </span>
                  <span>
                    <span className="text-muted md:hidden mr-1.5">до</span>
                    <span className="hidden md:inline text-muted mr-3">—</span>
                    <span className="text-ink-2">{s.to}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Price depends on the task ── */}
        <div className="mt-24 md:mt-32 max-w-2xl mx-auto text-center">
          <div data-reveal="0" className="label mb-8">Цена зависит от задачи</div>
          <p data-reveal="1" className="text-ink text-xl md:text-2xl leading-snug font-light">
            Не существует фиксированной стоимости для каждого проекта.
          </p>

          <div data-reveal="2" className="mt-12 inline-flex flex-col items-start text-left">
            <div className="label mb-5">На цену влияют</div>
            <ul className="space-y-3">
              {FACTORS.map((f) => (
                <li key={f} className="flex items-center gap-4 text-ink-2 text-[15px] md:text-base">
                  <span className="w-6 h-px bg-white/40 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal="0" className="mt-16 pt-12 border-t border-line">
            <div className="label mb-6">Напишите мне</div>
            <p className="text-ink-2 text-lg md:text-xl leading-relaxed max-w-md mx-auto mb-9">
              Я бесплатно проанализирую ваш проект и подготовлю индивидуальную оценку стоимости.
            </p>
            <div className="flex justify-center">
              <Button href="https://t.me/alishergafurovv" external cursorLabel="Написать">
                Написать в Telegram <span aria-hidden>→</span>
              </Button>
            </div>
            <div className="label text-[10px] mt-8">Без обязательств · Без навязчивых продаж</div>
          </div>
        </div>
      </div>
    </section>
  );
}

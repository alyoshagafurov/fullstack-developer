'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

/* Process — how a project runs, as a clean numbered timeline. */

const STEPS = [
  { n: '01', t: 'Знакомство', d: 'Разбираюсь в бизнесе, задачах и целях. Определяем, что и зачем делаем.' },
  { n: '02', t: 'Планирование', d: 'Структура, экраны, техническое решение и сроки. Прозрачная смета.' },
  { n: '03', t: 'Дизайн', d: 'UI/UX-макет: чистый, современный, заточенный под конверсию.' },
  { n: '04', t: 'Разработка', d: 'Frontend + backend. Чистый код, адаптив, анимации, интеграции.' },
  { n: '05', t: 'Тестирование', d: 'Проверка на всех устройствах, скорость, SEO, вычитка контента.' },
  { n: '06', t: 'Запуск', d: 'Деплой, подключение домена, аналитика и финальная проверка.' },
  { n: '07', t: 'Поддержка', d: 'Сопровождение после запуска: доработки, обновления, оптимизация.' },
];

export default function Process() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="process" ref={ref} className="relative py-28 md:py-44 bg-bg-2/40">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div data-reveal="0" className="label mb-6">Как я работаю</div>
            <SplitText as="h2" className="display text-ink text-[10vw] md:text-[3.6rem] max-w-2xl">
              Процесс
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">
            Понятный путь от идеи до запуска — вы всегда знаете, на каком этапе проект.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-line md:left-1/2 md:-translate-x-1/2" aria-hidden />
          <div className="flex flex-col gap-3 md:gap-0">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                data-reveal={String(i % 2)}
                className={`relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-16 ${i % 2 ? 'md:[direction:rtl]' : ''}`}
              >
                {/* node */}
                <span className="absolute left-0 top-2 -translate-x-1/2 md:left-1/2 w-2.5 h-2.5 rounded-full bg-white ring-4 ring-bg" aria-hidden />
                <div className={`py-6 md:py-14 ${i % 2 ? 'md:col-start-2 md:[direction:ltr] md:pl-16' : 'md:pr-16 md:text-right'}`}>
                  <div className="display text-dim text-4xl md:text-6xl mb-3">{s.n}</div>
                  <h3 className="text-ink text-xl md:text-2xl font-semibold tracking-tight mb-2">{s.t}</h3>
                  <p className="text-ink-2 text-[15px] leading-relaxed md:max-w-sm md:inline-block">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

const QA = [
  { q: 'Сколько времени занимает разработка?', a: 'Лендинг — от 4–6 дней, бизнес-сайт — около 8 дней, полноценное веб-приложение — от 12 дней. Точные сроки называю после обсуждения задачи.' },
  { q: 'Сколько это стоит?', a: 'Есть прозрачные тарифы от 700 сомони за лендинг. Итог зависит от объёма и функционала — рассчитываю стоимость индивидуально и без скрытых доплат.' },
  { q: 'Помогаете с хостингом и доменом?', a: 'Да. Помогаю выбрать и подключить хостинг и домен, разворачиваю проект и настраиваю всё под ключ.' },
  { q: 'Делаете SEO?', a: 'Каждый сайт получаю базовую SEO-оптимизацию: метатеги, скорость, разметку Schema.org и корректную структуру. Углублённое SEO обсуждается отдельно.' },
  { q: 'Можно переделать существующий сайт?', a: 'Да, делаю редизайн и модернизацию: обновляю дизайн, ускоряю, переношу на современный стек без потери контента.' },
  { q: 'Что с поддержкой после запуска?', a: 'Не бросаю проект после сдачи. Помогаю с доработками, обновлениями и оптимизацией — по договорённости.' },
  { q: 'Как проходит оплата?', a: 'Обычно предоплата 50% и остаток после сдачи. Условия гибкие — подстраиваюсь под удобный формат.' },
  { q: 'С чего начать?', a: 'Напишите в Telegram или заполните форму ниже — обсудим задачу, сроки и стоимость. Обычно отвечаю в течение дня.' },
];

export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-12 md:gap-16 items-start">
          <div className="md:sticky md:top-28">
            <div data-reveal="0" className="label mb-6">FAQ</div>
            <SplitText as="h2" className="display text-ink text-[10vw] md:text-[3.4rem]">
              Частые вопросы
            </SplitText>
            <p data-reveal="1" className="mt-6 text-ink-2 text-lg leading-relaxed max-w-xs">
              Не нашли ответ? Напишите — отвечу лично.
            </p>
          </div>

          <div data-reveal="1" className="divide-y divide-line border-t border-line">
            {QA.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    data-hover
                    className="w-full flex items-center justify-between gap-6 text-left py-6 group"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-lg md:text-xl tracking-tight transition-colors ${isOpen ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}>
                      {item.q}
                    </span>
                    <span className={`shrink-0 w-9 h-9 rounded-full border border-line grid place-items-center transition-all duration-300 ${isOpen ? 'bg-white text-bg border-white rotate-45' : 'text-ink-2'}`}>
                      <Plus size={16} />
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-ink-2 text-[15px] md:text-base leading-relaxed pb-7 max-w-xl">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

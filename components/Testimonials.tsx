'use client';

import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

/*
 * Testimonials — a clean, readable grid (no marquee).
 * ▸ TODO (Alisher): replace with REAL client reviews (name, role, text, photo).
 */

const REVIEWS = [
  { name: 'Далер Р.', role: 'основатель, кофейня', text: 'Сайт сделал быстро и по делу. Заявки пошли сразу, всё работает как часы. Отдельно порадовала связь — всегда на месте.' },
  { name: 'Марьям С.', role: 'директор студии', text: 'Понял задачу с полуслова, предложил решения, о которых мы не думали. Дизайн — уровень, каким я хотела его видеть.' },
  { name: 'Ihsan K.', role: 'product manager', text: 'Чистый код и адаптив без единого бага. Приложение выдержало нагрузку с первого дня. Рекомендую без оговорок.' },
  { name: 'Нигина А.', role: 'владелец магазина', text: 'Перенёс наш магазин на новый уровень: скорость, оплата, удобная админка. Продажи выросли уже в первый месяц.' },
  { name: 'Тимур Б.', role: 'стартап-фаундер', text: 'Собрал MVP за считанные дни. Гибкий, вовлечённый, доводит до результата. Будем работать дальше.' },
  { name: 'Сабрина М.', role: 'маркетолог', text: 'Наконец-то сайт, за который не стыдно. Загрузка мгновенная, на телефоне выглядит идеально. Спасибо!' },
];

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="text-center mb-16 md:mb-20">
          <div data-reveal="0" className="label mb-6">Отзывы</div>
          <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] mx-auto max-w-3xl">
            Что говорят клиенты
          </SplitText>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {REVIEWS.map((r, i) => (
            <figure key={i} data-reveal={String(i % 3)} className="glass p-7 md:p-8 flex flex-col">
              <Quote size={24} className="text-white/20 mb-5" />
              <blockquote className="text-ink-2 text-[15px] leading-relaxed flex-1">{r.text}</blockquote>
              <figcaption className="mt-7 flex items-center gap-3.5">
                <span className="w-11 h-11 rounded-full border border-line bg-white/[0.04] grid place-items-center text-ink text-sm font-semibold shrink-0">
                  {r.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </span>
                <span>
                  <span className="block text-ink text-sm font-medium">{r.name}</span>
                  <span className="block text-muted text-[13px]">{r.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

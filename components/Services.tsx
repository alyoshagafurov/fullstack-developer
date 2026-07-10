'use client';

import { useRef, MouseEvent } from 'react';
import {
  LayoutTemplate, Building2, ShoppingBag, Boxes, Bot, LifeBuoy, ArrowUpRight,
} from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

/* Services — glass cards with a pointer-following sheen. */

const SERVICES = [
  { icon: LayoutTemplate, title: 'Лендинги', body: 'Одностраничные сайты под запуск продукта, услугу или личный бренд. Заточены под заявки и скорость.', tags: ['Next.js', 'Анимации', 'SEO'] },
  { icon: Building2, title: 'Корпоративные сайты', body: 'Многостраничные сайты с продуманной структурой, SEO и CMS для самостоятельного управления.', tags: ['CMS', 'SEO', 'Формы'] },
  { icon: ShoppingBag, title: 'E-commerce', body: 'Интернет-магазины с корзиной, оплатой и каталогом. Stripe, интеграции, аналитика продаж.', tags: ['Stripe', 'Каталог', 'Оплата'] },
  { icon: Boxes, title: 'Веб-приложения', body: 'Full-Stack решения: админ-панели, личные кабинеты, базы данных, бронирование и API.', tags: ['Node.js', 'PostgreSQL', 'API'] },
  { icon: Bot, title: 'Интеграции & AI', body: 'Автоматизация процессов, чат-боты, интеграции с внешними сервисами и AI-функции.', tags: ['OpenAI', 'Боты', 'Webhooks'] },
  { icon: LifeBuoy, title: 'Поддержка & развитие', body: 'Сопровождение после запуска: доработки, оптимизация, обновления и техподдержка.', tags: ['SLA', 'Оптимизация', 'Хостинг'] },
];

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section id="services" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div data-reveal="0" className="label mb-6">Услуги</div>
            <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] max-w-3xl">
              Что я делаю
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">
            От быстрого лендинга до полноценного продукта — беру проект от идеи до запуска и поддержки.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              data-reveal={String(i % 3)}
              data-hover
              onMouseMove={onMove}
              className="glass glass-sheen group p-7 md:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink group-hover:scale-110 transition-transform duration-500">
                  <s.icon size={20} strokeWidth={1.5} />
                </div>
                <ArrowUpRight size={18} className="text-muted group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="text-ink text-xl md:text-2xl font-semibold tracking-tight mb-3">{s.title}</h3>
              <p className="text-ink-2 text-[15px] leading-relaxed mb-6">{s.body}</p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="text-[11px] text-muted border border-line rounded-full px-3 py-1">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

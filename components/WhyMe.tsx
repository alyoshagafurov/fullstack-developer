'use client';

import { useRef } from 'react';
import {
  MessageSquare, Rocket, Smartphone, ShieldCheck, Code2, Search, Globe, Wrench,
} from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

const ITEMS = [
  { icon: MessageSquare, t: 'Быстрая связь', d: 'Отвечаю в течение дня, держу в курсе на каждом этапе.' },
  { icon: Rocket, t: 'Быстрый запуск', d: 'Чёткие сроки и понятные этапы — без бесконечных задержек.' },
  { icon: Smartphone, t: 'Адаптивность', d: 'Идеально выглядит на телефоне, планшете и десктопе.' },
  { icon: ShieldCheck, t: 'Безопасность', d: 'Валидация данных, защита форм и актуальные практики.' },
  { icon: Code2, t: 'Чистый код', d: 'Понятная архитектура, которую легко развивать дальше.' },
  { icon: Search, t: 'SEO-готовность', d: 'Метатеги, скорость и разметка, которую любит Google.' },
  { icon: Globe, t: 'Работаю по миру', d: 'Удалённо, в удобном часовом поясе и на связи.' },
  { icon: Wrench, t: 'Поддержка', d: 'Сопровождаю проект и после запуска — не бросаю.' },
];

export default function WhyMe() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} className="relative py-28 md:py-44 bg-bg-2/40">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="text-center mb-16 md:mb-20">
          <div data-reveal="0" className="label mb-6">Почему я</div>
          <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] mx-auto max-w-3xl">
            Дело не только в коде
          </SplitText>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ITEMS.map((it, i) => (
            <div key={it.t} data-reveal={String(i % 4)} data-hover className="glass group p-6 md:p-7">
              <div className="w-11 h-11 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink mb-6 group-hover:rotate-6 transition-transform duration-500">
                <it.icon size={19} strokeWidth={1.5} />
              </div>
              <h3 className="text-ink text-base md:text-lg font-semibold tracking-tight mb-2">{it.t}</h3>
              <p className="text-ink-2 text-[14px] leading-relaxed">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

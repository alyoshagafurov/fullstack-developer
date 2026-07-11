'use client';

import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import { useI18n } from '@/lib/i18n';

export default function FAQ() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [open, setOpen] = useState<number | null>(0);
  const QA = t.faq.items;

  return (
    <section ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-12 md:gap-16 items-start">
          <div className="md:sticky md:top-28">
            <div data-reveal="0" className="label mb-6">{t.faq.eyebrow}</div>
            <SplitText as="h2" className="display text-ink text-[10vw] md:text-[3.4rem]">
              {t.faq.title}
            </SplitText>
            <p data-reveal="1" className="mt-6 text-ink-2 text-lg leading-relaxed max-w-xs">
              {t.faq.sub}
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

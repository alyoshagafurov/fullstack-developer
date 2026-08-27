'use client';

import { useRef, MouseEvent } from 'react';
import {
  LayoutTemplate, Building2, ShoppingBag, Boxes, Bot, LifeBuoy, ArrowUpRight,
} from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import SectionMore from './SectionMore';
import SectionBg from './SectionBg';
import { useI18n } from '@/lib/i18n';

/* Services — glass cards with a pointer-following sheen. Icons here, text from i18n. */

const ICONS = [LayoutTemplate, Building2, ShoppingBag, Boxes, Bot, LifeBuoy];

export default function Services({ moreHref }: { moreHref?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const SERVICES = t.services.items.map((s, i) => ({ ...s, icon: ICONS[i] ?? LayoutTemplate }));

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section id="services" ref={ref} className="relative isolate py-28 md:py-44">
      <SectionBg src="/bg-services.jpg" focus="82% 18%" />
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div data-reveal="0" className="label mb-6">{t.services.eyebrow}</div>
            <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] max-w-3xl">
              {t.services.title}
            </SplitText>
          </div>
          <p data-reveal="1" className="text-ink-2 text-lg leading-relaxed max-w-sm">
            {t.services.sub}
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
                <div className="w-12 h-12 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink transition-all duration-500 group-hover:scale-110 group-hover:border-accent/45 group-hover:text-accent">
                  <s.icon size={20} strokeWidth={1.5} />
                </div>
                <ArrowUpRight size={18} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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

        {moreHref && <SectionMore href={moreHref} />}
      </div>
    </section>
  );
}

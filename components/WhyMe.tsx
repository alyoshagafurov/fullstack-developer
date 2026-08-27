'use client';

import { useRef } from 'react';
import {
  MessageSquare, Rocket, Smartphone, ShieldCheck, Code2, Search, Globe, Wrench,
} from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import FloatObject from './FloatObject';
import { useI18n } from '@/lib/i18n';

const ICONS = [MessageSquare, Rocket, Smartphone, ShieldCheck, Code2, Search, Globe, Wrench];

export default function WhyMe() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const ITEMS = t.why.items.map((it, i) => ({ ...it, icon: ICONS[i] ?? MessageSquare }));

  return (
    <section ref={ref} className="relative isolate py-28 md:py-44 bg-bg-2/40">
      <FloatObject src="/obj-ribbon.jpg" className="top-[-6%] left-[-10%] w-[58vw] md:w-[30vw]" opacity={0.5} />
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="text-center mb-16 md:mb-20">
          <div data-reveal="0" className="label mb-6">{t.why.eyebrow}</div>
          <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] mx-auto max-w-3xl">
            {t.why.title}
          </SplitText>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ITEMS.map((it, i) => (
            <div key={it.t} data-reveal={String(i % 4)} data-hover className="glass group p-6 md:p-7">
              <div className="w-11 h-11 rounded-xl border border-line bg-white/[0.03] grid place-items-center text-ink mb-6 transition-all duration-500 group-hover:rotate-6 group-hover:border-accent/45 group-hover:text-accent">
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

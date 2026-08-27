'use client';

import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import FloatObject from './FloatObject';
import { useI18n } from '@/lib/i18n';

/*
 * Testimonials — a clean, readable grid (no marquee).
 * ▸ TODO (Alisher): replace with REAL client reviews in lib/i18n/*.
 */

export default function Testimonials() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const REVIEWS = t.testimonials.items;

  return (
    <section ref={ref} className="relative isolate py-28 md:py-44">
      <FloatObject src="/obj-crystal.jpg" className="top-[2%] right-[-6%] w-[48vw] md:w-[22vw]" opacity={0.5} />
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="text-center mb-16 md:mb-20">
          <div data-reveal="0" className="label mb-6">{t.testimonials.eyebrow}</div>
          <SplitText as="h2" className="display text-ink text-[9vw] md:text-[3.6rem] mx-auto max-w-3xl">
            {t.testimonials.title}
          </SplitText>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {REVIEWS.map((r, i) => (
            <figure key={i} data-reveal={String(i % 3)} className="glass p-7 md:p-8 flex flex-col">
              <Quote size={24} className="text-accent/45 mb-5" />
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

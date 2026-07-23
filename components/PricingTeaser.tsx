'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';
import Button from './Button';
import { useI18n } from '@/lib/i18n';
import { useMoney } from '@/lib/currency';

/*
 * Landing pricing teaser — only the range "от 700 / до 30 000" (converted to
 * the active currency) plus a button to the full /pricing page.
 */
export default function PricingTeaser() {
  const { t } = useI18n();
  const money = useMoney();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // Derived from the price table so the teaser always matches /pricing.
  const num = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
  const minFrom = Math.min(...t.pricing.services.map((s) => num(s.from)));
  const maxTo = Math.max(...t.pricing.services.map((s) => num(s.to)));

  return (
    <section ref={ref} className="relative py-24 md:py-36 bg-bg-2/30">
      <div className="mx-auto max-w-content px-6 md:px-10 text-center">
        <div data-reveal="0" className="label mb-10">{t.pricing.eyebrow}</div>

        <div data-reveal="1" className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mb-12">
          <div className="flex items-baseline gap-3">
            <span className="label text-[10px]">{t.pricing.from}</span>
            <span className="display font-light text-ink text-4xl md:text-6xl tabular-nums">{money(minFrom)}</span>
          </div>
          <span className="hidden sm:block text-dim text-4xl font-light">/</span>
          <div className="flex items-baseline gap-3">
            <span className="label text-[10px]">{t.pricing.to}</span>
            <span className="display font-light text-ink text-4xl md:text-6xl tabular-nums">{money(maxTo)}</span>
          </div>
        </div>

        <div data-reveal="2" className="flex justify-center">
          <Button href="/pricing" cursorLabel={t.nav.pricing}>{t.common.viewPricing} <span aria-hidden>→</span></Button>
        </div>
      </div>
    </section>
  );
}

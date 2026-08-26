'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';
import Button from './Button';
import SectionBg from './SectionBg';
import Logo from './Logo';
import { useI18n } from '@/lib/i18n';

/* Closing call-to-action band, reused at the bottom of section pages. */
export default function CTABand() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} className="relative isolate py-24 md:py-32">
      <SectionBg src="/bg-hero.jpg" opacity={0.4} focus="50% 40%" />
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div data-reveal="0" className="glass rounded-3xl p-10 md:p-20 text-center">
          <Logo className="h-6 md:h-7 w-auto opacity-80 mx-auto mb-8" />
          <h2 className="display text-ink text-[8vw] md:text-[3.2rem] max-w-2xl mx-auto mb-9 leading-[1.02]">{t.common.ctaTitle}</h2>
          <div className="flex justify-center">
            <Button href="/contact" cursorLabel={t.nav.contact}>{t.nav.cta} <span aria-hidden>→</span></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

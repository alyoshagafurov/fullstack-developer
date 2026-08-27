'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';
import SplitText from './SplitText';
import SectionMore from './SectionMore';
import SectionBg from './SectionBg';
import { useI18n } from '@/lib/i18n';

export default function About({ moreHref }: { moreHref?: string }) {
  const { t } = useI18n();
  const a = t.about;
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="about" ref={ref} className="relative isolate py-28 md:py-44">
      <SectionBg src="/bg-about.jpg" opacity={0.28} focus="70% 30%" />
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="label mb-14 md:mb-20" data-reveal="0">{a.eyebrow}</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div data-reveal="1" className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-[440px] mx-auto lg:mx-0 overflow-hidden rounded-3xl border border-line">
              <Image
                src="/about-portrait-dark-office.jpg"
                alt="Алишер Гафуров — портрет в студии, Душанбе"
                fill
                data-parallax="0.04"
                data-pscale="1.12"
                className="object-cover object-[56%_26%] will-change-transform"
                sizes="(max-width:1024px) 90vw, 440px"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 52%, rgba(15,13,11,0.86) 100%)' }} />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between label text-[10px] text-ink/80">
                <span>Алишер Гафуров</span><span>2026</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <SplitText as="h2" className="display text-ink text-[8vw] md:text-[3.4rem] max-w-2xl mb-10">
              {a.title}
            </SplitText>

            <div className="space-y-6 max-w-2xl text-ink-2 text-lg leading-relaxed">
              <p data-reveal="2">{a.p1}</p>
              <p data-reveal="3">{a.p2}</p>
              <p data-reveal="3" className="text-ink-2/80">{a.p3}</p>
            </div>

            <dl data-reveal="4" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 max-w-2xl">
              {a.facts.map((f) => (
                <div key={f.k} className="flex flex-col gap-1 border-t border-line pt-4">
                  <dt className="label text-[10px]">{f.k}</dt>
                  <dd className="text-ink text-[15px] md:text-base">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {moreHref && <SectionMore href={moreHref} />}
      </div>
    </section>
  );
}

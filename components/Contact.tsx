'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Contact — real details for Alisher Gafurov. Calm light layout.
 */

const CHANNELS: { label: string; value: string; href: string }[] = [
  { label: 'EMAIL', value: 'gafurovalyosha@gmail.com', href: 'mailto:gafurovalyosha@gmail.com' },
  { label: 'TELEGRAM', value: '@alishergafurovv', href: 'https://t.me/alishergafurovv' },
  { label: 'INSTAGRAM', value: '@alishergafurow', href: 'https://instagram.com/alishergafurow' },
  { label: 'ТЕЛЕФОН', value: '+992 918 79 32 31', href: 'tel:+992918793231' },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative w-full bg-paper px-5 md:px-12 py-20 md:py-32 overflow-hidden"
    >
      <div
        aria-hidden
        data-parallax="0.16"
        className="pointer-events-none select-none absolute bottom-[2%] right-[-3vw] z-0 font-display font-black leading-none text-ink/[0.04] text-[46vw] md:text-[26vw]"
      >
        06
      </div>

      <div className="relative z-10 mx-auto max-w-content">
        <div
          data-reveal="0"
          className="flex items-center gap-3 label text-[10px] text-muted mb-12 md:mb-16"
        >
          <span>06</span>
          <span className="w-10 h-px bg-accent" />
          <span className="text-accent">СВЯЗАТЬСЯ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <h2
              data-reveal="1"
              className="text-cinematic text-ink text-[11vw] md:text-[6vw] lg:text-[4.6rem] leading-[0.98] mb-8"
            >
              Есть проект
              <br />
              <span className="text-gradient">в голове?</span>
            </h2>
            <p
              data-reveal="2"
              className="text-ink-2 text-base md:text-lg leading-relaxed max-w-xl mb-10"
            >
              Открыт для сотрудничества, интересных проектов и новых идей.
              Напишите — обычно отвечаю в течение дня.
            </p>
            <a
              data-reveal="2"
              data-hover
              href="https://t.me/alishergafurovv"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 rounded-full px-7 py-4 bg-accent text-white label text-[11px] hover:bg-accent-deep transition-colors duration-300"
            >
              <span className="w-2 h-2 rounded-full bg-white/90" />
              НАПИСАТЬ В TELEGRAM
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-12">
            <div className="flex flex-col">
              {CHANNELS.map((c, i) => (
                <a
                  key={c.label}
                  data-reveal={String(i)}
                  data-hover
                  href={c.href}
                  target={c.href.startsWith('http') || c.href.startsWith('tel') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-6 py-5 border-t border-line last:border-b transition-colors"
                >
                  <span className="label text-[10px] w-24 text-accent">{c.label}</span>
                  <span className="flex-1 text-ink group-hover:text-accent text-sm md:text-base tracking-wide transition-colors">
                    {c.value}
                  </span>
                  <span className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

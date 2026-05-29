'use client';

import { useRef } from 'react';
import { useReveal } from './useReveal';

/**
 * Contact — real details for Alisher Gafurov.
 */

const CHANNELS: { label: string; value: string; href: string; accent: string }[] = [
  { label: 'EMAIL', value: 'gafurovalyosha@gmail.com', href: 'mailto:gafurovalyosha@gmail.com', accent: '#D4AF37' },
  { label: 'TELEGRAM', value: '@alishergafurovv', href: 'https://t.me/alishergafurovv', accent: '#00FFFF' },
  { label: 'INSTAGRAM', value: '@alishergafurow', href: 'https://instagram.com/alishergafurow', accent: '#8A2BE2' },
  { label: 'ТЕЛЕФОН', value: '+992 918 79 32 31', href: 'tel:+992918793231', accent: '#FFFFFF' },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative w-full bg-ink-0 px-5 md:px-12 py-20 md:py-44 overflow-hidden border-t border-white/5"
    >
      <div className="relative mx-auto max-w-[1300px]">
        <div
          data-reveal="0"
          className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40 mb-12 md:mb-16"
        >
          <span>06</span>
          <span className="w-10 h-px bg-neon-yellow" />
          <span className="text-neon-yellow">СВЯЗАТЬСЯ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <h2
              data-reveal="1"
              className="text-cinematic text-white text-[11vw] md:text-[6vw] lg:text-[4.6rem] leading-[0.96] mb-8"
            >
              Есть проект
              <br />
              <span className="text-holographic">в голове?</span>
            </h2>
            <p
              data-reveal="2"
              className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mb-10"
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
              className="group inline-flex items-center gap-4 px-7 py-4 border border-neon-yellow/50 text-white font-mono text-[11px] tracking-[0.4em] hover:bg-neon-yellow hover:text-ink-0 transition-colors duration-300"
            >
              <span
                className="w-2 h-2 rounded-full bg-neon-yellow group-hover:bg-ink-0 transition-colors"
                style={{ boxShadow: '0 0 10px rgba(212,175,55,0.8)' }}
              />
              НАПИСАТЬ В TELEGRAM
              <span>→</span>
            </a>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-12">
            <div className="flex flex-col">
              {CHANNELS.map((c, i) => (
                <a
                  key={c.label}
                  data-reveal={String(i)}
                  data-hover
                  href={c.href}
                  target={c.href.startsWith('http') || c.href.startsWith('tel') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-6 py-5 border-t border-white/10 last:border-b transition-colors"
                >
                  <span
                    className="font-mono text-[10px] tracking-[0.4em] w-24"
                    style={{ color: c.accent }}
                  >
                    {c.label}
                  </span>
                  <span className="flex-1 text-white/80 group-hover:text-white text-sm md:text-base tracking-wide transition-colors">
                    {c.value}
                  </span>
                  <span className="text-white/25 group-hover:text-white/70 group-hover:translate-x-1 transition-all">
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

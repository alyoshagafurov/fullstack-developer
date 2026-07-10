'use client';

import { useEffect, useRef, useState } from 'react';
import { useReveal } from './useReveal';

/*
 * Numbers band — animated count-up on first view.
 * ▸ TODO (Alisher): put your REAL numbers here.
 */

const STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 30, suffix: '+', label: 'завершённых проектов' },
  { value: 3, suffix: '+', label: 'года в разработке' },
  { value: 20, suffix: '+', label: 'технологий в стеке' },
  { value: 100, suffix: '%', label: 'кастомный код' },
];

export default function Stats() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} className="relative py-24 md:py-36">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-3xl overflow-hidden border border-line">
          {STATS.map((s, i) => (
            <div key={s.label} data-reveal={String(i)} className="bg-bg px-6 py-10 md:px-10 md:py-14 text-center md:text-left">
              <Counter value={s.value} suffix={s.suffix} />
              <div className="mt-3 text-[13px] md:text-sm text-ink-2 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            const start = performance.now();
            const dur = 1400;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              setN(Math.round(eased * value));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="display text-ink text-5xl md:text-7xl tabular-nums leading-none">
      {n}
      <span className="text-dim">{suffix}</span>
    </div>
  );
}

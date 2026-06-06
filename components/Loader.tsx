'use client';

import { useEffect, useState } from 'react';

/**
 * Minimal, calm intro. Warm paper background, the name fades in, and a thin
 * line fills as the site loads. No wormhole, no neon — just a clean curtain
 * that lifts to reveal the hero. Scroll is locked until it finishes.
 */

const TOTAL_MS = 1700;
const FADE_MS = 650;

export default function Loader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / TOTAL_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);

    const failSafe = setTimeout(() => setDone(true), TOTAL_MS + 300);
    document.documentElement.style.overflow = 'hidden';

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(failSafe);
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (done) document.documentElement.style.overflow = '';
  }, [done]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity ease-out ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--paper)', transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={done}
    >
      <div className="flex flex-col items-center gap-6 px-6">
        <span className="label text-[10px] text-muted">Портфолио</span>

        <h1 className="text-cinematic text-ink text-3xl md:text-5xl text-center">
          ALISHER <span className="text-gradient">GAFUROV</span>
        </h1>

        {/* Progress line */}
        <div className="mt-2 h-px w-56 md:w-72 bg-line overflow-hidden">
          <div
            className="h-full bg-accent origin-left"
            style={{ transform: `scaleX(${pct / 100})`, transition: 'transform .12s linear' }}
          />
        </div>

        <span className="label text-[10px] text-muted">
          {String(pct).padStart(3, '0')}%
        </span>
      </div>
    </div>
  );
}

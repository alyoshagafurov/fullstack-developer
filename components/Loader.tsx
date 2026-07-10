'use client';

import { useEffect, useState } from 'react';

/*
 * Short, monochrome intro (~1.3s). The name assembles letter-by-letter and a
 * hairline fills, then the curtain lifts to reveal the hero. Scroll is locked
 * until it finishes; a fail-safe guarantees it always lifts.
 */

const TOTAL_MS = 1300;
const FADE_MS = 620;
const NAME = 'ALISHER GAFUROV';

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
      style={{ background: '#070707', transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={done}
    >
      <div className="flex flex-col items-center gap-7 px-6">
        <span className="label">Портфолио</span>

        <h1 className="display text-ink text-3xl md:text-5xl text-center overflow-hidden">
          {NAME.split('').map((c, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                animation: `loaderIn .6s cubic-bezier(.2,.7,.2,1) both`,
                animationDelay: `${0.15 + i * 0.035}s`,
                whiteSpace: c === ' ' ? 'pre' : 'normal',
              }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </h1>

        <div className="mt-1 h-px w-56 md:w-72 bg-line overflow-hidden">
          <div
            className="h-full bg-white/80 origin-left"
            style={{ transform: `scaleX(${pct / 100})`, transition: 'transform .12s linear' }}
          />
        </div>

        <span className="label tabular-nums">{String(pct).padStart(3, '0')}%</span>
      </div>

      <style>{`@keyframes loaderIn { from { opacity: 0; transform: translateY(90%); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import AlyMark from './AlyMark';

/*
 * Splash — the ALY logo assembles itself stroke by stroke, then the curtain
 * lifts to reveal the hero. Scroll is locked until it finishes; a fail-safe
 * guarantees it always lifts.
 */
const TOTAL_MS = 1200;
const FADE_MS = 450;

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
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
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
      <div className="flex flex-col items-center gap-8 px-6">
        <AlyMark variant="draw" title="ALY" className="h-14 md:h-20 w-auto text-white" />
        <div className="h-px w-40 md:w-56 bg-line overflow-hidden">
          <div
            className="h-full bg-white/70 origin-left"
            style={{ transform: `scaleX(${pct / 100})`, transition: 'transform .12s linear' }}
          />
        </div>
      </div>
    </div>
  );
}

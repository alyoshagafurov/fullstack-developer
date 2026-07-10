'use client';

import { useEffect, useRef } from 'react';

/**
 * A thin progress bar pinned to the very top of the viewport that fills as
 * the page scrolls. Makes the (now simple, top-to-bottom) scroll position
 * obvious at a glance — a small, clear wayfinding cue.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[140] h-px bg-transparent pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-white/70"
        style={{ transform: 'scaleX(0)', boxShadow: '0 0 12px rgba(255,255,255,0.5)' }}
      />
    </div>
  );
}

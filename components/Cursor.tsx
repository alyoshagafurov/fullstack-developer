'use client';

import { useEffect, useRef } from 'react';

/*
 * Two-layer cursor: a fixed dot + a lagging ring. Hover state uses a single
 * delegated `mouseover` listener (cheap `closest()` check) instead of attaching
 * listeners to every element + a MutationObserver — far less work per frame and
 * it automatically covers dynamically-added elements. On elements with
 * data-cursor the ring fills white and shows that label.
 */
const SEL = 'a, button, [data-hover], [data-cursor], input, textarea, select';

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, raf = 0;

    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
    };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onOver = (e: MouseEvent) => {
      const ring = ringRef.current, lbl = labelRef.current;
      if (!ring || !lbl) return;
      const el = (e.target as HTMLElement)?.closest?.(SEL) as HTMLElement | null;
      if (el) {
        ring.classList.add('is-hover');
        const label = el.getAttribute('data-cursor');
        if (label) { lbl.textContent = label; ring.classList.add('has-label'); }
        else ring.classList.remove('has-label');
      } else {
        ring.classList.remove('is-hover');
        ring.classList.remove('has-label');
      }
    };

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

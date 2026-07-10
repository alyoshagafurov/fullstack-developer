'use client';

import { useEffect, useRef } from 'react';

/*
 * Two-layer cursor: a fixed dot + a lagging ring. On interactive elements the
 * ring grows. If an element carries data-cursor="View" the ring fills white and
 * shows that label ("View" / "Open" / "Explore" …) — a small premium detail.
 */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
    };
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);

    const setLabel = (text: string | null) => {
      const ring = ringRef.current;
      const lbl = labelRef.current;
      if (!ring || !lbl) return;
      if (text) {
        lbl.textContent = text;
        ring.classList.add('has-label');
      } else {
        ring.classList.remove('has-label');
      }
    };

    const hoverIn = (e: Event) => {
      const el = (e.target as HTMLElement).closest('[data-cursor],a,button,[data-hover],input,textarea,select');
      ringRef.current?.classList.add('is-hover');
      const label = el?.getAttribute('data-cursor');
      setLabel(label || null);
    };
    const hoverOut = () => {
      ringRef.current?.classList.remove('is-hover');
      setLabel(null);
    };

    const attach = () => {
      const els = document.querySelectorAll('a, button, [data-hover], [data-cursor], input, textarea, select');
      els.forEach((el) => {
        el.addEventListener('mouseenter', hoverIn);
        el.addEventListener('mouseleave', hoverOut);
      });
      return els;
    };
    let els = attach();

    const observer = new MutationObserver(() => {
      els.forEach((el) => {
        el.removeEventListener('mouseenter', hoverIn);
        el.removeEventListener('mouseleave', hoverOut);
      });
      els = attach();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', move);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      observer.disconnect();
      els.forEach((el) => {
        el.removeEventListener('mouseenter', hoverIn);
        el.removeEventListener('mouseleave', hoverOut);
      });
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

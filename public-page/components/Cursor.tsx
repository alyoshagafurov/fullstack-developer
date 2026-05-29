'use client';

import { useEffect, useRef } from 'react';

/**
 * Premium 2-layer cursor: a small fixed dot + a lagging ring.
 * Switches to "hover" mode on interactive elements (anchors, buttons, [data-hover]).
 */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);

    const hoverIn = () => ringRef.current?.classList.add('is-hover');
    const hoverOut = () => ringRef.current?.classList.remove('is-hover');

    const attach = () => {
      const els = document.querySelectorAll(
        'a, button, [data-hover], input, textarea',
      );
      els.forEach((el) => {
        el.addEventListener('mouseenter', hoverIn);
        el.addEventListener('mouseleave', hoverOut);
      });
      return els;
    };
    let els = attach();

    // Re-scan as DOM grows (Lenis can mount things later)
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
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

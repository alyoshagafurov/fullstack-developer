'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/*
 * The cursor as a light source.
 *
 * Nothing here draws. On every pointer move — and on scroll, with the last
 * known position — it writes two custom properties, --mx and --my, onto every
 * element marked data-light: the pointer's position inside that element's
 * own box. The CSS in globals.css turns those into light: the pool on a
 * panel's edge, the ceiling ribs in the hero, the LED track. Gradients whose
 * centre is the pointer, and nothing else.
 *
 * Reads and writes are batched into one animation frame — all the rects
 * first, then all the properties — so a fast mouse costs one layout read per
 * lit element per frame and never causes a layout thrash. There is no canvas
 * and no per-frame React render; this component renders nothing.
 *
 * Mounted once in the root layout for the public site. The admin has no lit
 * elements and gets nothing — not even the listener.
 *
 * Three modes, written to <html data-light> for the stylesheet:
 *
 *   cursor   a fine pointer that can hover — the light follows it
 *   touch    no hover — the light rests where a lamp would be, nothing tracks
 *   static   prefers-reduced-motion — everything lit, nothing moves
 */
export default function LightField() {
  const pathname = usePathname();
  const active = !(pathname?.startsWith('/admin') ?? false);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let px = -1;
    let py = -1;
    let tracking = false;

    /* Beyond this distance no pool can reach an element's edge, so it is
       parked once at an off-box position and left alone: an unchanged
       custom property costs nothing, a changed one repaints the edge. */
    const REACH = 720;
    const parked = new WeakSet<HTMLElement>();

    const paint = () => {
      raf = 0;
      const lit = document.querySelectorAll<HTMLElement>('[data-light]');
      const rects: DOMRect[] = [];
      for (let i = 0; i < lit.length; i += 1) rects.push(lit[i].getBoundingClientRect());
      for (let i = 0; i < lit.length; i += 1) {
        const el = lit[i];
        const r = rects[i];
        const near =
          py > r.top - REACH && py < r.bottom + REACH && px > r.left - REACH && px < r.right + REACH;
        if (near) {
          el.style.setProperty('--mx', `${Math.round(px - r.left)}px`);
          el.style.setProperty('--my', `${Math.round(py - r.top)}px`);
          parked.delete(el);
        } else if (!parked.has(el)) {
          el.style.setProperty('--mx', '-9999px');
          el.style.setProperty('--my', '-9999px');
          parked.add(el);
        }
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onScroll = () => {
      if (px >= 0) schedule();
    };

    const start = () => {
      if (tracking) return;
      tracking = true;
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    };
    const stop = () => {
      if (!tracking) return;
      tracking = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const apply = () => {
      const mode = reduced.matches ? 'static' : fine.matches ? 'cursor' : 'touch';
      root.dataset.light = mode;
      if (mode === 'cursor') start();
      else stop();
    };

    apply();
    fine.addEventListener('change', apply);
    reduced.addEventListener('change', apply);

    return () => {
      stop();
      fine.removeEventListener('change', apply);
      reduced.removeEventListener('change', apply);
      delete root.dataset.light;
    };
  }, [active]);

  return null;
}

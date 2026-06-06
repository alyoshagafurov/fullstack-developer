'use client';

import { useEffect } from 'react';

/**
 * Lightweight, understandable scroll effects (no pinning, no scroll-jacking):
 *
 *  • [data-parallax="0.06"]  — element drifts vertically as it crosses the
 *      viewport. Optional [data-pscale="1.2"] over-scales it so a clipped
 *      image never reveals its edges while drifting.
 *  • [data-hero-fade]        — the hero lockup gently rises and fades out as
 *      you scroll past the first screen (a clean "exit").
 *
 * One shared rAF-throttled handler drives everything off the real scroll
 * position (Lenis writes native scroll, so window.scrollY is the source of
 * truth). Honors prefers-reduced-motion.
 */
export default function ScrollFX() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const parallax = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]'),
    );
    const fades = Array.from(
      document.querySelectorAll<HTMLElement>('[data-hero-fade]'),
    );
    if (!parallax.length && !fades.length) return;

    parallax.forEach((el) => (el.style.willChange = 'transform'));

    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;

      for (const el of parallax) {
        const speed = parseFloat(el.dataset.parallax || '0');
        const scale = el.dataset.pscale || '1';
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = -(center - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(${scale})`;
      }

      for (const el of fades) {
        const section = el.closest('section');
        const h = section ? section.offsetHeight : vh;
        const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.8)));
        el.style.opacity = String(1 - p);
        el.style.transform = `translate3d(0, ${(-p * 90).toFixed(1)}px, 0)`;
        el.style.pointerEvents = p > 0.6 ? 'none' : '';
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    const lenis = (window as any).lenis;
    lenis?.on?.('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      lenis?.off?.('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}

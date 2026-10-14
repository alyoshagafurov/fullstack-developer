'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/*
 * Is the band under a given line of the screen dark or light?
 *
 * Every band declares `data-tone`, and the fixed chrome takes the tone of
 * whichever one crosses its own line: the header reads a line near the top,
 * the floating request button one near the bottom. That keeps both legible the
 * whole way down a page that alternates black and white eight times.
 *
 * Lifted out of the header, which spent three attempts getting this right.
 * What it learned is kept: the band list is rebuilt on every route change
 * (the layout outlives the page under it, and detached nodes report a zero box
 * so nothing would ever cross the line), and an IntersectionObserver on a
 * one-pixel strip carries the crossing even when the window never sees a
 * scroll event, with a scroll listener beside it for fast flicks.
 */
export function useBandTone(edge: 'top' | 'bottom', inset: number) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let bands: HTMLElement[] = [];
    let observer: IntersectionObserver | undefined;

    const line = () => (edge === 'top' ? inset : window.innerHeight - inset);

    const check = () => {
      const y = line();
      let tone: string | undefined;
      for (const band of bands) {
        const rect = band.getBoundingClientRect();
        if (rect.top <= y && rect.bottom > y) tone = band.dataset.tone;
      }
      setDark(tone === 'dark');
      setReady(true);
    };

    const observe = () => {
      bands = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'));
      observer?.disconnect();
      const y = line();
      observer = new IntersectionObserver(check, {
        rootMargin: `-${Math.max(0, y)}px 0px -${Math.max(0, window.innerHeight - y - 1)}px 0px`,
        threshold: 0,
      });
      for (const band of bands) observer.observe(band);
      check();
    };

    observe();
    // A new route's bands can land a frame after the pathname changes.
    const frame = requestAnimationFrame(observe);
    const onResize = () => observe();

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', onResize);
    };
  }, [pathname, edge, inset]);

  return { dark, ready };
}

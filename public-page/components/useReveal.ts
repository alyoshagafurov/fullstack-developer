'use client';

import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Lightweight scroll-reveal. Any element inside `scopeRef` carrying a
 * `data-reveal` attribute fades + rises into view once. An optional numeric
 * `data-reveal` value (e.g. data-reveal="2") adds a small stagger delay so a
 * group can cascade.
 *
 * Used by the calm, non-pinned content sections (About / Services / Contact)
 * to keep them feeling alive without the heavy pinned-scroll machinery.
 */
export function useReveal(scopeRef: RefObject<HTMLElement>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      items.forEach((el) => {
        const order = parseFloat(el.dataset.reveal || '0');
        gsap.fromTo(
          el,
          { opacity: 0, y: 42, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.05,
            delay: order * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        );
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef]);
}

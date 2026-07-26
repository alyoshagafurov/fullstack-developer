'use client';

import { useEffect, RefObject } from 'react';

/**
 * Lightweight scroll-reveal based on IntersectionObserver.
 *
 * Any element inside `scopeRef` carrying `data-reveal` starts hidden (via the
 * global CSS rule) and fades + rises in the moment it enters the viewport.
 * An optional numeric `data-reveal` value (e.g. data-reveal="2") adds a small
 * stagger delay so a group cascades.
 *
 * IntersectionObserver reacts to actual visibility — not scroll events — so it
 * behaves correctly even when the page is opened deep-linked or jumped to a
 * position programmatically. A timed fallback guarantees nothing ever stays
 * hidden if the observer never fires.
 */
export function useReveal(scopeRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const items = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    if (!items.length) return;

    const reveal = (el: HTMLElement) => {
      const order = parseFloat(el.dataset.reveal || '0');
      el.style.transitionDelay = `${order * 0.08}s`;
      el.classList.add('is-in');
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: '0px 0px 22% 0px' },
    );

    items.forEach((el) => io.observe(el));

    // Safety net: never leave content hidden.
    const fallback = setTimeout(() => items.forEach(reveal), 2500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [scopeRef]);
}

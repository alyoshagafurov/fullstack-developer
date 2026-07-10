'use client';

import { useEffect, useRef, createElement } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

/*
 * Heading that animates line-by-line: each line rises out of a clipped mask.
 *
 * SSR-safe & no-JS-safe: the text renders normally in the initial HTML. The
 * split only runs after fonts are ready (correct line breaks). For below-the-
 * fold headings the split primes at mount — long before you scroll there — so
 * there is no flash. Reduced-motion users just see the static text.
 *
 *  trigger="scroll" (default) — plays when the heading enters the viewport
 *  trigger="load"             — plays once after `delay` (used by the hero)
 */

type Props = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  trigger?: 'scroll' | 'load';
  delay?: number;
  stagger?: number;
  start?: string;
};

export default function SplitText({
  as = 'h2',
  className = '',
  children,
  trigger = 'scroll',
  delay = 0,
  stagger = 0.11,
  start = 'top 82%',
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    let split: SplitType | null = null;
    let st: ScrollTrigger | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    const run = () => {
      if (cancelled || !ref.current) return;
      split = new SplitType(ref.current, { types: 'lines' });

      // Wrap each measured line in an overflow-hidden mask.
      ref.current.querySelectorAll<HTMLElement>('.line').forEach((line) => {
        const wrap = document.createElement('span');
        wrap.className = 'split-line';
        line.parentNode?.insertBefore(wrap, line);
        wrap.appendChild(line);
        line.classList.add('line-inner');
      });

      const inners = ref.current.querySelectorAll<HTMLElement>('.line-inner');

      const play = () =>
        (tween = gsap.to(inners, {
          yPercent: 0,
          duration: 1.05,
          ease: 'power4.out',
          stagger,
          delay,
          onComplete: () => split?.revert(), // back to clean text after
        }));

      if (trigger === 'load') {
        play();
      } else {
        st = ScrollTrigger.create({
          trigger: ref.current,
          start,
          once: true,
          onEnter: play,
        });
      }
    };

    // Wait for the font so line breaks are measured correctly.
    if (document.fonts && (document.fonts as any).ready) {
      (document.fonts as any).ready.then(run);
    } else {
      run();
    }

    return () => {
      cancelled = true;
      tween?.kill();
      st?.kill();
      try {
        split?.revert();
      } catch {
        /* noop */
      }
    };
  }, [children, trigger, delay, stagger, start]);

  return createElement(as, { ref, className }, children);
}

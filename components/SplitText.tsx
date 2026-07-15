'use client';

import { useEffect, useRef, createElement } from 'react';
import { gsap } from 'gsap';
import SplitType from 'split-type';

/*
 * Heading that animates line-by-line. Fast by design: it does NOT wait for all
 * fonts to finish loading (that added a ~1s stall) — it starts on the next
 * frame, capped by a tiny race against document.fonts.ready so line breaks are
 * still measured correctly. Reveal fires via IntersectionObserver the moment the
 * heading is in view; above-the-fold headings play immediately.
 *
 *  trigger="scroll" (default) — plays when the heading enters the viewport
 *  trigger="load"             — plays once after `delay`
 * Reduced-motion users just see the static text.
 */

type Props = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  trigger?: 'scroll' | 'load';
  delay?: number;
  stagger?: number;
};

export default function SplitText({
  as = 'h2',
  className = '',
  children,
  trigger = 'scroll',
  delay = 0,
  stagger = 0.08,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let split: SplitType | null = null;
    let io: IntersectionObserver | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    const run = () => {
      if (cancelled || !ref.current) return;
      split = new SplitType(ref.current, { types: 'lines' });

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
          duration: 0.7,
          ease: 'power3.out',
          stagger,
          delay,
          onComplete: () => split?.revert(),
        }));

      if (trigger === 'load') {
        play();
      } else {
        io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                io?.disconnect();
                play();
              }
            }
          },
          { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
        );
        io.observe(ref.current);
      }
    };

    // Start ASAP — don't stall on every font; cap the wait at ~120ms.
    const fontsReady = (document as any).fonts?.ready as Promise<unknown> | undefined;
    if (fontsReady) {
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 120))]).then(() =>
        requestAnimationFrame(run),
      );
    } else {
      requestAnimationFrame(run);
    }

    return () => {
      cancelled = true;
      tween?.kill();
      io?.disconnect();
      try {
        split?.revert();
      } catch {
        /* noop */
      }
    };
  }, [children, trigger, delay, stagger]);

  return createElement(as, { ref, className }, children);
}

'use client';

import { useEffect, useRef } from 'react';

/*
 * Scroll reveal, kept deliberately small.
 *
 * IntersectionObserver rather than a motion library: the site already ships
 * enough JavaScript, and this is a 14px rise with a fade. The CSS lives in
 * globals.css under [data-reveal], including the reduced-motion opt-out, so
 * nothing here has to know about preferences.
 *
 * A timed fallback guarantees content is never left invisible.
 */

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  /** Stagger index — multiplied into a small delay. */
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add('is-in');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { show(); io.disconnect(); }
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);

    const failsafe = setTimeout(show, 2500);
    return () => { io.disconnect(); clearTimeout(failsafe); };
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal
      style={{ transitionDelay: `${delay * 0.07}s` }}
      className={className}
    >
      {children}
    </Tag>
  );
}

'use client';

import { useEffect, useRef } from 'react';

/*
 * A block is switched on once, when the reader reaches it.
 *
 * IntersectionObserver rather than a motion library: this is an opacity
 * change and a flash of the edges inside, both in CSS under [data-reveal] in
 * globals.css, which also holds the reduced-motion opt-out. Nothing moves and
 * nothing is staggered — a light does not slide into the room.
 *
 * A timed fallback guarantees content is never left dark.
 */

export default function Reveal({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const on = () => el.classList.add('is-on');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { on(); io.disconnect(); }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);

    const failsafe = setTimeout(on, 2500);
    return () => { io.disconnect(); clearTimeout(failsafe); };
  }, []);

  return (
    <Tag ref={ref as never} data-reveal className={className}>
      {children}
    </Tag>
  );
}

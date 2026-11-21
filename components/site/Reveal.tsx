'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ElementType, ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

/* A headline whose words rise out of their own lines, one after another. */
export function Words({
  text,
  as = 'h2',
  className,
  id,
  delay = 0,
  once = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  delay?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(' ');
  return (
    <Tag id={id} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '105%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* Anything that should drift up and in when it reaches the screen. */
export function Rise({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export { EASE };

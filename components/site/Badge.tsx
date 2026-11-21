'use client';

import { motion, useReducedMotion } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';

/* A round badge whose words run around its edge, with an arrow in the middle. */
export function Badge({ href, text, label }: { href: string; text: string; label: string }) {
  const reduce = useReducedMotion();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative grid size-32 shrink-0 place-items-center md:size-36"
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 text-bone"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <defs>
          <path id="badge-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text fontSize="7" letterSpacing="1.2" fill="currentColor" style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700 }}>
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </motion.svg>
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full bg-brass text-[#0a0a0a] transition-transform duration-500 group-hover:-rotate-45"
      >
        <ArrowIcon className="size-5" />
      </span>
    </a>
  );
}

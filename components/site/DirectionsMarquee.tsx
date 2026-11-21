'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

export type Direction = { key: string; word: string; href: string; price: string | null };

/*
 * The directions as one endless line of huge words (concept B). Each word is a
 * door into the request with that direction chosen; the line slows under the
 * pointer so a word can be caught. Below it, the same four as plain links with
 * prices, for anyone who would rather read than chase.
 */
export function DirectionsMarquee({
  title,
  hint,
  fromLabel,
  items,
}: {
  title: string;
  hint: string;
  fromLabel: string;
  items: Direction[];
}) {
  const reduce = useReducedMotion();
  const loop = [...items, ...items, ...items, ...items];

  return (
    <section className="overflow-hidden py-24 md:py-32" aria-labelledby="directions-title">
      <div className="hall">
        <h2 id="directions-title" className="sr-only">
          {title}
        </h2>
        <p className="lead-line">{hint}</p>
      </div>

      <div className="group/marquee mt-10 border-y border-seam py-6 md:py-8">
        <motion.div
          className="flex w-max gap-10 md:gap-16"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {loop.map((item, i) => (
            <Link
              key={`${item.key}-${i}`}
              href={item.href}
              tabIndex={i < items.length ? 0 : -1}
              aria-hidden={i >= items.length}
              className="font-display flex items-center gap-10 text-[clamp(3rem,9vw,8.5rem)] leading-none font-extrabold whitespace-nowrap uppercase transition-colors hover:underline hover:decoration-brass hover:decoration-4 hover:underline-offset-8 md:gap-16"
            >
              {item.word}
              <span aria-hidden className="inline-block size-[0.22em] rounded-full bg-brass" />
            </Link>
          ))}
        </motion.div>
      </div>

      <ul className="hall mt-10 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="link-quiet text-sm">
              {item.word}
              {item.price && ` · ${fromLabel} ${item.price.replace(/^(от|from)\s+/i, '')}`}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

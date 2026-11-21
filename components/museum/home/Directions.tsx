'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';

export type Direction = {
  key: string;
  word: string;
  script: string;
  price: string | null;
  href: string;
  image: string;
};

/*
 * Choosing a hall. Four words, each the size of a room's name; the price and
 * the way in sit small at the end of the line. On a pointer device the work
 * that belongs to the hovered word floats beside the cursor like a print held
 * up to the light. On a phone the words are plain links and the script line
 * under each says what is behind it.
 */
export function Directions({
  title,
  note,
  fromLabel,
  items,
}: {
  title: string;
  note: string;
  fromLabel: string;
  items: Direction[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 140, damping: 22, mass: 0.6 });

  const current = items.find((item) => item.key === active);

  return (
    <section className="relative py-28 md:py-40" aria-labelledby="directions-title">
      <div className="hall">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 id="directions-title" data-rise className="hall-title max-w-[12ch]">
            <span className="line-mask">
              <span>{title}</span>
            </span>
          </h2>
          <p className="wall-note md:mb-3 md:text-right">{note}</p>
        </div>

        <div
          ref={area}
          className="relative mt-16 md:mt-24"
          onPointerMove={(event) => {
            const box = area.current?.getBoundingClientRect();
            if (!box) return;
            x.set(event.clientX - box.left);
            y.set(event.clientY - box.top);
          }}
          onPointerLeave={() => setActive(null)}
        >
          <ul className="border-t border-seam">
            {items.map((item) => (
              <li key={item.key} className="border-b border-seam">
                <Link
                  href={item.href}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setActive(item.key);
                  }}
                  onFocus={() => setActive(item.key)}
                  onBlur={() => setActive(null)}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-6 py-7 md:py-9"
                >
                  <span className="flex flex-col gap-x-6 md:flex-row md:items-baseline">
                    <span
                      className={`font-display text-[clamp(2.75rem,8.6vw,8.25rem)] leading-[0.9] font-black transition-[color,transform] duration-700 ease-[var(--ease-gallery)] [font-synthesis:none] group-hover:translate-x-3 ${
                        active && active !== item.key ? 'text-bone/25' : 'text-bone'
                      }`}
                    >
                      {item.word}
                    </span>
                    <span className="script mt-2 text-[clamp(1.125rem,1.9vw,1.75rem)] md:mt-0 md:opacity-60 md:transition-opacity md:duration-500 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                      {item.script}
                    </span>
                    {item.price && (
                      <span className="mt-2 block text-sm text-bone-2 sm:hidden">
                        {fromLabel} {item.price.replace(/^(от|from)\s+/i, '')}
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-5">
                    {item.price && (
                      <span className="hidden text-right text-sm whitespace-nowrap text-bone-2 sm:block">
                        {fromLabel} {item.price.replace(/^(от|from)\s+/i, '')}
                      </span>
                    )}
                    <span className="inline-flex size-12 items-center justify-center rounded-full border border-seam-2 text-bone transition-colors duration-500 group-hover:border-brass group-hover:bg-brass group-hover:text-wall md:size-16">
                      <ArrowIcon className="size-5" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* The print held up to the light — pointer devices only. */}
          <AnimatePresence>
            {current && !reduce && (
              <motion.div
                key="print"
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 z-10 hidden w-[min(26rem,30vw)] md:block"
                style={{ x: sx, y: sy, translateX: '-50%', translateY: '-55%' }}
                initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 2, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              >
                <div className="exhibit aspect-[4/3] overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={current.key}
                      className="absolute inset-0"
                      initial={{ clipPath: 'inset(0 0 100% 0)' }}
                      animate={{ clipPath: 'inset(0 0 0% 0)' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Image src={current.image} alt="" fill sizes="26rem" className="object-cover object-top" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

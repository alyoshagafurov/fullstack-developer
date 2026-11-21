'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';
import { EASE } from '@/components/site/Reveal';

export type HeroDoor = { key: string; label: string; href: string; image: string };

/*
 * The first screen, as the owner drew it: one giant word on white, his photo
 * framed in the middle in front of it, a short headline with one button at the bottom left,
 * and three small doors to the other kinds of work at the bottom right.
 * Scrolling pushes the word back and lifts him slightly towards the reader.
 */
export function Hero({
  word,
  title,
  script,
  cta,
  ctaHref,
  alt,
  doors,
}: {
  word: string;
  title: string;
  script: string;
  cta: string;
  ctaHref: string;
  alt: string;
  doors: HeroDoor[];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const wordScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '-6%']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section
      ref={ref}
      data-doors
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-20 md:pt-24"
    >
      {/* The word. */}
      <motion.p
        aria-hidden
        style={reduce ? undefined : { y: wordY, scale: wordScale }}
        className="mega pointer-events-none relative z-0 text-center whitespace-nowrap select-none"
      >
        {word.split('').map((letter, i) => (
          <span key={i} className="inline-block overflow-hidden align-top">
            <motion.span
              className="inline-block"
              initial={reduce ? false : { y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.1 + i * 0.06 }}
            >
              {letter}
            </motion.span>
          </span>
        ))}
      </motion.p>

      {/* Him, as the photo was taken, framed in front of the word. */}
      <motion.div
        style={reduce ? undefined : { y: photoY, scale: photoScale }}
        className="relative z-10 mx-auto -mt-[5vw] w-[min(72vw,420px)] origin-top md:-mt-[10.5vw] md:w-[min(30vw,520px,calc((100svh_-_10vw_-_7rem)_*_0.8))]"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 80, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.35 }}
          className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-30px_rgb(10_20_60/0.45)]"
        >
          <Image
            src="/me/blue-street.webp"
            alt={alt}
            fill
            priority
            sizes="(min-width: 768px) 30vw, 78vw"
            className="object-cover object-[60%_42%]"
          />
        </motion.div>
      </motion.div>

      {/* The headline, the button, the doors. */}
      <div className="hall relative z-20 mt-10 flex flex-col gap-10 pb-8 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:flex-row md:items-end md:justify-between md:pb-10">
        <motion.div
          className="max-w-sm"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.8 }}
        >
          <p className="hand text-2xl text-brass md:text-[1.75rem]">{script}</p>
          <h1 id="hero-title" className="room-title mt-1">
            {title}
          </h1>
          <Link href={ctaHref} className="btn-bone group mt-6">
            {cta}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <ul className="flex gap-5 md:gap-6">
          {doors.map((door, i) => (
            <motion.li
              key={door.key}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.95 + i * 0.1 }}
            >
              <Link href={door.href} className="group flex flex-col items-center gap-2.5">
                <span className="relative block size-[4.5rem] overflow-hidden rounded-full bg-wall-2 ring-1 ring-seam md:size-20">
                  <Image
                    src={door.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                </span>
                <span className="line-clamp-2 w-20 text-center text-xs leading-tight font-medium break-words md:w-24 md:text-sm">{door.label}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

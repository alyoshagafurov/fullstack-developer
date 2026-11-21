'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';
import { EASE } from '@/components/site/Reveal';

export type HeroScreen = { image: string; title: string; href: string };

/*
 * The first screen: one giant word on white, a laptop in front of it with one
 * of his sites open, a short headline with one button at the bottom left, and
 * at the bottom right the same site on a phone, a monitor and a television —
 * every screen, one site. The pages inside scroll slowly by themselves.
 */
export function Hero({
  word,
  title,
  script,
  cta,
  ctaHref,
  screen,
  devices,
}: {
  word: string;
  title: string;
  script: string;
  cta: string;
  ctaHref: string;
  screen: HeroScreen | null;
  devices: readonly [string, string, string];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const wordScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const laptopY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const laptopScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

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

      {/* The laptop, in front of the word. */}
      <motion.div
        style={reduce ? undefined : { y: laptopY, scale: laptopScale }}
        className="relative z-10 mx-auto -mt-[2vw] w-[min(80vw,520px)] origin-top md:-mt-[8vw] md:w-[min(44vw,760px,calc((100svh_-_12vw_-_10rem)_*_1.5))]"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 90, rotateX: 18 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
          style={{ transformPerspective: 1400 }}
        >
          {screen ? (
            <Link href={screen.href} aria-label={screen.title} className="block">
              <Laptop image={screen.image} alt={screen.title} reduce={!!reduce} />
            </Link>
          ) : (
            <Laptop image={null} alt="" reduce={!!reduce} />
          )}
        </motion.div>
      </motion.div>

      {/* The headline, the button, the other screens. */}
      <div className="hall relative z-20 mt-12 flex flex-col gap-10 pb-8 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:flex-row md:items-end md:justify-between md:pb-10">
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

        <ul className="flex items-end gap-6 md:gap-8" aria-label={devices.join(', ')}>
          {[Phone, Monitor, Television].map((Device, i) => (
            <motion.li
              key={devices[i]}
              className="flex flex-col items-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.95 + i * 0.12 }}
            >
              <Device image={screen?.image ?? null} reduce={!!reduce} delay={i * 1.5} />
              <span className="text-xs font-light text-bone-2 md:text-sm">{devices[i]}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- screens */

/* One size for every screen, so all four share a single download. */
const SCREEN_SIZES = '(min-width: 768px) 44vw, 90vw';

/* A page inside a screen, drifting slowly from its top to its bottom and back. */
function Page({ image, alt = '', reduce, delay = 0 }: { image: string | null; alt?: string; reduce: boolean; delay?: number }) {
  if (!image) return <div className="absolute inset-0 bg-gradient-to-br from-[#2433ff] to-[#0b0b0c]" />;
  return (
    <Image
      src={image}
      alt={alt}
      fill
      sizes={SCREEN_SIZES}
      priority
      className={`object-cover object-top ${reduce ? '' : 'screen-drift'}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function Laptop({ image, alt, reduce }: { image: string | null; alt: string; reduce: boolean }) {
  return (
    <div className="relative">
      {/* lid */}
      <div className="relative rounded-[clamp(10px,1.6vw,22px)] bg-[#161618] p-[1.6%] pb-[2.4%] shadow-[0_50px_90px_-40px_rgb(10_20_60/0.55)] ring-1 ring-black/10">
        <span aria-hidden className="absolute top-[0.7%] left-1/2 size-[0.5%] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-[#2c2c30]" />
        <div className="relative aspect-[16/10] overflow-hidden rounded-[clamp(4px,0.6vw,8px)] bg-black">
          <Page image={image} alt={alt} reduce={reduce} />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        </div>
      </div>
      {/* base */}
      <div aria-hidden className="relative -mx-[7%] h-[clamp(8px,1.1vw,16px)] rounded-b-[clamp(8px,1.4vw,20px)] rounded-t-[2px] bg-gradient-to-b from-[#e4e4e7] via-[#c9c9cd] to-[#9d9da2]">
        <span className="absolute top-0 left-1/2 h-[45%] w-[14%] -translate-x-1/2 rounded-b-[6px] bg-[#b4b4b8]" />
      </div>
    </div>
  );
}

type SmallDevice = { image: string | null; reduce: boolean; delay: number };

function Phone({ image, reduce, delay }: SmallDevice) {
  return (
    <div aria-hidden className="relative h-[5.25rem] w-[2.6rem] rounded-[10px] bg-[#161618] p-[3px] shadow-[0_18px_30px_-16px_rgb(10_20_60/0.5)] md:h-[6.25rem] md:w-[3.1rem] md:rounded-[12px]">
      <div className="relative size-full overflow-hidden rounded-[7px] bg-black md:rounded-[9px]">
        <Page image={image} reduce={reduce} delay={delay} />
        <span className="absolute top-[3px] left-1/2 h-[4px] w-[40%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

function Monitor({ image, reduce, delay }: SmallDevice) {
  return (
    <div aria-hidden className="flex flex-col items-center">
      <div className="relative h-[4.1rem] w-[6.4rem] rounded-[6px] bg-[#161618] p-[3px] shadow-[0_18px_30px_-16px_rgb(10_20_60/0.5)] md:h-[4.9rem] md:w-[7.6rem]">
        <div className="relative size-full overflow-hidden rounded-[3px] bg-black">
          <Page image={image} reduce={reduce} delay={delay} />
        </div>
      </div>
      <div className="h-3 w-3 bg-gradient-to-b from-[#c9c9cd] to-[#a5a5aa] md:h-3.5" />
      <div className="h-[4px] w-10 rounded-full bg-[#a5a5aa]" />
    </div>
  );
}

function Television({ image, reduce, delay }: SmallDevice) {
  return (
    <div aria-hidden className="flex flex-col items-center">
      <div className="relative h-[5.1rem] w-[8.9rem] rounded-[4px] bg-[#0f0f10] p-[2px] shadow-[0_18px_30px_-16px_rgb(10_20_60/0.5)] md:h-[6rem] md:w-[10.6rem]">
        <div className="relative size-full overflow-hidden rounded-[2px] bg-black">
          <Page image={image} reduce={reduce} delay={delay} />
        </div>
      </div>
      <div className="flex w-[70%] justify-between">
        <span className="h-2.5 w-[3px] origin-top -rotate-[18deg] bg-[#3a3a3e]" />
        <span className="h-2.5 w-[3px] origin-top rotate-[18deg] bg-[#3a3a3e]" />
      </div>
    </div>
  );
}

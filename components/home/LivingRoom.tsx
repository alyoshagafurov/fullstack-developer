'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';

/*
 * The first room: him, at a black island in a dark house, at night.
 *
 * Four layers, back to front: the room (a ceiling light line, a slatted wall
 * lit from below, a cold doorway), his name across the back wall, him, and the
 * island in front of him with its under-light — the island also hides where
 * the photograph was cut at the table. The pointer moves the layers apart a
 * little, so the room has depth. Everything is in the first paint; the lights
 * are the only thing that "switches on".
 */

export function LivingRoom({
  name,
  offer,
  script,
  role,
  note,
  quote,
  whatsapp,
  startHref,
  whatsappHref,
  photoAlt,
}: {
  name: readonly string[];
  offer: string;
  script: string;
  role: string;
  note: string;
  quote: string;
  whatsapp: string;
  startHref: string;
  whatsappHref: string;
  photoAlt: string;
}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  const nameX = useTransform(sx, (v) => v * -18);
  const nameY = useTransform(sy, (v) => v * -8);
  const manX = useTransform(sx, (v) => v * 14);
  const manY = useTransform(sy, (v) => v * 6);

  return (
    <section
      data-doors
      className="relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-wall [--island:270px] md:min-h-[680px] md:[--island:19svh]"
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        px.set((event.clientX - box.left) / box.width - 0.5);
        py.set((event.clientY - box.top) / box.height - 0.5);
      }}
    >
      {/* The room. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Ceiling light: a rectangle seen from below, drawing itself on. */}
        <svg
          viewBox="0 0 1000 160"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-[9svh] h-[13svh] w-full [filter:drop-shadow(0_0_6px_rgb(255_214_160/0.9))_drop-shadow(0_0_24px_rgb(255_170_100/0.45))]"
        >
          <polygon
            points="330,6 670,6 760,110 240,110"
            fill="none"
            stroke="#ffe2b8"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            className="ceiling-line"
          />
        </svg>
        <div className="absolute inset-x-[18%] top-[7svh] h-[16svh] bg-[radial-gradient(ellipse_50%_60%_at_50%_30%,rgb(255_200_140/0.09),transparent_70%)]" />

        {/* Slatted wall on the left, grazed by a light from the floor. */}
        <div className="slats absolute top-0 bottom-[var(--island)] left-[3%] hidden w-[17%] opacity-90 md:block">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(255_190_120/0.28),rgb(255_190_120/0.04)_45%,transparent_75%)]" />
        </div>

        {/* A cold doorway on the right, the house's other light. */}
        <div className="absolute top-[24svh] right-[4%] bottom-[var(--island)] hidden w-[4.5%] md:block">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(45_77_255/0.0),rgb(45_77_255/0.55))]" />
          <div className="absolute inset-y-0 left-0 w-px bg-[#8fa3ff] shadow-[0_0_18px_4px_rgb(45_77_255/0.55)]" />
          <div className="absolute -inset-x-[200%] bottom-0 h-[30%] bg-[radial-gradient(ellipse_at_50%_100%,rgb(45_77_255/0.35),transparent_70%)]" />
        </div>

        {/* Warm haze behind him. */}
        <div className="absolute inset-x-0 bottom-[var(--island)] h-[70svh] bg-[radial-gradient(ellipse_38%_55%_at_56%_70%,rgb(255_190_130/0.13),transparent_70%)]" />
      </div>

      {/* His name across the back wall. */}
      <motion.h1
        style={{ x: nameX, y: nameY }}
        className="hall-title pointer-events-none absolute inset-x-0 top-[13svh] text-center text-[clamp(4.25rem,19.5vw,22rem)] leading-[0.82] text-bone/90 md:top-[17svh]"
      >
        {name.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </motion.h1>

      {/* Him. */}
      <motion.div
        style={{ x: manX, y: manY }}
        className="absolute bottom-[calc(var(--island)-2px)] left-1/2 w-[118vw] -translate-x-[46%] [mask-image:linear-gradient(to_right,#000_86%,transparent_99%)] md:w-[min(58vw,76svh*1.2,1000px)] md:-translate-x-[30%]"
      >
        <Image
          src="/photo/cut/hero.png"
          alt={photoAlt}
          width={1025}
          height={851}
          priority
          sizes="(min-width: 768px) 54vw, 112vw"
          className="h-auto w-full brightness-[1.08] contrast-[1.04] [filter:drop-shadow(0_0_40px_rgb(255_180_110/0.16))_drop-shadow(-10px_0_30px_rgb(45_77_255/0.12))]"
        />
      </motion.div>

      {/* The island, its under-light, and what is written on its front. */}
      <div className="absolute inset-x-0 bottom-0 h-[var(--island)]">
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#121212,#0a0a0a_40%,#060606)]" />
        <div aria-hidden className="led under-light absolute inset-x-[4%] bottom-[14px] h-[2px] rounded-full md:inset-x-[2.5%]" />
        <div
          aria-hidden
          className="under-light absolute inset-x-0 -bottom-[40px] h-[90px] bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgb(255_190_120/0.28),transparent_70%)]"
        />

        <div className="hall relative flex h-full flex-col justify-center gap-5 pb-8 md:flex-row md:items-center md:justify-between md:gap-10 md:pb-6">
          <div>
            <p className="text-sm text-bone-2">{role}</p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
              <span className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-none font-black [font-synthesis:none]">
                {offer}
              </span>
              <span className="script -rotate-[3deg] text-[clamp(1.375rem,2.2vw,2rem)]">{script}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
            <Link href={startHref} data-magnetic className="btn-bone group">
              {quote}
              <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-magnetic className="btn-line">
              <WhatsAppIcon className="size-[1.1rem]" />
              {whatsapp}
            </a>
          </div>

          <p className="wall-note hidden max-w-[30ch] text-right xl:block">{note}</p>
        </div>
      </div>
    </section>
  );
}

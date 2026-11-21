'use client';

/* eslint-disable @next/next/no-img-element -- lab previews use plain images */
import { motion } from 'motion/react';
import type { LabData } from '../data';

/*
 * B. Motion — kinetic type. A warm off-white page, a wide heavy face, small
 * pictures set right inside the headline like words, a rotating badge, the
 * work as cards that stack on top of each other as you scroll, and the
 * directions running past as one endless line.
 */
const display = { fontFamily: 'var(--font-unbounded)' };

function Word({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Motion({ data }: { data: LabData }) {
  const shot = data.works[0]?.image;
  return (
    <div className="min-h-screen bg-[#efeee9] pb-40 text-[#0f0f0f]">
      <header className="flex items-center justify-between px-6 py-6 text-sm md:px-10">
        <span style={display} className="font-bold">aly</span>
        <a href={data.start} className="rounded-full bg-[#0f0f0f] px-5 py-2.5 text-white">Обсудить проект</a>
      </header>

      <section className="px-6 pt-12 md:px-10 md:pt-20">
        <h1 style={display} className="text-[clamp(2.4rem,7.4vw,7.5rem)] leading-[1.02] font-extrabold tracking-[-0.03em] uppercase">
          <Word delay={0.05}>Делаю</Word>{' '}
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: 'clamp(4rem, 14vw, 13rem)' }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block h-[0.82em] overflow-hidden rounded-full align-[-0.08em]"
          >
            <img src="/photo/about.webp" alt="" className="h-full w-[clamp(4rem,14vw,13rem)] max-w-none object-cover object-[55%_35%]" />
          </motion.span>{' '}
          <Word delay={0.15}>сайты</Word> <br className="hidden md:block" />
          <Word delay={0.25}>для</Word>{' '}
          {shot && (
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: 'clamp(4rem, 12vw, 11rem)' }}
              transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block h-[0.82em] overflow-hidden rounded-full align-[-0.08em]"
            >
              <img src={shot} alt="" className="h-full w-[clamp(4rem,12vw,11rem)] max-w-none object-cover object-top" />
            </motion.span>
          )}{' '}
          <Word delay={0.35}>бизнеса</Word>
        </h1>

        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg">{data.name}. {data.note}</p>
          <a href={data.whatsapp} className="relative grid size-36 shrink-0 place-items-center">
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            >
              <defs>
                <path id="lab-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
              </defs>
              <text style={display} fontSize="8.4" letterSpacing="2.2" fill="#0f0f0f">
                <textPath href="#lab-circle">НАПИСАТЬ В WHATSAPP · НАПИСАТЬ · </textPath>
              </text>
            </motion.svg>
            <span className="grid size-14 place-items-center rounded-full bg-[#ff5a1f] text-xl text-white">→</span>
          </a>
        </div>
      </section>

      <section className="mt-28 px-3 md:px-6">
        {data.works.map((work, i) => (
          <a
            key={work.title}
            href={work.href}
            className="sticky mb-6 block overflow-hidden rounded-[36px] bg-white p-5 shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.25)] md:p-8"
            style={{ top: `calc(6vh + ${i * 22}px)` }}
          >
            <div className="flex items-baseline justify-between px-1 pb-5">
              <span style={display} className="text-[clamp(1.5rem,3.6vw,3rem)] font-bold uppercase">{work.title}</span>
              <span className="text-sm">{work.year} ↗</span>
            </div>
            <img src={work.image} alt="" className="aspect-[16/8] w-full rounded-[22px] object-cover object-top" />
          </a>
        ))}
      </section>

      <section className="mt-24 overflow-hidden border-y border-black/10 py-8">
        <motion.div
          className="flex w-max gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {[...data.directions, ...data.directions, ...data.directions, ...data.directions].map((d, i) => (
            <span key={i} style={display} className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold uppercase">
              {d.word} <span className="text-[#ff5a1f]">●</span>
            </span>
          ))}
        </motion.div>
      </section>

      <section className="px-6 pt-28 text-center md:px-10">
        <p style={display} className="text-[clamp(2.4rem,7vw,6.5rem)] font-extrabold uppercase">Есть идея?</p>
        <a href={data.start} className="mt-8 inline-flex rounded-full bg-[#0f0f0f] px-8 py-4 text-lg text-white">
          Оставить заявку
        </a>
      </section>
    </div>
  );
}

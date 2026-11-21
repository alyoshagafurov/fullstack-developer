'use client';

/* eslint-disable @next/next/no-img-element -- lab previews use plain images */
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { LabData } from '../data';

/*
 * C. Air — soft and light. Pastel clouds drift slowly behind frosted glass;
 * he floats in the middle; the work sits on glass cards that tilt toward the
 * pointer. Calm, friendly, very modern.
 */
const face = { fontFamily: 'var(--font-manrope)' };

function TiltCard({ children }: { children: React.ReactNode }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });
  const shine = useTransform(sry, (v) => `${50 + v * 4}%`);
  return (
    <motion.div
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - b.left) / b.width - 0.5) * 12);
        rx.set(-((e.clientY - b.top) / b.height - 0.5) * 12);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/45 p-3 shadow-[0_20px_60px_-25px_rgb(80_60_160/0.35)] backdrop-blur-xl"
    >
      <motion.span
        aria-hidden
        style={{ left: shine }}
        className="pointer-events-none absolute -top-1/2 h-[200%] w-24 -translate-x-1/2 rotate-12 bg-white/40 blur-2xl"
      />
      {children}
    </motion.div>
  );
}

export function Air({ data }: { data: LabData }) {
  const review = data.reviews[1] ?? data.reviews[0];
  return (
    <div style={face} className="relative min-h-screen overflow-hidden bg-[#f6f6fb] pb-40 text-[#16161d]">
      {/* The clouds. */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute -top-40 -left-32 size-[38rem] rounded-full bg-[#c9b8ff] opacity-60 blur-[110px]"
          animate={{ x: [0, 120, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 size-[34rem] rounded-full bg-[#ffc9dd] opacity-60 blur-[110px]"
          animate={{ x: [0, -100, 0], y: [0, -80, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 size-[30rem] rounded-full bg-[#b8ecff] opacity-60 blur-[110px]"
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="relative z-10 flex justify-center pt-5">
        <nav className="flex items-center gap-6 rounded-full border border-white/70 bg-white/50 px-6 py-3 text-sm backdrop-blur-xl">
          <b>aly</b>
          <span className="hidden text-black/60 sm:inline">Работы</span>
          <span className="hidden text-black/60 sm:inline">Услуги</span>
          <a href={data.start} className="rounded-full bg-[#16161d] px-4 py-1.5 text-white">Заявка</a>
        </nav>
      </header>

      <section className="relative z-10 px-6 pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-1.5 text-sm backdrop-blur-xl">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Беру новые проекты
        </span>
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-4xl text-[clamp(2.75rem,7vw,6rem)] leading-[1.02] font-extrabold tracking-[-0.04em]"
        >
          {data.name}
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-black/60">{data.offer}. Дизайн, код и запуск — всё сам.</p>
        <div className="mt-8 flex justify-center gap-3">
          <a href={data.start} className="rounded-full bg-[#16161d] px-7 py-3.5 text-white">Оставить заявку</a>
          <a href={data.whatsapp} className="rounded-full border border-white/80 bg-white/60 px-7 py-3.5 backdrop-blur-xl">WhatsApp</a>
        </div>
        <motion.img
          src="/photo/cut/hero.png"
          alt=""
          className="mx-auto mt-10 w-[min(640px,92vw)] drop-shadow-[0_40px_40px_rgb(60_40_120/0.25)]"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      <section className="relative z-10 mx-auto mt-24 grid max-w-6xl gap-5 px-6 md:grid-cols-3">
        {data.works.slice(0, 6).map((work) => (
          <a key={work.title} href={work.href}>
            <TiltCard>
              <img src={work.image} alt="" className="aspect-[4/3] w-full rounded-[20px] object-cover object-top" />
              <div className="flex items-center justify-between px-2 pt-3 pb-1">
                <span className="font-bold">{work.title}</span>
                <span className="text-sm text-black/50">{work.year}</span>
              </div>
            </TiltCard>
          </a>
        ))}
      </section>

      {review && (
        <section className="relative z-10 mx-auto mt-24 max-w-3xl px-6">
          <TiltCard>
            <div className="p-8 text-center md:p-12">
              <p className="text-xl leading-relaxed md:text-2xl">“{review.text}”</p>
              <p className="mt-5 text-sm text-black/50">{review.name}</p>
            </div>
          </TiltCard>
        </section>
      )}
    </div>
  );
}

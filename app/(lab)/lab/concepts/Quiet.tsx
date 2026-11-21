'use client';

/* eslint-disable @next/next/no-img-element -- lab previews use plain images */
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import type { LabData } from '../data';

/*
 * A. Quiet — a magazine page. White paper, a thin enormous name with one
 * heavy word, the photo uncovering itself, the work as a typeset list; the
 * picture of a work floats beside the cursor while you read its name.
 */
export function Quiet({ data }: { data: LabData }) {
  const [first, last] = data.name.split(' ');
  const list = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 20 });
  const sy = useSpring(y, { stiffness: 160, damping: 20 });
  const review = data.reviews[0];

  return (
    <div className="min-h-screen bg-white pb-40 text-[#111]">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 text-sm">
        <span className="font-bold">aly</span>
        <nav className="hidden gap-8 text-[#666] md:flex">
          <span>Работы</span>
          <span>Услуги</span>
          <span>Обо мне</span>
        </nav>
        <a href={data.whatsapp} className="underline underline-offset-4">Написать</a>
      </header>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-6 pt-10 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-7 md:self-end">
          {[first, last].map((word, i) => (
            <motion.p
              key={word}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`text-[clamp(3.5rem,10vw,9rem)] leading-[0.92] tracking-[-0.04em] ${i === 0 ? 'font-extralight' : 'font-extrabold'}`}
            >
              {word}
            </motion.p>
          ))}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8 max-w-md text-lg font-light text-[#555]"
          >
            {data.offer}. {data.note}
          </motion.p>
          <div className="mt-8 flex gap-8 text-base">
            <a href={data.start} className="font-semibold underline underline-offset-[6px]">Оставить заявку →</a>
            <a href={data.whatsapp} className="underline underline-offset-[6px]">WhatsApp →</a>
          </div>
        </div>
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
          className="overflow-hidden rounded-[20px] md:col-span-5"
        >
          <motion.img
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            src="/photo/about.webp"
            alt=""
            className="aspect-[4/5] w-full object-cover object-[55%_40%]"
          />
        </motion.div>
      </section>

      <section className="mx-auto mt-32 max-w-[1200px] px-6">
        <p className="mb-6 text-sm text-[#888]">Работы · {data.works.length}</p>
        <div
          ref={list}
          className="relative"
          onPointerMove={(e) => {
            const box = list.current?.getBoundingClientRect();
            if (!box) return;
            x.set(e.clientX - box.left);
            y.set(e.clientY - box.top);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {data.works.map((work, i) => (
            <a
              key={work.title}
              href={work.href}
              onPointerEnter={() => setHover(i)}
              className="flex items-baseline justify-between border-t border-black/10 py-6 last:border-b"
            >
              <span
                className={`text-[clamp(2rem,5.5vw,4.5rem)] leading-none tracking-[-0.03em] transition-all duration-500 ${
                  hover === i ? 'translate-x-3 font-extrabold' : 'font-extralight'
                }`}
              >
                {work.title}
              </span>
              <span className="text-sm text-[#888]">{work.year}</span>
            </a>
          ))}
          <AnimatePresence>
            {hover !== null && (
              <motion.img
                key="preview"
                src={data.works[hover]?.image}
                alt=""
                style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="pointer-events-none absolute top-0 left-0 z-10 hidden w-80 rounded-xl shadow-2xl md:block"
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {review && (
        <section className="mx-auto mt-40 max-w-[900px] px-6 text-center">
          <p className="text-[clamp(1.5rem,3.4vw,2.75rem)] leading-tight font-extralight tracking-[-0.02em]">“{review.text}”</p>
          <p className="mt-6 text-sm text-[#888]">{review.name}{review.who ? `, ${review.who}` : ''}</p>
        </section>
      )}

      <section className="mx-auto mt-40 max-w-[1200px] px-6">
        <p className="text-[clamp(3rem,9vw,8rem)] leading-[0.95] font-extralight tracking-[-0.04em]">
          Есть идея? <a href={data.start} className="font-extrabold underline decoration-2 underline-offset-[10px]">Напишите.</a>
        </p>
      </section>
    </div>
  );
}

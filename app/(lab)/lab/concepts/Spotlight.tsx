'use client';

/* eslint-disable @next/next/no-img-element -- lab previews use plain images */
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { LabData } from '../data';

/*
 * D. Spotlight — black and white with one moving circle of colour. The photo
 * fills the first screen in grey; a round lens follows the pointer and shows
 * it in full colour (on a phone the lens drifts by itself). Below, the work
 * is a strip you drag sideways.
 */
export function Spotlight({ data }: { data: LabData }) {
  const lens = useRef<HTMLDivElement>(null);

  // On touch screens the lens wanders on its own.
  useEffect(() => {
    if (!matchMedia('(hover: none)').matches || !lens.current) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      lens.current?.style.setProperty('--mx', `${50 + Math.sin(t * 0.6) * 25}%`);
      lens.current?.style.setProperty('--my', `${45 + Math.cos(t * 0.8) * 15}%`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const track = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-40 text-white">
      <section
        ref={lens}
        onPointerMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mx', `${e.clientX - b.left}px`);
          e.currentTarget.style.setProperty('--my', `${e.clientY - b.top}px`);
        }}
        className="relative h-[100svh] overflow-hidden [--mx:60%] [--my:40%]"
      >
        <img src="/photo/about.webp" alt="" className="absolute inset-0 size-full object-cover object-[60%_40%] opacity-45 grayscale" />
        <img
          src="/photo/about.webp"
          alt=""
          className="absolute inset-0 size-full object-cover object-[60%_40%]"
          style={{
            maskImage: 'radial-gradient(circle 190px at var(--mx) var(--my), #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 190px at var(--mx) var(--my), #000 60%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <header className="absolute inset-x-0 top-0 flex items-center justify-between p-6 text-sm md:p-10">
          <b>aly</b>
          <a href={data.whatsapp} className="rounded-full border border-white/40 px-4 py-2">WhatsApp</a>
        </header>
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '-0.03em' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,10vw,9.5rem)] leading-[0.9] font-extrabold"
          >
            {data.name}
          </motion.h1>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-lg text-white/70">{data.offer}. Наведите курсор на фото.</p>
            <a href={data.start} className="w-fit rounded-full bg-white px-7 py-3.5 font-semibold text-black">Оставить заявку</a>
          </div>
        </div>
      </section>

      <section className="pt-24">
        <p className="px-6 text-sm text-white/50 md:px-10">Работы — тяните влево →</p>
        <div ref={track} className="mt-6 overflow-hidden">
          <motion.div drag="x" dragConstraints={track} className="flex w-max cursor-grab gap-5 px-6 active:cursor-grabbing md:px-10">
            {data.works.map((work) => (
              <div key={work.title} className="group w-[80vw] shrink-0 md:w-[42vw]">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={work.image}
                    alt=""
                    draggable={false}
                    className="aspect-[16/10] w-full object-cover object-top grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-2xl font-bold">{work.title}</span>
                  <span className="text-white/50">{work.year}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-6 mt-32 rounded-[32px] bg-white px-6 py-24 text-center text-black md:mx-10">
        <p className="text-[clamp(2.5rem,7vw,6rem)] leading-none font-extrabold tracking-[-0.03em]">Есть идея?</p>
        <p className="mt-4 text-lg text-black/60">Отвечаю в течение дня.</p>
        <a href={data.start} className="mt-8 inline-flex rounded-full bg-black px-8 py-4 text-white">Обсудить проект</a>
      </section>
    </div>
  );
}

'use client';

/* eslint-disable @next/next/no-img-element -- lab previews use plain images */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import type { LabData } from '../data';

/*
 * E. Bento — one tidy grid of rounded tiles, each with its own small life: a
 * counter, a live Dushanbe clock, work changing by itself, a ring filling up
 * to "3 days", a stack of tools running past, a pulsing WhatsApp door.
 */
const face = { fontFamily: 'var(--font-manrope)' };
const shell = 'relative overflow-hidden rounded-[28px] p-6';
const tile = `${shell} bg-white`;

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const v = useMotionValue(0);
  const shown = useTransform(v, (n) => Math.round(n));
  useEffect(() => {
    if (seen) animate(v, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
  }, [seen, to, v]);
  return <motion.span ref={ref}>{shown}</motion.span>;
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now?.toLocaleTimeString('ru-RU', { timeZone: 'Asia/Dushanbe', hour: '2-digit', minute: '2-digit' }) ?? '--:--';
  const hour = now ? Number(now.toLocaleString('en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', hour12: false })) : 12;
  const online = hour >= 10 && hour < 23;
  return (
    <>
      <p className="text-sm text-black/50">Сейчас в Душанбе</p>
      <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">{time}</p>
      <p className="mt-3 flex items-center gap-2 text-sm">
        <span className={`size-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        {online ? 'На связи' : 'Отвечу утром'}
      </p>
    </>
  );
}

export function Bento({ data }: { data: LabData }) {
  const [shown, setShown] = useState(0);
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setShown((i) => (i + 1) % Math.max(1, data.works.length)), 3200);
    const b = setInterval(() => setQuote((i) => (i + 1) % Math.max(1, data.reviews.length)), 5200);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [data.works.length, data.reviews.length]);
  const work = data.works[shown];
  const review = data.reviews[quote];
  const tools = ['Next.js', 'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Telegram Bot API', 'Tailwind', 'Figma'];

  return (
    <div style={face} className="min-h-screen bg-[#f0f0f3] px-3 pt-3 pb-40 text-[#111] md:px-6 md:pt-6">
      <div className="mx-auto grid max-w-6xl auto-rows-[minmax(190px,auto)] grid-cols-2 gap-3 md:grid-cols-4">
        {/* Him. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className={`${tile} col-span-2 row-span-2 min-h-[420px] p-0`}
        >
          <img src="/photo/about.webp" alt="" className="absolute inset-0 size-full object-cover object-[55%_35%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <h1 className="text-[clamp(2rem,4.4vw,3.5rem)] leading-none font-extrabold tracking-tight">{data.name}</h1>
            <p className="mt-2 text-white/80">{data.offer}</p>
          </div>
        </motion.div>

        <div className={tile}>
          <p className="text-6xl font-extrabold tracking-tight">
            <Counter to={50} />+
          </p>
          <p className="mt-2 text-black/50">проектов сделано</p>
        </div>

        <div className={tile}>
          <Clock />
        </div>

        {/* Work, changing by itself. */}
        <a href={work?.href} className={`${tile} col-span-2 p-0`}>
          <AnimatePresence mode="popLayout">
            {work && (
              <motion.img
                key={work.image}
                src={work.image}
                alt=""
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute inset-0 size-full object-cover object-top"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 backdrop-blur">
            <span className="font-bold">{work?.title}</span>
            <span className="text-sm text-black/50">Работы · {shown + 1}/{data.works.length}</span>
          </div>
        </a>

        {/* First draft in three days. */}
        <div className={`${tile} flex items-center gap-5`}>
          <svg viewBox="0 0 40 40" className="size-20 shrink-0 -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#eee" strokeWidth="4" />
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#111"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </svg>
          <p className="text-lg leading-tight font-bold">Первый набросок за 1–3 дня</p>
        </div>

        <div className={`${shell} bg-[#111] text-white`}>
          <p className="text-sm text-white/50">Цены</p>
          <p className="mt-2 text-3xl font-extrabold">от 1 500 сомони</p>
          <p className="mt-2 text-sm text-white/50">сайт, бот или магазин</p>
        </div>

        {/* Tools running past. */}
        <div className={`${tile} col-span-2 flex items-center p-0`}>
          <motion.div
            className="flex w-max gap-3 px-3"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {[...tools, ...tools].map((tool, i) => (
              <span key={i} className="rounded-full bg-[#f0f0f3] px-5 py-3 text-lg font-semibold whitespace-nowrap">
                {tool}
              </span>
            ))}
          </motion.div>
        </div>

        {/* A review, changing by itself. */}
        <div className={`${tile} col-span-2`}>
          <AnimatePresence mode="wait">
            {review && (
              <motion.div key={quote} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <p className="text-lg leading-snug font-semibold">“{review.text}”</p>
                <p className="mt-3 text-sm text-black/50">{review.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The door. */}
        <a href={data.whatsapp} className={`${shell} col-span-2 flex items-center justify-between bg-[#25d366] text-white`}>
          <div>
            <p className="text-3xl font-extrabold">Написать в WhatsApp</p>
            <p className="mt-1 text-white/80">Отвечаю в течение дня</p>
          </div>
          <span className="relative grid size-16 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
            <span className="relative grid size-16 place-items-center rounded-full bg-white text-2xl text-[#25d366]">→</span>
          </span>
        </a>
      </div>
    </div>
  );
}

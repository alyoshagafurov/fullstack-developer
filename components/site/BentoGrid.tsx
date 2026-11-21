'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';

/*
 * Everything useful, without a paragraph (concept E): a grid of tiles, each
 * with its own small life — the project count counting up, Dushanbe's clock
 * and whether he is answering now, a ring filling to "three days", prices,
 * the tools running past, reviews changing by themselves, him, and the
 * WhatsApp door.
 */

export type BentoCopy = {
  projects: string;
  clock: string;
  online: string;
  offline: string;
  prices: string;
  pricesFrom: string;
  pricesLine: string;
  whatsappTitle: string;
  replyWithin: string;
  draft: string;
  personTitle: string;
  personMore: string;
};

const TOOLS = ['Next.js', 'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Telegram Bot API', 'Tailwind CSS', 'Figma', 'Vercel'];

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const value = useMotionValue(0);
  const shown = useTransform(value, (n) => Math.round(n));
  useEffect(() => {
    if (seen) animate(value, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
  }, [seen, to, value]);
  return <motion.span ref={ref}>{shown}</motion.span>;
}

function Clock({ copy, lang }: { copy: BentoCopy; lang: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const time =
    now?.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', minute: '2-digit' }) ??
    '--:--';
  const hour = now ? Number(now.toLocaleString('en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', hour12: false })) : 12;
  const online = hour >= 10 && hour < 23;
  return (
    <>
      <p className="wall-label">{copy.clock}</p>
      <p className="font-display mt-3 text-[clamp(2.5rem,4.4vw,3.75rem)] leading-none font-extrabold tabular-nums">{time}</p>
      <p className="mt-4 flex items-center gap-2 text-sm font-medium">
        <span className={`size-2.5 rounded-full ${online ? 'bg-whatsapp' : 'bg-brass'}`} />
        {online ? copy.online : copy.offline}
      </p>
    </>
  );
}

export function BentoGrid({
  copy,
  lang,
  price,
  reviews,
  whatsappHref,
  aboutHref,
}: {
  copy: BentoCopy;
  lang: string;
  price: string | null;
  reviews: { text: string; name: string; lang: string }[];
  whatsappHref: string;
  aboutHref: string;
}) {
  const reduce = useReducedMotion();
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    if (reduce || reviews.length < 2) return;
    const id = setInterval(() => setQuote((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [reduce, reviews.length]);
  const review = reviews[quote];

  return (
    <section className="pb-24 md:pb-36" aria-label={copy.projects}>
      <div className="hall-wide grid auto-rows-[minmax(200px,auto)] grid-cols-2 gap-3 md:grid-cols-4">
        <div data-fade className="tile flex flex-col justify-between p-6 md:p-7">
          <p className="font-display text-[clamp(3rem,5vw,4.5rem)] leading-none font-extrabold">
            <Counter to={50} />+
          </p>
          <p className="wall-label">{copy.projects}</p>
        </div>

        <div data-fade className="tile flex flex-col justify-between p-6 md:p-7">
          <Clock copy={copy} lang={lang} />
        </div>

        <Link href={aboutHref} data-fade className="tile group col-span-2 row-span-2 min-h-[420px]">
          <Image
            src="/gallery/work-phone.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_30%] transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-8">
            <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.05] font-extrabold uppercase">{copy.personTitle}</p>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-black transition-transform duration-500 group-hover:-rotate-45">
              <ArrowIcon />
            </span>
          </div>
        </Link>

        <div data-fade className="tile col-span-2 flex items-center gap-6 p-6 md:p-7">
          <svg viewBox="0 0 40 40" className="size-20 shrink-0 -rotate-90 md:size-24" aria-hidden>
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-wall-3)" strokeWidth="4.5" />
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="var(--color-brass)"
              strokeWidth="4.5"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
          </svg>
          <p className="room-title">{copy.draft}</p>
        </div>

        <div data-fade data-tone="dark" className="tile flex flex-col justify-between bg-wall p-6 md:p-7">
          <p className="wall-label">{copy.prices}</p>
          <div>
            <p className="font-display text-[clamp(1.125rem,2.2vw,2.25rem)] leading-tight font-extrabold">
              {copy.pricesFrom}{' '}
              <span className="whitespace-nowrap">{price?.replace(/^(от|from)\s+/i, '')}</span>
            </p>
            <p className="mt-2 text-sm text-bone-2">{copy.pricesLine}</p>
          </div>
        </div>

        <div data-fade className="tile flex items-center overflow-hidden p-0 md:col-span-1">
          <motion.div
            className="flex w-max gap-2.5 px-3"
            animate={reduce ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          >
            {[...TOOLS, ...TOOLS].map((tool, i) => (
              <span key={i} className="rounded-full bg-wall px-4 py-2.5 text-base font-semibold whitespace-nowrap">
                {tool}
              </span>
            ))}
          </motion.div>
        </div>

        <div data-fade className="tile col-span-2 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {review && (
              <motion.figure
                key={quote}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
              >
                <blockquote lang={review.lang} className="text-[clamp(1.125rem,1.8vw,1.5rem)] leading-snug font-semibold">
                  “{review.text}”
                </blockquote>
                <figcaption className="wall-label mt-4">{review.name}</figcaption>
              </motion.figure>
            )}
          </AnimatePresence>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-fade
          className="tile group col-span-2 flex items-center justify-between gap-6 bg-whatsapp p-6 text-[#0a0a0a] md:col-span-4 md:p-8"
        >
          <span>
            <span className="font-display block text-[clamp(1.5rem,2.8vw,2.5rem)] leading-tight font-extrabold uppercase">
              {copy.whatsappTitle}
            </span>
            <span className="mt-2 block text-[#0a0a0a]/75">{copy.replyWithin}</span>
          </span>
          <span className="relative grid size-16 shrink-0 place-items-center">
            {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#0a0a0a]/25" />}
            <span className="relative grid size-16 place-items-center rounded-full bg-[#0a0a0a] text-whatsapp transition-transform duration-500 group-hover:-rotate-45">
              <ArrowIcon className="size-5" />
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}

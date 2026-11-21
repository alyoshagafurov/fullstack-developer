'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { EASE, Rise, Words } from '@/components/site/Reveal';

/*
 * The rooms of the home page, below the first screen. Each one is a single
 * huge headline and one small line in a corner; the pictures do the rest.
 */

/* ---------------------------------------------------------------- 2 · him */

export function Philosophy({
  title,
  hand,
  note,
  more,
  moreHref,
  alt,
}: {
  title: string;
  hand: string;
  note: string;
  more: string;
  moreHref: string;
  alt: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const clip = useTransform(scrollYProgress, [0, 0.45], ['inset(18% 14% 18% 14% round 28px)', 'inset(0% 0% 0% 0% round 28px)']);
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section aria-labelledby="philosophy-title" className="py-28 md:py-44">
      <div className="hall grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="flex flex-col justify-between gap-12 md:col-span-6">
          <div>
            <Rise>
              <p className="hand -rotate-3 text-3xl text-brass md:text-4xl">{hand}</p>
            </Rise>
            <Words id="philosophy-title" text={title} className="hall-title mt-3" />
          </div>
          <Rise className="md:max-w-xs" delay={0.2}>
            <p className="wall-note">{note}</p>
            <Link href={moreHref} className="link-more mt-5 text-sm">
              {more}
              <ArrowIcon className="size-3.5" />
            </Link>
          </Rise>
        </div>

        <div ref={ref} className="md:col-span-5 md:col-start-8">
          <motion.div style={reduce ? undefined : { clipPath: clip }} className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <motion.div style={reduce ? undefined : { y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
              <Image src="/me/evening.webp" alt={alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- 3 · the directions */

export type Collection = { key: string; word: string; script: string; href: string; price: string | null };

export function Collections({
  title,
  note,
  from,
  items,
}: {
  title: string;
  note: string;
  from: string;
  items: Collection[];
}) {
  return (
    <section aria-labelledby="collections-title" className="pb-28 md:pb-44">
      <div className="hall">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Words id="collections-title" text={title} className="hall-title" />
          <Rise className="md:pb-3">
            <p className="wall-note md:text-right">{note}</p>
          </Rise>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-4 md:gap-4">
          {items.map((item, i) => (
            <motion.li
              key={item.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.08 }}
            >
                <Link
                  href={item.href}
                  className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[24px] bg-wall-2 p-5 transition-colors duration-700 ease-[var(--ease-gallery)] hover:bg-[#2433ff] hover:text-white md:p-7"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="hand -rotate-2 text-lg leading-snug text-brass transition-colors duration-700 group-hover:text-white md:text-xl">
                      {item.script}
                    </span>
                    <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-wall text-bone transition-transform duration-700 group-hover:rotate-45 md:grid">
                      <ArrowIcon className="size-4 -rotate-45" />
                    </span>
                  </span>
                  <span>
                    <span className="room-title block text-[clamp(1.5rem,6.4vw,3.25rem)] transition-transform duration-700 ease-[var(--ease-gallery)] group-hover:-translate-y-1 md:text-[clamp(1.75rem,3.2vw,3.25rem)]">
                      {item.word}
                    </span>
                    {item.price && (
                      <span className="mt-2 block text-sm font-light text-bone-2 transition-colors duration-700 group-hover:text-white/80">
                        {from} {item.price.replace(/^(от|from)\s+/i, '')}
                      </span>
                    )}
                  </span>
                </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- 4 · the work */

export type Work = { slug: string; href: string; title: string; client: string | null; year: string; image: string };

function WorkCard({ work, tall = false, sizes }: { work: Work; tall?: boolean; sizes: string }) {
  const reduce = useReducedMotion();
  return (
    <Link href={work.href} className="group block">
      <motion.div
        initial={reduce ? false : { clipPath: 'inset(12% 0% 0% 0% round 24px)', opacity: 0.2 }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 24px)', opacity: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.3, ease: EASE }}
        className={`zoom-on-hover relative overflow-hidden rounded-[24px] bg-wall-2 ${tall ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}
      >
        <Image src={work.image} alt={work.title} fill sizes={sizes} className="object-cover object-top" />
      </motion.div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="room-title text-[clamp(1.25rem,2vw,1.75rem)]">{work.title}</p>
        <p className="text-sm font-light text-bone-2">
          {[work.client, work.year].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
}

export function SelectedWorks({
  title,
  note,
  all,
  allHref,
  works,
}: {
  title: string;
  note: string;
  all: string;
  allHref: string;
  works: Work[];
}) {
  const [first, second, third, fourth, fifth] = works;
  return (
    <section aria-labelledby="works-title" className="pb-28 md:pb-44">
      <div className="hall">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="works-title" className="hall-title">
            <Words as="span" text={title} />
            <sup className="ml-2 align-super font-[family-name:var(--font-text)] text-[0.28em] font-light tracking-normal text-bone-2">
              {String(works.length).padStart(2, '0')}
            </sup>
          </h2>
          <Rise className="md:pb-3">
            <p className="wall-note md:text-right">{note}</p>
          </Rise>
        </div>

        <div className="mt-14 grid gap-x-4 gap-y-14 md:mt-20 md:grid-cols-12 md:gap-y-24">
          {first && (
            <div className="md:col-span-12">
              <WorkCard work={first} sizes="100vw" />
            </div>
          )}
          {second && (
            <div className="md:col-span-5">
              <WorkCard work={second} tall sizes="(min-width: 768px) 42vw, 100vw" />
            </div>
          )}
          {third && (
            <div className="md:col-span-6 md:col-start-7 md:mt-40">
              <WorkCard work={third} tall sizes="(min-width: 768px) 50vw, 100vw" />
            </div>
          )}
          {fourth && (
            <div className="md:col-span-7">
              <WorkCard work={fourth} sizes="(min-width: 768px) 58vw, 100vw" />
            </div>
          )}
          {fifth && (
            <div className="md:col-span-4 md:col-start-9 md:mt-28">
              <WorkCard work={fifth} tall sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
          )}
        </div>

        <div className="mt-16 flex justify-center md:mt-24">
          <Link href={allHref} className="btn-line group">
            {all}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 5 · the details */

export function Details({ title, note, image, alt }: { title: string; note: string; image: string; alt: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.42, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.7], [32, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.25, 0.55], [1, 0]);
  const noteOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1]);

  if (reduce) {
    return (
      <section aria-labelledby="details-title" className="pb-28 md:pb-44">
        <div className="hall">
          <h2 id="details-title" className="hall-title text-center">
            {title}
          </h2>
          <div className="exhibit relative mt-12 aspect-[16/9]">
            <Image src={image} alt={alt} fill sizes="100vw" className="object-cover object-top" />
          </div>
          <p className="wall-note mt-6">{note}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-labelledby="details-title" className="relative h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.h2
          id="details-title"
          style={{ opacity: titleOpacity }}
          className="hall-title hall absolute inset-x-0 top-[14vh] z-0 text-center"
        >
          {title}
        </motion.h2>
        <motion.div
          style={{ scale, borderRadius: radius }}
          className="relative z-10 h-[100svh] w-full origin-center overflow-hidden bg-wall-2"
        >
          <Image src={image} alt={alt} fill sizes="100vw" className="object-cover object-top" />
        </motion.div>
        <motion.div style={{ opacity: noteOpacity }} className="absolute bottom-6 left-5 z-20 md:bottom-10 md:left-10">
          <p data-tone="dark" className="wall-note rounded-2xl bg-wall/80 px-5 py-4 backdrop-blur-md">
            {note}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- 6 · the workshop */

export function Craft({
  title,
  hand,
  note,
  photoAlt,
}: {
  title: string;
  hand: string;
  note: string;
  photoAlt: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const upA = useTransform(scrollYProgress, [0, 1], ['18%', '-14%']);
  const upB = useTransform(scrollYProgress, [0, 1], ['4%', '-6%']);

  return (
    <section ref={ref} data-tone="brand" aria-labelledby="craft-title" className="overflow-hidden py-28 md:py-44">
      <div className="hall">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Rise>
              <p className="hand -rotate-3 text-3xl md:text-4xl">{hand}</p>
            </Rise>
            <Words id="craft-title" text={title} className="hall-title mt-3 max-w-[14ch]" />
          </div>
          <Rise className="md:pb-3">
            <p className="wall-note md:text-right">{note}</p>
          </Rise>
        </div>

        <div className="mt-16 grid grid-cols-12 items-start gap-3 md:mt-24 md:gap-6">
          <motion.div style={reduce ? undefined : { y: upA }} className="col-span-5 md:col-span-4 md:col-start-2 md:mt-40">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[24px]">
              <Image src="/me/records.webp" alt={photoAlt} fill sizes="(min-width: 768px) 30vw, 42vw" className="object-cover" />
            </div>
          </motion.div>
          <motion.div style={reduce ? undefined : { y: upB }} className="col-span-7 md:col-span-5 md:col-start-7">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[24px]">
              <Image src="/me/leather.webp" alt={photoAlt} fill sizes="(min-width: 768px) 40vw, 58vw" className="object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- 7 · made to measure */

export function Bespoke({
  title,
  hand,
  note,
  days,
  cta,
  ctaHref,
}: {
  title: string;
  hand: string;
  note: string;
  days: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <section aria-labelledby="bespoke-title" className="py-28 md:py-44">
      <div className="hall grid gap-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Words id="bespoke-title" text={title} className="hall-title" />
          <Rise delay={0.15}>
            <p className="hand mt-2 -rotate-2 text-3xl text-brass md:text-4xl">{hand}</p>
          </Rise>
          <Rise delay={0.25} className="mt-12">
            <Link href={ctaHref} className="btn-brand group">
              {cta}
              <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Rise>
        </div>
        <div className="md:col-span-5">
          <Rise>
            <p className="mega text-[clamp(7rem,18vw,16rem)]">1–3</p>
            <p className="wall-label mt-4">{days}</p>
          </Rise>
          <Rise delay={0.15} className="mt-10 border-t border-seam pt-6">
            <p className="wall-note">{note}</p>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 8 · the reviews */

export type Story = { text: string; name: string; role: string | null; avatar: string | null; lang: string };

export function Stories({
  title,
  note,
  all,
  allHref,
  prev,
  next,
  stories,
}: {
  title: string;
  note: string;
  all: string;
  allHref: string;
  prev: string;
  next: string;
  stories: Story[];
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  if (stories.length === 0) return null;
  const story = stories[index];
  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + stories.length) % stories.length);
  };

  return (
    <section aria-labelledby="stories-title" className="bg-wall-2 py-28 md:py-40">
      <div className="hall">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Words id="stories-title" text={title} className="hall-title" />
          <Rise className="md:pb-3">
            <p className="wall-note md:text-right">{note}</p>
            <Link href={allHref} className="link-more mt-3 text-sm md:justify-end">
              {all}
              <ArrowIcon className="size-3.5" />
            </Link>
          </Rise>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <div className="relative min-h-[16rem] md:col-span-9 md:min-h-[20rem]" aria-live="polite">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={index}
                initial={reduce ? false : { opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <blockquote lang={story.lang} className="text-[clamp(1.5rem,3vw,2.75rem)] leading-[1.2] font-light tracking-[-0.015em] text-pretty">
                  “{story.text}”
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  {story.avatar && (
                    <Image src={story.avatar} alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
                  )}
                  <span>
                    <span className="block font-semibold">{story.name}</span>
                    {story.role && <span className="block text-sm font-light text-bone-2">{story.role}</span>}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="flex items-end gap-3 md:col-span-3 md:justify-end">
            <span className="mr-auto text-sm font-light tabular-nums text-bone-2 md:mr-3">
              {String(index + 1).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => go(-1)} aria-label={prev} className="grid size-14 place-items-center rounded-full border border-seam-2 transition-colors hover:bg-bone hover:text-wall">
              <ArrowIcon className="rotate-180" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={next} className="grid size-14 place-items-center rounded-full bg-bone text-wall transition-transform hover:-translate-y-0.5">
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- 9 · where he works */

export function Origin({
  title,
  note,
  clockLabel,
  online,
  offline,
  lang,
  alt,
}: {
  title: string;
  note: string;
  clockLabel: string;
  online: string;
  offline: string;
  lang: string;
  alt: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const time =
    now?.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', minute: '2-digit' }) ?? '--:--';
  const hour = now ? Number(now.toLocaleString('en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', hour12: false })) : 12;
  const awake = hour >= 10 && hour < 23;

  return (
    <section ref={ref} data-tone="dark" aria-labelledby="origin-title" className="relative flex min-h-[100svh] overflow-hidden">
      <motion.div style={reduce ? undefined : { y }} className="absolute -inset-y-[14%] inset-x-0">
        <Image src="/me/night-code.webp" alt={alt} fill sizes="100vw" className="object-cover object-[50%_48%]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/70" />
      <div className="hall relative flex flex-1 flex-col justify-between py-24 md:py-28">
        <Words id="origin-title" text={title} className="hall-title max-w-[12ch] text-white" />
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Rise>
            <p className="wall-label">{clockLabel}</p>
            <p className="font-display mt-2 text-[clamp(3rem,6vw,5rem)] leading-none font-black tabular-nums">{time}</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-light">
              <span className={`size-2 rounded-full ${awake ? 'bg-whatsapp' : 'bg-white/50'}`} />
              {awake ? online : offline}
            </p>
          </Rise>
          <Rise delay={0.1}>
            <p className="wall-note md:text-right">{note}</p>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- 10 · the way in */

export function Contact({
  title,
  note,
  form,
  formHref,
  whatsapp,
  whatsappHref,
  links,
}: {
  title: string;
  note: string;
  form: string;
  formHref: string;
  whatsapp: string;
  whatsappHref: string;
  links: { label: string; href: string }[];
}) {
  return (
    <section data-doors aria-labelledby="contact-title" className="relative overflow-hidden py-32 md:py-48">
      <div className="hall flex flex-col items-center text-center">
        <Words id="contact-title" text={title} className="hall-title max-w-[12ch] text-[clamp(3rem,9vw,9rem)]" />
        <Rise delay={0.15}>
          <p className="lead-line mx-auto mt-6 max-w-md">{note}</p>
        </Rise>
        <Rise delay={0.25} className="mt-12 flex flex-wrap justify-center gap-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-bone group bg-whatsapp! text-[#0b0b0c]!">
            <WhatsAppIcon className="size-5" />
            {whatsapp}
          </a>
          <Link href={formHref} className="btn-line group">
            {form}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </Rise>
        <Rise delay={0.35}>
          <ul className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-light">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="link-quiet">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Rise>
      </div>
    </section>
  );
}

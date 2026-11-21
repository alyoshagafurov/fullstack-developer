'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon, ChevronIcon, WhatsAppIcon } from '@/components/museum/Icons';

/*
 * The home page, shown the way Apple shows a Mac and Porsche shows a 911:
 * black stages and quiet white rooms, one idea per screen, large type set
 * tight, the work presented as the product. Motion is slow and physical —
 * things settle into place rather than bounce — and every section leaves the
 * visitor one obvious next step.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const display = 'font-display font-semibold tracking-[-0.045em] text-balance';

/* ================================================================ hero */

export type Capture = { src: string; width: number; height: number };

export function Hero({
  eyebrow,
  title,
  sub,
  cta,
  ctaHref,
  seeWork,
  seeWorkHref,
  capture,
  captureTitle,
  captureKind,
}: {
  eyebrow: string;
  title: readonly string[];
  sub: string;
  cta: string;
  ctaHref: string;
  seeWork: string;
  seeWorkHref: string;
  capture: Capture | null;
  captureTitle: string;
  captureKind: string;
}) {
  const reduce = useReducedMotion();
  return (
    <section data-tone="dark" aria-labelledby="hero-title" className="bg-black text-bone">
      <div className="hall pt-36 text-center md:pt-44">
        <motion.p
          className="text-[1.0625rem] font-medium text-bone-2 md:text-[1.1875rem]"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        >
          {eyebrow}
        </motion.p>
        <h1 id="hero-title" className={`${display} mx-auto mt-4 text-[clamp(2.9rem,7.4vw,7.25rem)] leading-[1.02]`}>
          {title.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.2 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.55 }}
        >
          <p className="mx-auto mt-6 max-w-xl text-[clamp(1.0625rem,1.6vw,1.3125rem)] leading-relaxed text-bone-2">{sub}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link href={ctaHref} className="inline-flex min-h-12 items-center rounded-full bg-[#0071e3] px-7 text-[1.0625rem] font-medium text-white transition-colors hover:bg-[#0077ed]">
              {cta}
            </Link>
            <Link href={seeWorkHref} className="group inline-flex items-center gap-1 text-[1.0625rem] text-brass hover:underline">
              {seeWork}
              <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
      {capture && <DeviceZoom capture={capture} title={captureTitle} kind={captureKind} />}
    </section>
  );
}

/* A window on one of his sites that grows from a framed screen to the whole viewport. */
function DeviceZoom({ capture, title, kind }: { capture: Capture; title: string; kind: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0.15, 0.62], [0.66, 1]);
  const radius = useTransform(scrollYProgress, [0.15, 0.62], [26, 0]);
  const shift = useTransform(scrollYProgress, [0.45, 1], ['0%', '-62%']);
  const caption = useTransform(scrollYProgress, [0.66, 0.8], [0, 1]);
  const glow = useTransform(scrollYProgress, [0.15, 0.5], [1, 0]);
  // it starts a little below the top and rises to meet the edges as it grows
  const lift = useTransform(scrollYProgress, [0.15, 0.62], ['6svh', '0svh']);

  return (
    <div ref={ref} className="relative mt-12 h-[230svh] md:mt-14">
      <div className="sticky top-0 flex h-[100svh] items-start justify-center overflow-hidden">
        <motion.div
          aria-hidden
          style={reduce ? undefined : { opacity: glow }}
          className="pointer-events-none absolute top-1/2 left-1/2 h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(41_151_255/0.22),transparent)] blur-2xl"
        />
        <motion.div
          style={reduce ? { scale: 0.9, borderRadius: 20, transformOrigin: '50% 0%' } : { scale, borderRadius: radius, transformOrigin: '50% 0%', y: lift }}
          className="relative h-[100svh] w-screen overflow-hidden bg-[#0b0b0c] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_60px_160px_-40px_rgb(0_0_0/0.9)]"
        >
          <motion.div style={reduce ? undefined : { y: shift }} className="absolute inset-x-0 top-0">
            <Image src={capture.src} alt={title} width={capture.width} height={capture.height} sizes="100vw" className="h-auto w-full" priority />
          </motion.div>
          <motion.div style={{ opacity: caption }} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-40 pb-10">
            <div className="hall flex items-end justify-between gap-6 text-white">
              <div>
                <p className="text-sm text-white/70">{kind}</p>
                <p className={`${display} mt-1 text-[clamp(2rem,4vw,3.5rem)]`}>{title}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* =============================================================== specs */

function Count({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const match = value.match(/^(\d+)(.*)$/);
  const mv = useMotionValue(0);
  const shown = useTransform(mv, (n) => `${Math.round(n)}${match?.[2] ?? ''}`);
  useEffect(() => {
    if (seen && match) animate(mv, Number(match[1]), { duration: 1.6, ease: EASE });
  }, [seen, match, mv]);
  if (!match || value.includes('–')) return <span ref={ref}>{value}</span>;
  return <motion.span ref={ref}>{shown}</motion.span>;
}

export function Specs({ items }: { items: readonly { value: string; label: string }[] }) {
  return (
    <section data-tone="dark" className="bg-black pt-10 pb-28 text-bone md:pb-40">
      <div className="hall grid grid-cols-2 gap-y-12 border-t border-seam pt-12 md:grid-cols-4 md:pt-16">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.08} className="pr-6">
            <p className={`${display} text-[clamp(3rem,6vw,5.25rem)] leading-none tabular-nums`}>
              <Count value={item.value} />
            </p>
            <p className="mt-3 max-w-[16ch] text-[0.9375rem] leading-snug text-bone-2">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ the work */

export type ShowWork = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  client: string | null;
  result: string;
  host: string | null;
  liveUrl: string | null;
  href: string;
  desktop: Capture | null;
  shot: string;
  phone: Capture | null;
};

export function Showcase({
  id,
  title,
  sub,
  labels,
  openSite,
  details,
  works,
}: {
  id: string;
  title: string;
  sub: string;
  labels: { kind: string; year: string; client: string; result: string };
  openSite: string;
  details: string;
  works: ShowWork[];
}) {
  const [index, setIndex] = useState(0);
  const work = works[index];
  if (!work) return null;

  return (
    <section id={id} aria-labelledby="work-title" className="scroll-mt-16 bg-wall-2 py-28 md:py-40">
      <div className="hall">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="work-title" className={`${display} text-[clamp(2.75rem,6vw,5.5rem)] leading-none`}>
            {title}
          </h2>
          <p className="max-w-sm text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug text-bone-2 md:text-right">{sub}</p>
        </Reveal>

        {/* the model selector */}
        <Reveal delay={0.1} className="-mx-5 mt-12 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
          <div role="tablist" aria-label={title} className="inline-flex gap-1 rounded-full bg-wall-3/70 p-1">
            {works.map((w, i) => (
              <button
                key={w.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className="relative min-h-10 rounded-full px-5 text-[0.9375rem] font-medium whitespace-nowrap text-bone-2 transition-colors aria-selected:text-bone"
              >
                {i === index && (
                  <motion.span layoutId="work-pill" className="absolute inset-0 -z-0 rounded-full bg-wall shadow-[0_1px_4px_rgb(0_0_0/0.12)]" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
                )}
                <span className="relative">{w.title}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:gap-10">
          {/* the product */}
          <div className="relative md:order-2 md:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={work.slug}
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative pb-[8%]"
              >
                <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_2px_6px_rgb(0_0_0/0.05),0_40px_90px_-30px_rgb(0_0_0/0.35)] ring-1 ring-black/5">
                  <div className="flex h-9 items-center gap-2 border-b border-black/5 bg-[#f6f6f8] px-4">
                    <span className="size-3 rounded-full bg-[#ff5f57]" />
                    <span className="size-3 rounded-full bg-[#febc2e]" />
                    <span className="size-3 rounded-full bg-[#28c840]" />
                    <span className="mx-auto max-w-[60%] truncate rounded-md bg-black/[0.045] px-10 py-1 text-xs text-bone-2">{work.host ?? work.title}</span>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={work.desktop?.src ?? work.shot}
                      alt={work.title}
                      fill
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className={`object-cover object-top ${work.desktop ? 'screen-drift' : ''}`}
                    />
                  </div>
                </div>
                {work.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
                    className="absolute right-[-2%] bottom-0 w-[24%] min-w-[110px] rounded-[clamp(18px,2.6vw,34px)] bg-[#0b0b0c] p-[clamp(4px,0.6vw,8px)] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.5)]"
                  >
                    <div className="relative aspect-[9/19.5] overflow-hidden rounded-[clamp(14px,2.1vw,28px)] bg-black">
                      <Image src={work.phone.src} alt="" fill sizes="20vw" className="screen-drift object-cover object-top" style={{ animationDelay: '-4s' }} />
                      <span className="absolute top-[2.2%] left-1/2 h-[3.2%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* its specification */}
          <div className="md:order-1 md:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={work.slug}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <h3 className={`${display} text-[clamp(2.25rem,3.6vw,3.25rem)] leading-none [overflow-wrap:anywhere]`}>{work.title}</h3>
                <dl className="mt-8 border-t border-seam">
                  {[
                    [labels.kind, work.kind],
                    [labels.year, work.year],
                    [labels.client, work.client],
                    [labels.result, work.result],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-seam py-4 text-[0.9375rem]">
                        <dt className="text-bone-2">{k}</dt>
                        <dd className="leading-snug">{v}</dd>
                      </div>
                    ))}
                </dl>
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                  {work.liveUrl && (
                    <a href={work.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-[#0071e3] px-6 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#0077ed]">
                      {openSite}
                    </a>
                  )}
                  <Link href={work.href} className="group inline-flex items-center gap-1 text-[0.9375rem] text-brass hover:underline">
                    {details}
                    <ChevronIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== lineup */

export type Line = { key: string; word: string; script: string; price: string | null; href: string };

const GLYPHS: Record<string, React.ReactNode> = {
  sites: (
    <>
      <rect x="6" y="9" width="36" height="26" rx="3" />
      <path d="M6 15h36M16 41h16M24 35v6" />
    </>
  ),
  stores: (
    <>
      <path d="M10 16h28l-2.5 24h-23z" />
      <path d="M18 20v-5a6 6 0 0 1 12 0v5" />
    </>
  ),
  bots: (
    <>
      <path d="M42 8 6 22l12 4 4 12 6-8 9 7z" />
      <path d="m18 26 24-18" />
    </>
  ),
  apps: (
    <>
      <rect x="6" y="8" width="36" height="32" rx="3" />
      <path d="M14 30v-6M22 30V18M30 30v-9M38 30v-4" />
    </>
  ),
};

export function Lineup({ title, sub, from, choose, lines }: { title: string; sub: string; from: string; choose: string; lines: Line[] }) {
  return (
    <section aria-labelledby="line-title" className="bg-wall py-28 md:py-40">
      <div className="hall">
        <Reveal className="text-center">
          <h2 id="line-title" className={`${display} mx-auto max-w-3xl text-[clamp(2.5rem,5.4vw,5rem)] leading-[1.02]`}>
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[clamp(1.0625rem,1.4vw,1.25rem)] text-bone-2">{sub}</p>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 border-t border-seam sm:grid-cols-2 md:mt-24 lg:grid-cols-4 lg:border-t-0">
          {lines.map((line, i) => (
            <Reveal key={line.key} delay={i * 0.08} className="border-b border-seam lg:border-b-0 lg:border-l lg:first:border-l-0">
              <Link href={line.href} className="group flex h-full flex-col items-start px-2 py-10 transition-colors hover:bg-wall-2/60 lg:items-center lg:px-8 lg:text-center">
                <svg viewBox="0 0 48 48" className="size-12 text-bone" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                  {GLYPHS[line.key]}
                </svg>
                <p className={`${display} mt-7 text-[2rem] leading-none`}>{line.word}</p>
                <p className="mt-3 text-[0.9375rem] text-bone-2">{line.script}</p>
                {line.price && (
                  <p className="mt-6 text-[1.0625rem] font-medium">
                    {from} {line.price.replace(/^(от|from)\s+/i, '')}
                  </p>
                )}
                <span className="mt-6 inline-flex items-center gap-1 text-[0.9375rem] text-brass group-hover:underline">
                  {choose}
                  <ChevronIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================== story */

export function Story({
  eyebrow,
  title,
  text,
  more,
  moreHref,
  photo,
  alt,
}: {
  eyebrow: string;
  title: readonly string[];
  text: string;
  more: string;
  moreHref: string;
  photo: string;
  alt: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section ref={ref} data-tone="dark" aria-labelledby="story-title" className="relative flex min-h-[110svh] items-end overflow-hidden bg-black text-white">
      <motion.div style={reduce ? undefined : { scale, y }} className="absolute inset-0">
        <Image src={photo} alt={alt} fill sizes="100vw" className="object-cover object-[60%_40%]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />
      <div className="hall relative pb-20 md:pb-28">
        <Reveal>
          <p className="text-[1.0625rem] font-medium text-white/70">{eyebrow}</p>
          <h2 id="story-title" className={`${display} mt-3 text-[clamp(2.75rem,6.6vw,6.25rem)] leading-[1.0]`}>
            {title.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-lg text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-relaxed text-white/75">{text}</p>
          <Link href={moreHref} className="group mt-8 inline-flex items-center gap-1 text-[1.0625rem] text-[#2997ff] hover:underline">
            {more}
            <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================== voices */

export type Voice = { text: string; name: string; role: string | null; lang: string };

export function Voices({ title, voices, prev, next }: { title: string; voices: Voice[]; prev: string; next: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  if (voices.length === 0) return null;
  const v = voices[index];
  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + voices.length) % voices.length);
  };
  return (
    <section aria-labelledby="voices-title" className="bg-wall-2 py-28 md:py-40">
      <div className="hall text-center">
        <Reveal>
          <h2 id="voices-title" className={`${display} text-[clamp(2.5rem,5vw,4.5rem)] leading-none`}>
            {title}
          </h2>
        </Reveal>
        <div className="relative mx-auto mt-14 min-h-[15rem] max-w-4xl md:mt-20" aria-live="polite">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={index}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <blockquote lang={v.lang} className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.025em] text-balance">
                “{v.text}”
              </blockquote>
              <figcaption className="mt-8 text-[0.9375rem]">
                <span className="font-semibold">{v.name}</span>
                {v.role && <span className="text-bone-2"> · {v.role}</span>}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        {voices.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-6">
            <button type="button" onClick={() => go(-1)} aria-label={prev} className="grid size-11 place-items-center rounded-full bg-wall-3 transition-colors hover:bg-[#d2d2d7]">
              <ChevronIcon className="size-4 rotate-180" />
            </button>
            <div className="flex gap-2">
              {voices.map((_, i) => (
                <span key={i} className={`h-2 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-bone' : 'w-2 bg-bone/25'}`} />
              ))}
            </div>
            <button type="button" onClick={() => go(1)} aria-label={next} className="grid size-11 place-items-center rounded-full bg-wall-3 transition-colors hover:bg-[#d2d2d7]">
              <ChevronIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================== finale */

export function Finale({
  title,
  sub,
  cta,
  ctaHref,
  whatsapp,
  whatsappHref,
  links,
}: {
  title: string;
  sub: string;
  cta: string;
  ctaHref: string;
  whatsapp: string;
  whatsappHref: string;
  links: { label: string; href: string }[];
}) {
  return (
    <section data-tone="dark" data-doors aria-labelledby="final-title" className="bg-black py-36 text-center text-bone md:py-52">
      <div className="hall">
        <Reveal>
          <h2 id="final-title" className={`${display} text-[clamp(4rem,13vw,12rem)] leading-[0.95]`}>
            {title}
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-bone-2">{sub}</p>
        </Reveal>
        <Reveal delay={0.15} className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href={ctaHref} className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-[#0071e3] px-8 text-[1.0625rem] font-medium text-white transition-colors hover:bg-[#0077ed]">
            {cta}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center gap-2.5 rounded-full border border-white/25 px-8 text-[1.0625rem] font-medium transition-colors hover:border-white">
            <WhatsAppIcon className="size-5" />
            {whatsapp}
          </a>
        </Reveal>
        <Reveal delay={0.25}>
          <ul className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[0.9375rem] text-bone-2">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="transition-colors hover:text-bone">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

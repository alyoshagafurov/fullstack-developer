'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowIcon, ChevronIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { isPlaceholder } from '@/lib/content/placeholders';

/*
 * The home page, shown the way Apple shows a Mac and Porsche shows a 911:
 * black and graphite stages, one idea per screen, large type set tight, the
 * work presented as the product. Motion is slow and physical — things settle
 * into place rather than bounce — and every section leaves the visitor one
 * obvious next step.
 *
 * Colour has one job. The blue button is "start a project" and nothing else is
 * blue; a word that matters is lifted to white and bold, never tinted.
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

/* The one blue button. Every section that has a button has this one, and no other blue. */
const primary = (size: 'md' | 'lg' = 'md') =>
  `group inline-flex items-center justify-center gap-2 rounded-full bg-action font-medium text-white transition-[background-color,scale] duration-200 hover:bg-action-2 active:scale-[0.98] active:bg-action-3 ${
    size === 'lg' ? 'min-h-14 px-8 text-[1.0625rem]' : 'min-h-12 px-7 text-[1.0625rem]'
  }`;

/* Any other way out: an outline in the band's own colours, filled faintly on hover. */
const secondary = (size: 'sm' | 'md' = 'md') =>
  `group inline-flex items-center justify-center gap-2 rounded-full border border-seam-2 font-medium text-bone transition-[border-color,background-color,scale] duration-200 hover:border-bone hover:bg-bone/[0.06] active:scale-[0.98] ${
    size === 'sm' ? 'min-h-11 px-5 text-[0.9375rem]' : 'min-h-12 px-6 text-[1rem]'
  }`;

/* A link in a sentence's place: white, underlined on hover. */
const textLink = (size: 'sm' | 'md' = 'md') =>
  `group inline-flex min-h-11 items-center gap-1 text-bone decoration-1 underline-offset-[0.3em] hover:underline ${
    size === 'sm' ? 'text-[0.9375rem]' : 'text-[1.0625rem]'
  }`;

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* A paper plane in the same stroke as the site's other icons. */
function TelegramIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M21.5 2.5 15 21l-3.8-8.2L3 9l18.5-6.5Z" />
      <path d="M21.5 2.5 11.2 12.8" />
    </svg>
  );
}

/* ================================================================ hero */

export type Capture = { src: string; width: number; height: number };

export type HeroScreens = {
  /** What the two devices show, read out in place of the pictures. */
  label: string;
  desktop: Capture;
  desktopBlur?: string;
  phone: Capture;
  phoneBlur?: string;
};

/*
 * Two of his live sites on a laptop and a phone, both screens slowly scrolling
 * their real page. The phone overlaps the laptop's corner, the way a person
 * sets one down beside the other.
 */
function HeroStage({ screens }: { screens: HeroScreens }) {
  return (
    <div role="img" aria-label={screens.label} className="relative mx-auto w-full max-w-[36rem] px-[5%] pb-[4%] lg:max-w-none">
      <div className="rounded-t-[clamp(10px,1.4vw,20px)] bg-[#1c1c1e] p-[1.8%] pb-[2.4%] shadow-[0_60px_120px_-50px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[3px] bg-[#0b0b0c]">
          <Image
            src={screens.desktop.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 46vw, 90vw"
            // the captures are already sized and compressed: served as they are
            unoptimized
            preload
            placeholder={screens.desktopBlur ? 'blur' : 'empty'}
            blurDataURL={screens.desktopBlur}
            className="screen-drift object-cover object-top"
          />
        </div>
      </div>
      <div className="relative -mx-[5%] h-[clamp(9px,1.1vw,16px)] rounded-b-[clamp(8px,1vw,14px)] bg-[#2c2c2e] shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]">
        <span className="absolute top-0 left-1/2 h-1/2 w-[15%] -translate-x-1/2 rounded-b-[6px] bg-[#1c1c1e]" />
      </div>
      <div className="absolute right-0 bottom-0 w-[23%] min-w-[78px] rounded-[clamp(14px,2.2vw,30px)] bg-[#0b0b0c] p-[clamp(3px,0.5vw,7px)] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.85)] ring-1 ring-white/15">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[clamp(11px,1.8vw,24px)] bg-black">
          <Image
            src={screens.phone.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 11vw, 22vw"
            unoptimized
            loading="eager"
            placeholder={screens.phoneBlur ? 'blur' : 'empty'}
            blurDataURL={screens.phoneBlur}
            className="screen-drift object-cover object-top"
          />
          <span className="absolute top-[2.2%] left-1/2 h-[3.2%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}

export function Hero({
  eyebrow,
  title,
  sub,
  cta,
  ctaHref,
  ctaNote,
  screens,
}: {
  eyebrow: string;
  title: readonly string[];
  sub: string;
  cta: string;
  ctaHref: string;
  /** The promise, set beside the button, one checked line per half: the draft, then the payment. */
  ctaNote: readonly string[];
  screens: HeroScreens;
}) {
  const reduce = useReducedMotion();
  return (
    <section data-tone="dark" aria-labelledby="hero-title" className="overflow-hidden bg-black text-bone">
      {/*
       * Phone: text first, the button inside the first screen of a 390×844
       * phone, the devices below. Desk: text on the left, devices on the right,
       * both on one screen.
       */}
      <div className="hall grid items-center gap-14 pt-24 pb-20 md:pt-32 md:pb-28 lg:min-h-[min(100svh,62rem)] lg:grid-cols-12 lg:gap-8 lg:pt-28 lg:pb-20">
        <div className="lg:col-span-6">
          <motion.p
            className="text-[0.9375rem] font-medium text-bone-2 md:text-[1.0625rem]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            {eyebrow}
          </motion.p>
          <h1 id="hero-title" className={`${display} mt-4 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02]`}>
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
            transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
          >
            <p className="mt-6 max-w-[34rem] text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-relaxed text-bone-2">{sub}</p>
            {/* the promise sits beside the button where there is room, and drops under it rather than squeeze */}
            <div className="mt-8 flex flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-4">
              <Link href={ctaHref} className={primary()}>
                {cta}
                <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              {/* both halves of the promise on the first screen: nobody has to scroll to learn they pay only if they like it */}
              <ul className="flex flex-col gap-1.5 text-[0.9375rem] leading-snug text-bone-2 max-sm:self-center">
                {ctaNote.map((note) => (
                  <li key={note} className="flex items-center gap-2">
                    <CheckIcon className="size-4 shrink-0 text-bone" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="lg:col-span-6"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.35 }}
        >
          <HeroStage screens={screens} />
        </motion.div>
      </div>
    </section>
  );
}

/* =============================================================== specs */

/*
 * A figure that counts up when it comes into view.
 *
 * The real figure is what the server renders, for search engines, and what a
 * reader who asked for less motion sees. The animated copy is reset to zero
 * only while it is still below the fold, so the count is never seen running
 * backwards — and it is hidden from screen readers, which get the real figure
 * beside it and never hear "0+ projects". Only a plain number with a suffix
 * counts ('60+', '50%', '3'); a range like '1–3' is shown as it is.
 */
function Count({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const match = /^(\d+)(\D*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match?.[2] ?? '';
  const mv = useMotionValue(target);
  const shown = useTransform(mv, (n) => `${Math.round(n)}${suffix}`);
  const armed = useRef(false);
  const countable = !!match && !reduce;

  useEffect(() => {
    const el = ref.current;
    if (!countable || !el || el.getBoundingClientRect().top <= window.innerHeight) return;
    mv.set(0);
    armed.current = true;
    // asked once, on mount: does the figure start below the fold?
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!seen || !armed.current) return;
    armed.current = false;
    const controls = animate(mv, target, { duration: 1.6, ease: EASE });
    return () => controls.stop();
  }, [seen, mv, target]);

  if (!match) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <motion.span aria-hidden>{shown}</motion.span>
    </span>
  );
}

export function Specs({ label, items }: { label: string; items: readonly { value: string; label: string }[] }) {
  return (
    <section data-tone="dark" aria-labelledby="specs-title" className="bg-black pb-24 text-bone md:pb-32">
      <h2 id="specs-title" className="sr-only">
        {label}
      </h2>
      <div className="hall">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-seam pt-12 md:pt-16 lg:grid-cols-4 lg:gap-x-10">
          {items.map((item, i) => (
            <li key={item.label}>
              <Reveal delay={i * 0.08}>
                <p className={`${display} text-[clamp(3rem,6vw,5.25rem)] leading-none tabular-nums`}>
                  <Count value={item.value} />
                </p>
                <p className="mt-3 max-w-[18ch] text-[0.9375rem] leading-snug text-bone-2 md:text-[1.0625rem]">{item.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* =============================================================== steps */

/* How a project starts, in three steps, none of which costs anything until the draft is liked. */
export function Steps({
  title,
  steps,
  cta,
  ctaHref,
}: {
  title: string;
  steps: readonly string[];
  cta: string;
  ctaHref: string;
}) {
  return (
    <section data-tone="dark" data-doors aria-labelledby="steps-title" className="bg-wall-2 py-24 text-bone md:py-36">
      <div className="hall">
        <Reveal>
          <h2 id="steps-title" className={`${display} max-w-[18ch] text-[clamp(2.5rem,5.4vw,5rem)] leading-[1.02]`}>
            {title}
          </h2>
        </Reveal>
        <ol className="mt-12 border-t border-seam md:mt-20 md:grid md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="border-b border-seam md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0">
              <Reveal delay={i * 0.1} className="flex gap-5 py-7 md:block md:py-10">
                <span
                  aria-hidden
                  className="font-display w-7 shrink-0 pt-1.5 text-[0.9375rem] font-medium text-bone-3 tabular-nums md:block md:w-auto md:pt-0 md:text-[3.5rem] md:leading-none md:font-semibold md:tracking-[-0.045em]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className={`${display} text-[clamp(1.625rem,2.6vw,2.5rem)] leading-[1.08] md:mt-8`}>{step}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal className="mt-12 md:mt-16">
          <Link href={ctaHref} className={`${primary()} max-sm:w-full`}>
            {cta}
            <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
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
  result: string;
  /** «Было → стало»: the owner's own words, or a bracketed placeholder until he writes them. */
  before: string;
  after: string;
  host: string | null;
  liveUrl: string | null;
  /** The case page; null for a site shown here without one. */
  href: string | null;
  desktop: Capture | null;
  shot: string;
  phone: Capture | null;
  /** Tiny inlined previews, shown until the real captures arrive. */
  blur?: string;
  phoneBlur?: string;
};

function Device({ work }: { work: ShowWork }) {
  return (
    <div className="relative pb-[9%]">
      <div className="overflow-hidden rounded-[14px] bg-[#1c1c1e] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10 md:rounded-[18px]">
        <div className="flex h-8 items-center gap-1.5 border-b border-white/5 px-3.5 md:h-9 md:gap-2 md:px-4">
          <span className="size-2.5 rounded-full bg-white/15 md:size-3" />
          <span className="size-2.5 rounded-full bg-white/15 md:size-3" />
          <span className="size-2.5 rounded-full bg-white/15 md:size-3" />
          <span className="mx-auto max-w-[60%] truncate rounded-md bg-white/[0.06] px-6 py-0.5 text-[0.6875rem] text-white/60 md:px-10 md:py-1 md:text-xs">
            {work.host ?? work.title}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0b0b0c]">
          <Image
            src={work.desktop?.src ?? work.shot}
            alt={work.title}
            fill
            sizes="(min-width: 768px) 58vw, 100vw"
            // the captures are already sized and compressed: served as they are, straight from the CDN
            unoptimized={!!work.desktop}
            placeholder={work.blur ? 'blur' : 'empty'}
            blurDataURL={work.blur}
            className={`object-cover object-top ${work.desktop ? 'screen-drift' : ''}`}
          />
        </div>
      </div>
      {work.phone && (
        <div className="absolute right-[-2%] bottom-0 w-[24%] min-w-[96px] rounded-[clamp(16px,2.6vw,34px)] bg-[#0b0b0c] p-[clamp(4px,0.6vw,8px)] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.85)] ring-1 ring-white/15">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[clamp(12px,2.1vw,28px)] bg-black">
            <Image
              src={work.phone.src}
              alt=""
              fill
              sizes="20vw"
              unoptimized
              placeholder={work.phoneBlur ? 'blur' : 'empty'}
              blurDataURL={work.phoneBlur}
              className="screen-drift object-cover object-top"
            />
            <span className="absolute top-[2.2%] left-1/2 h-[3.2%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * «Было → стало». Until the owner writes the real words, the bracketed
 * placeholder is shown in a dashed frame — visibly unfinished, so nobody reads
 * it as a claimed result.
 */
function BeforeAfter({ before, after, labels }: { before: string; after: string; labels: { before: string; after: string } }) {
  const draft = (text: string) => isPlaceholder(text);
  return (
    <dl className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
      <div
        data-placeholder={draft(before) || undefined}
        className={`rounded-[16px] p-5 ${draft(before) ? 'border border-dashed border-seam-2' : 'bg-wall-2'}`}
      >
        <dt className="text-[0.8125rem] font-medium tracking-[0.08em] text-bone-3 uppercase">{labels.before}</dt>
        <dd className="mt-2 text-[1rem] leading-snug text-bone-2">{before}</dd>
      </div>
      <div
        data-placeholder={draft(after) || undefined}
        className={`rounded-[16px] p-5 ${draft(after) ? 'border border-dashed border-seam-2' : 'bg-wall-3 ring-1 ring-seam'}`}
      >
        <dt className="flex items-center gap-2 text-[0.8125rem] font-medium tracking-[0.08em] text-bone uppercase">
          <ArrowIcon className="size-3.5" />
          {labels.after}
        </dt>
        <dd className={`mt-2 text-[1rem] leading-snug ${draft(after) ? 'text-bone-2' : 'font-semibold text-bone'}`}>{after}</dd>
      </div>
    </dl>
  );
}

export function Works({
  id,
  title,
  sub,
  all,
  allHref,
  labels,
  openSite,
  details,
  works,
}: {
  id: string;
  title: string;
  sub: string;
  all: string;
  allHref: string;
  labels: { year: string; before: string; after: string };
  openSite: string;
  details: string;
  works: ShowWork[];
}) {
  return (
    <section id={id} data-tone="dark" aria-labelledby="work-title" className="scroll-mt-16 bg-black py-24 text-bone md:py-36">
      <div className="hall">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="work-title" className={`${display} text-[clamp(2.75rem,6vw,5.5rem)] leading-none`}>
            {title}
          </h2>
          <p className="max-w-sm text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug text-bone-2 md:text-right">{sub}</p>
        </Reveal>

        <div className="mt-14 md:mt-20">
          {works.map((work, i) => (
            <article key={work.slug} className="grid items-center gap-10 border-t border-seam py-14 md:grid-cols-12 md:gap-12 md:py-24">
              <Reveal className={`md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
                <Device work={work} />
              </Reveal>
              <Reveal delay={0.12} className={`md:col-span-5 ${i % 2 ? 'md:order-1 md:pr-6' : 'md:pl-6'}`}>
                <p className="text-[0.9375rem] text-bone-2">
                  <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {work.kind && (
                    <>
                      <span className="mx-2.5 text-bone-3">·</span>
                      {work.kind}
                    </>
                  )}
                  {work.year && (
                    <>
                      <span className="mx-2.5 text-bone-3">·</span>
                      <span className="sr-only">{labels.year} </span>
                      <span className="tabular-nums">{work.year}</span>
                    </>
                  )}
                </p>
                <h3 className={`${display} mt-3 text-[clamp(2.5rem,4.4vw,4rem)] leading-none [overflow-wrap:anywhere]`}>{work.title}</h3>
                <p className="mt-5 text-[1.0625rem] leading-relaxed text-bone-2">{work.result}</p>
                <BeforeAfter before={work.before} after={work.after} labels={labels} />
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                  {work.liveUrl && (
                    <a href={work.liveUrl} target="_blank" rel="noopener noreferrer" className={secondary('sm')}>
                      {openSite}
                      <ArrowIcon className="size-3.5 -rotate-45" />
                    </a>
                  )}
                  {work.href && (
                    <Link href={work.href} className={textLink('sm')}>
                      {details}
                      <ChevronIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </Reveal>
            </article>
          ))}
        </div>

        <Reveal className="mt-4 flex justify-center border-t border-seam pt-14">
          <Link href={allHref} className={secondary()}>
            {all}
            <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================================== who it is not for */

/*
 * Said plainly, with his face next to it: he is not the cheap option, and the
 * people who want the other kind of site are welcome to talk.
 */
export function NotFor({
  eyebrow,
  title,
  line,
  accent,
  cta,
  ctaHref,
  more,
  moreHref,
  photo,
  alt,
}: {
  eyebrow: string;
  title: string;
  line: string;
  /** The sentence lifted to white and bold. */
  accent: string;
  cta: string;
  ctaHref: string;
  more: string;
  moreHref: string;
  photo: string;
  alt: string;
}) {
  return (
    <section data-tone="dark" data-doors aria-labelledby="notfor-title" className="bg-wall-2 py-24 text-bone md:py-36">
      <div className="hall grid items-center gap-10 md:grid-cols-12 md:gap-12">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-wall-3 md:aspect-[4/5] md:rounded-[28px]">
            <Image src={photo} alt={alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-[70%_38%]" />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-7 md:pl-4 lg:pl-12">
          <p className="text-[1.0625rem] font-medium text-bone-2">{eyebrow}</p>
          <h2 id="notfor-title" className={`${display} mt-3 text-[clamp(2.5rem,5.6vw,5.25rem)] leading-[1.0]`}>
            {title}
          </h2>
          <p className="mt-7 max-w-[36rem] text-[clamp(1.125rem,1.8vw,1.5rem)] leading-snug text-bone-2">
            {line} <strong className="font-semibold text-bone">{accent}</strong>
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Link href={ctaHref} className={primary()}>
              {cta}
              <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link href={moreHref} className={`${textLink()} max-sm:justify-center`}>
              {more}
              <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================== voices */

export type Voice = {
  id: string;
  text: string;
  name: string;
  /**
   * The client's business — company and role — set right under the name; a
   * bracketed placeholder while the review in the admin has neither.
   */
  business: string;
  lang: string;
  /** A screenshot of the chat, when the owner has added one in lib/content/review-shots.ts. */
  shot: string | null;
};

export function Voices({
  title,
  voices,
  prev,
  next,
  all,
  allHref,
  shotCaption,
}: {
  title: string;
  voices: Voice[];
  prev: string;
  next: string;
  all: string;
  allHref: string;
  shotCaption: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  if (voices.length === 0) return null;
  const v = voices[index];
  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + voices.length) % voices.length);
  };
  const shift = reduce ? 0 : 40;
  // read by the leaving review too, so it slides out the way the visitor is going, not the way it came in
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d * shift }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: -d * shift }),
  };
  const control =
    'grid size-12 place-items-center rounded-full bg-bone/[0.08] text-bone ring-1 ring-seam transition-[background-color,scale] duration-200 hover:bg-bone/[0.16] active:scale-95';

  return (
    <section data-tone="dark" aria-labelledby="voices-title" className="bg-black py-24 text-bone md:py-36">
      <div className="hall">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="voices-title" className={`${display} text-[clamp(2.5rem,5vw,4.5rem)] leading-none`}>
            {title}
          </h2>
          <Link href={allHref} className={`${textLink()} self-start md:self-auto`}>
            {all}
            <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="relative mt-12 min-h-[16rem] border-t border-seam pt-12 md:mt-16 md:pt-16" aria-live="polite">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={index}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: EASE }}
              className="grid gap-10 md:grid-cols-12 md:gap-12"
            >
              {/* the figure holds only the quote and its caption, so the name and business label the quote */}
              <figure className={v.shot ? 'md:col-span-7' : 'md:col-span-10'}>
                <blockquote lang={v.lang} className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.025em] text-balance">
                  {v.lang === 'ru' ? `«${v.text}»` : `“${v.text}”`}
                </blockquote>
                <figcaption className="mt-8">
                  <span className="font-display block text-[1.25rem] font-semibold tracking-[-0.02em] text-bone">{v.name}</span>
                  {isPlaceholder(v.business) ? (
                    <span data-placeholder className="mt-2 inline-block rounded-md border border-dashed border-seam-2 px-2.5 py-1 text-[0.9375rem] text-bone-3">
                      {v.business}
                    </span>
                  ) : (
                    <span className="mt-1 block text-[1rem] text-bone-2">{v.business}</span>
                  )}
                </figcaption>
              </figure>
              {v.shot && (
                <div className="md:col-span-4 md:col-start-9">
                  {/* a plain img: the screenshot is whatever size the phone made it */}
                  <img
                    src={v.shot}
                    alt={`${shotCaption} — ${v.name}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full max-w-sm rounded-[18px] ring-1 ring-seam"
                  />
                  <p className="mt-3 text-[0.875rem] text-bone-3">{shotCaption}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {voices.length > 1 && (
          <div className="mt-12 flex items-center gap-6">
            <button type="button" onClick={() => go(-1)} aria-label={prev} className={control}>
              <ChevronIcon className="size-4 rotate-180" />
            </button>
            <div className="flex gap-2" aria-hidden>
              {voices.map((voice, i) => (
                <span key={voice.id} className={`h-2 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-bone' : 'w-2 bg-bone/30'}`} />
              ))}
            </div>
            <button type="button" onClick={() => go(1)} aria-label={next} className={control}>
              <ChevronIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================== prices */

export type PriceRow = { slug: string; title: string; term: string | null; price: string; href: string };

/* A few of the real starting prices, after the work and the reviews have made the case. */
export function Prices({
  title,
  sub,
  rows,
  all,
  allHref,
}: {
  title: string;
  sub: string;
  rows: PriceRow[];
  all: string;
  allHref: string;
}) {
  if (rows.length === 0) return null;
  // under the heading on a desk screen, under the list on a phone
  const allLink = (where: string) => (
    <div className={where}>
      <Link href={allHref} className={textLink()}>
        {all}
        <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
  return (
    <section data-tone="dark" aria-labelledby="prices-title" className="bg-wall-2 py-24 text-bone md:py-36">
      <div className="hall grid gap-10 md:grid-cols-12 md:gap-12">
        <Reveal className="md:col-span-4">
          <h2 id="prices-title" className={`${display} text-[clamp(2.5rem,5vw,4.5rem)] leading-none`}>
            {title}
          </h2>
          <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-bone-2">{sub}</p>
          {allLink('mt-6 hidden md:block')}
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-8">
          <ul className="border-t border-seam">
            {rows.map((row) => (
              <li key={row.slug} className="border-b border-seam">
                <Link href={row.href} className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 md:py-6">
                  <span className="font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-semibold tracking-[-0.02em] decoration-1 underline-offset-[0.2em] group-hover:underline">
                    {row.title}
                  </span>
                  <span className="text-right text-[1.0625rem] text-bone tabular-nums md:text-lg">{row.price}</span>
                  {row.term && <span className="col-span-2 text-[0.875rem] text-bone-3">{row.term}</span>}
                </Link>
              </li>
            ))}
          </ul>
          {allLink('mt-6 md:hidden')}
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================== finale */

/*
 * The last screen of the home and of every inner page: for the visitor who
 * still does not know what they need. One blue button; WhatsApp and Telegram
 * beside it are quiet outlines, so they never pull harder than the request.
 */
export function Finale({
  title,
  sub,
  cta,
  ctaHref,
  or,
  whatsapp,
  whatsappHref,
  telegram,
  telegramHref,
  links,
}: {
  title: string;
  sub: string;
  cta: string;
  ctaHref: string;
  /** The line over the direct channels. */
  or: string;
  whatsapp: string;
  whatsappHref: string;
  telegram: string;
  telegramHref: string;
  links: { label: string; href: string }[];
}) {
  return (
    <section data-tone="dark" data-doors aria-labelledby="final-title" className="bg-black py-28 text-center text-bone md:py-44">
      <div className="hall">
        <Reveal>
          <h2 id="final-title" className={`${display} mx-auto max-w-[17ch] text-[clamp(2.25rem,5.6vw,5.5rem)] leading-[1.02]`}>
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-bone-2">{sub}</p>
        </Reveal>
        <Reveal delay={0.12} className="mt-10 flex justify-center">
          <Link href={ctaHref} className={`${primary('lg')} max-sm:w-full`}>
            {cta}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Reveal delay={0.22} className="mx-auto mt-14 max-w-xl border-t border-seam pt-10">
          <p className="text-[0.9375rem] text-bone-2">{or}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={secondary()}>
              <WhatsAppIcon className="size-[1.125rem]" />
              {whatsapp}
            </a>
            <a href={telegramHref} target="_blank" rel="noopener noreferrer" className={secondary()}>
              <TelegramIcon className="size-[1.125rem]" />
              {telegram}
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-1 text-[0.9375rem] text-bone-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-11 items-center underline-offset-[0.3em] transition-colors hover:text-bone hover:underline"
                >
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

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { EASE } from '@/components/site/Reveal';
import { STAGE_HOVER, type StageColours } from '@/components/stage/ColourStage';

export type RibbonWork = { slug: string; title: string; host: string; image: string; href: string; colour: StageColours };

/*
 * The first screen: who, what, one button — and the work itself, straight
 * away, running past as a ribbon of browser windows. Pointing at one hands
 * the whole page its colour.
 */
export function StageHero({
  eyebrow,
  title,
  script,
  note,
  cta,
  ctaHref,
  whatsapp,
  whatsappHref,
  hint,
  scrollHint,
  works,
  neutral,
}: {
  eyebrow: string;
  title: readonly string[];
  script: string;
  note: string;
  cta: string;
  ctaHref: string;
  whatsapp: string;
  whatsappHref: string;
  hint: string;
  scrollHint: string;
  works: RibbonWork[];
  neutral: StageColours;
}) {
  const reduce = useReducedMotion();
  const hover = (colour: StageColours | null) => window.dispatchEvent(new CustomEvent(STAGE_HOVER, { detail: colour }));
  const loop = [...works, ...works];

  return (
    <section
      data-stage
      data-tone="stage"
      data-bg={neutral.bg}
      data-ink={neutral.ink}
      data-accent={neutral.accent}
      data-dark={neutral.dark ? '1' : '0'}
      aria-labelledby="stage-title"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-24 pb-8 md:pt-28 md:pb-10"
    >
      <div className="hall">
        <motion.p
          className="text-sm font-light text-bone-2"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          {eyebrow}
        </motion.p>

        <div className="mt-6 grid gap-10 md:mt-8 md:grid-cols-12 md:items-end">
          <h1 id="stage-title" className="stage-title text-[clamp(3rem,7.4vw,7.75rem)] md:col-span-9">
            {title.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: '105%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.15 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            className="md:col-span-3 md:pb-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.55 }}
          >
            <p className="hand -rotate-2 text-2xl text-bone">{script}</p>
            <p className="wall-note mt-3">{note}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href={ctaHref} className="btn-bone group">
                {cta}
                <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex items-center gap-2 text-sm">
                <WhatsAppIcon className="size-4" />
                {whatsapp}
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* The work, running past. */}
      <motion.div
        className="mt-14 md:mt-16"
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.7 }}
      >
        <div className="group/ribbon overflow-hidden" onMouseLeave={() => hover(null)}>
          <ul className="run-left flex w-max gap-4 px-2 group-hover/ribbon:[animation-play-state:paused] md:gap-6" style={{ ['--run' as string]: '60s' }}>
            {loop.map((work, i) => (
              <li key={`${work.slug}-${i}`} aria-hidden={i >= works.length} className="w-[72vw] shrink-0 sm:w-[44vw] md:w-[30vw] lg:w-[24vw]">
                <Link
                  href={work.href}
                  tabIndex={i >= works.length ? -1 : 0}
                  onMouseEnter={() => hover(work.colour)}
                  onFocus={() => hover(work.colour)}
                  onBlur={() => hover(null)}
                  className="group block overflow-hidden rounded-[14px] bg-wall-2 shadow-[0_30px_60px_-34px_rgb(0_0_0/0.45)] ring-1 ring-seam transition-transform duration-700 ease-[var(--ease-gallery)] hover:-translate-y-2"
                >
                  <span className="flex h-7 items-center gap-1.5 px-3" style={{ background: work.colour.bg }}>
                    <span className="size-2 rounded-full bg-current opacity-30" style={{ color: work.colour.ink }} />
                    <span className="size-2 rounded-full bg-current opacity-30" style={{ color: work.colour.ink }} />
                    <span className="size-2 rounded-full bg-current opacity-30" style={{ color: work.colour.ink }} />
                    <span className="ml-2 truncate text-[0.6875rem] font-light opacity-70" style={{ color: work.colour.ink }}>
                      {work.host}
                    </span>
                  </span>
                  <span className="relative block aspect-[16/10] overflow-hidden">
                    <Image
                      src={work.image}
                      alt={work.title}
                      fill
                      sizes="(min-width: 1024px) 26vw, (min-width: 768px) 30vw, 72vw"
                      className="object-cover object-top transition-transform duration-[1400ms] ease-[var(--ease-gallery)] group-hover:scale-[1.03]"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="hall mt-5 flex items-center justify-between gap-6 text-xs font-light text-bone-2">
          <span className="hidden md:block">{hint}</span>
          <span className="inline-flex items-center gap-2">
            {scrollHint}
            <ArrowIcon className="size-3 rotate-90" />
          </span>
        </div>
      </motion.div>
    </section>
  );
}

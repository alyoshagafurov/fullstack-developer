'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';
import { EASE, Rise, Words } from '@/components/site/Reveal';
import type { StageColours } from '@/components/stage/ColourStage';

/*
 * The rooms after the work: what you need, who builds it. Each one is a
 * stage section too, so the page keeps changing colour as it is read.
 */

function stageProps(c: StageColours) {
  return {
    'data-stage': '',
    'data-tone': 'stage',
    'data-bg': c.bg,
    'data-ink': c.ink,
    'data-accent': c.accent,
    'data-dark': c.dark ? '1' : '0',
  };
}

/* ------------------------------------------------------------ directions */

export type Way = { key: string; word: string; script: string; price: string | null; href: string };

export function Directions({
  title,
  note,
  from,
  ways,
  colour,
}: {
  title: string;
  note: string;
  from: string;
  ways: Way[];
  colour: StageColours;
}) {
  return (
    <section {...stageProps(colour)} aria-labelledby="ways-title" className="py-28 md:py-40">
      <div className="hall">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Words id="ways-title" text={title} className="stage-title text-[clamp(2.75rem,6vw,5.5rem)]" />
          <Rise className="md:pb-2">
            <p className="wall-note md:text-right">{note}</p>
          </Rise>
        </div>

        <div className="mt-14 border-t border-seam md:mt-20">
          {ways.map((way, i) => (
            <Rise key={way.key} delay={i * 0.06}>
              <Link
                href={way.href}
                className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-seam py-6 md:grid-cols-12 md:py-8"
              >
                <span className="stage-title text-[clamp(2.25rem,6.4vw,6rem)] transition-transform duration-700 ease-[var(--ease-gallery)] group-hover:translate-x-3 md:col-span-7">
                  {way.word}
                </span>
                <span className="hidden md:col-span-3 md:block">
                  <span className="hand block text-xl text-bone-2">{way.script}</span>
                </span>
                <span className="flex items-center justify-end gap-4 md:col-span-2">
                  {way.price && (
                    <span className="hidden text-sm font-light whitespace-nowrap text-bone-2 sm:inline">
                      {from} {way.price.replace(/^(от|from)\s+/i, '')}
                    </span>
                  )}
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-seam-2 transition-all duration-500 group-hover:border-bone group-hover:bg-bone group-hover:text-wall">
                    <ArrowIcon className="transition-transform duration-500 group-hover:-rotate-45" />
                  </span>
                </span>
              </Link>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- him */

export type Voice = { text: string; name: string; role: string | null; lang: string };

export function Person({
  title,
  hand,
  note,
  count,
  countLabel,
  more,
  moreHref,
  photo,
  photoAlt,
  voices,
  prev,
  next,
  colour,
}: {
  title: string;
  hand: string;
  note: string;
  count: string;
  countLabel: string;
  more: string;
  moreHref: string;
  photo: string;
  photoAlt: string;
  voices: Voice[];
  prev: string;
  next: string;
  colour: StageColours;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const voice = voices[index];
  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + voices.length) % voices.length);
  };

  return (
    <section {...stageProps(colour)} aria-labelledby="person-title" className="py-28 md:py-40">
      <div className="hall grid gap-14 md:grid-cols-12 md:gap-10">
        <Rise className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
            <Image src={photo} alt={photoAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </Rise>

        <div className="flex flex-col justify-between gap-14 md:col-span-6 md:col-start-7">
          <div>
            <Rise>
              <p className="hand -rotate-2 text-2xl text-bone-2">{hand}</p>
            </Rise>
            <Words id="person-title" text={title} className="stage-title mt-3 text-[clamp(2.75rem,5.6vw,5.25rem)]" />
            <Rise delay={0.15} className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-6">
              <p className="wall-note">{note}</p>
              <p>
                <span className="stage-title block text-[clamp(3rem,5vw,4.5rem)]">{count}</span>
                <span className="text-sm font-light text-bone-2">{countLabel}</span>
              </p>
            </Rise>
            <Rise delay={0.2}>
              <Link href={moreHref} className="link-more mt-8 text-sm">
                {more}
                <ArrowIcon className="size-3.5" />
              </Link>
            </Rise>
          </div>

          {voice && (
            <div className="border-t border-seam pt-8">
              <div className="relative min-h-[11rem]" aria-live="polite">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.figure
                    key={index}
                    initial={reduce ? false : { opacity: 0, x: dir * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -24 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <blockquote lang={voice.lang} className="text-[clamp(1.125rem,1.7vw,1.5rem)] leading-snug font-light text-pretty">
                      “{voice.text}”
                    </blockquote>
                    <figcaption className="mt-5 text-sm">
                      <span className="font-semibold">{voice.name}</span>
                      {voice.role && <span className="font-light text-bone-2"> · {voice.role}</span>}
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>
              </div>
              {voices.length > 1 && (
                <div className="mt-6 flex items-center gap-3">
                  <button type="button" onClick={() => go(-1)} aria-label={prev} className="grid size-11 place-items-center rounded-full border border-seam-2 transition-colors hover:border-bone">
                    <ArrowIcon className="rotate-180" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={next} className="grid size-11 place-items-center rounded-full bg-bone text-wall transition-transform hover:-translate-y-0.5">
                    <ArrowIcon />
                  </button>
                  <span className="ml-2 text-xs font-light tabular-nums text-bone-2">
                    {index + 1} / {voices.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

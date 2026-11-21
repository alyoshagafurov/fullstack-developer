'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export type Voice = {
  id: string;
  lead: string;
  rest: string;
  name: string;
  who: string | null;
  /** The language the review was written in, so a screen reader reads it right. */
  lang?: string;
};

const HOLD_MS = 7000;

/*
 * One voice at a time, set as large as a headline: the first sentence of a
 * real review, unedited. The rest of the review, the name and who they are
 * wait in the corner for whoever wants them. The voices change on their own
 * and stop changing while someone is reading (hover or focus).
 */
export function Voices({
  title,
  note,
  allLabel,
  allHref,
  items,
}: {
  title: string;
  note: string;
  allLabel: string;
  allHref: string;
  items: Voice[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const voice = items[index];

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, reduce, items.length]);

  if (!voice) return null;

  return (
    <section
      className="relative overflow-hidden bg-wall-2 py-28 md:py-40"
      aria-labelledby="voices-title"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hall">
        {/* The quote itself is the hall's headline; the name of the hall is for screen readers. */}
        <h2 id="voices-title" className="sr-only">
          {title}
        </h2>

        <div className="relative min-h-[52svh] md:min-h-[46svh]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={voice.id}
              initial={reduce ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-12 lg:grid-cols-12"
            >
              <blockquote lang={voice.lang} className="lg:col-span-9">
                <p className="font-display text-[clamp(1.875rem,4.4vw,4.25rem)] leading-[1.04] font-black text-balance [font-synthesis:none]">
                  <span aria-hidden className="text-brass">“</span>
                  {voice.lead}
                  <span aria-hidden className="text-brass">”</span>
                </p>
              </blockquote>
              <figcaption className="lg:col-span-3 lg:self-end">
                <p className="script -rotate-[3deg] text-[clamp(1.75rem,2.6vw,2.5rem)]">{voice.name}</p>
                {voice.who && <p className="wall-label mt-3">{voice.who}</p>}
                {voice.rest && (
                  <p lang={voice.lang} className="wall-note mt-6">
                    {voice.rest}
                  </p>
                )}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 md:flex-row md:items-center">
          <p className="wall-note">
            {note}{' '}
            <Link href={allHref} className="link-quiet whitespace-nowrap">
              {allLabel} · {items.length}
            </Link>
          </p>
          <span className="hidden flex-1 md:block" />
          <div className="flex gap-1.5" role="tablist" aria-label={title}>
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={item.name}
                onClick={() => setIndex(i)}
                className="group flex h-11 items-center px-0.5 md:px-1"
              >
                <span className="relative block h-px w-6 overflow-hidden bg-seam-2 md:w-12">
                  {i === index && (
                    <motion.span
                      key={`${item.id}-${paused}`}
                      className="absolute inset-y-0 left-0 block bg-brass"
                      initial={{ width: reduce || paused ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: reduce || paused ? 0 : HOLD_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

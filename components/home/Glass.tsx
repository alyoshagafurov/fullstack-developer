'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type GlassVoice = { id: string; text: string; name: string; who: string | null; lang?: string };

/*
 * Reviews on a glass partition. Black-framed glass panels stand in a row in
 * front of a cold-lit wall; the words are written on the glass, the name in
 * warm light under them. Drag the partition sideways (or swipe it) to read
 * the next panel.
 */
export function Glass({
  title,
  note,
  allLabel,
  allHref,
  voices,
}: {
  title: string;
  note: string;
  allLabel: string;
  allHref: string;
  voices: GlassVoice[];
}) {
  const reduce = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!viewport.current || !track.current) return;
      setLimit(Math.max(0, track.current.scrollWidth - viewport.current.clientWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [voices.length]);

  if (voices.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden py-28 md:py-40" aria-labelledby="glass-title">
      {/* The cold wall behind the glass. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-wall">
        <div className="absolute inset-x-0 top-[30%] bottom-[8%] bg-[radial-gradient(ellipse_60%_70%_at_70%_60%,rgb(45_77_255/0.28),transparent_70%)]" />
        <div className="led-cobalt absolute inset-x-[10%] bottom-[8%] h-px opacity-60" />
      </div>

      <div className="hall flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="glass-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{title}</span>
          </span>
        </h2>
        <p className="wall-note md:mb-3 md:text-right">
          {note}{' '}
          <Link href={allHref} className="link-quiet whitespace-nowrap">
            {allLabel} · {voices.length}
          </Link>
        </p>
      </div>

      <div ref={viewport} className="mt-14 cursor-grab overflow-hidden active:cursor-grabbing md:mt-20">
        <motion.ul
          ref={track}
          drag={reduce ? false : 'x'}
          dragConstraints={{ left: -limit, right: 0 }}
          dragElastic={0.08}
          className="flex w-max items-stretch gap-3 px-5 md:gap-4 md:px-10 xl:px-[4.5rem]"
        >
          {voices.map((voice) => (
            <li
              key={voice.id}
              className="relative flex min-h-[56svh] w-[82vw] flex-col justify-between gap-10 border-[6px] border-black bg-[linear-gradient(115deg,rgb(255_255_255/0.07),rgb(255_255_255/0.015)_38%,rgb(255_255_255/0.05)_62%,rgb(255_255_255/0.01))] p-7 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] backdrop-blur-[3px] select-none sm:w-[56vw] md:p-10 lg:w-[30vw]"
            >
              {/* A reflection running across the glass. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-[18%] w-[22%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.05),transparent)]"
              />
              <p lang={voice.lang} className="relative text-[1.0625rem] leading-relaxed font-light text-bone md:text-lg">
                {voice.text}
              </p>
              <div className="relative">
                <p className="script -rotate-[2deg] text-[1.875rem]">{voice.name}</p>
                {voice.who && <p className="wall-label mt-2">{voice.who}</p>}
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

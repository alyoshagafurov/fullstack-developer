'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/museum/Icons';

export type Highlight = { id: string; text: string; name: string; who: string | null; lang?: string };

const HOLD_MS = 6000;

/*
 * Reviews as Apple's "Get the highlights" carousel: one card in the middle of
 * the screen, its neighbours peeking at the sides, a pill of dots and a
 * play/pause button underneath. It moves on by itself and stops when paused
 * or when the visitor swipes.
 */
export function Highlights({
  title,
  allLabel,
  allHref,
  items,
}: {
  title: string;
  allLabel: string;
  allHref: string;
  items: Highlight[];
}) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const go = (i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined;
    if (!el || !track.current) return;
    track.current.scrollTo({
      left: el.offsetLeft - (track.current.clientWidth - el.clientWidth) / 2,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const middle = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let distance = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - middle);
        if (d < distance) {
          distance = d;
          best = i;
        }
      });
      setIndex(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!playing || items.length < 2) return;
    const timer = window.setTimeout(() => go((index + 1) % items.length), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, playing, items.length]);

  if (items.length === 0) return null;

  return (
    <section className="overflow-hidden bg-wall py-20 md:py-28" aria-labelledby="highlights-title">
      <div className="hall flex flex-col items-center text-center">
        <h2 id="highlights-title" className="hall-title">
          {title}
        </h2>
        <Link href={allHref} className="link-more mt-5">
          {allLabel} <ChevronIcon />
        </Link>
      </div>

      <ul
        ref={track}
        data-gallery-track
        onPointerDown={() => setPlaying(false)}
        className="mt-12 flex gap-4 px-[8vw] md:px-[18vw]"
      >
        {items.map((item) => (
          <li key={item.id} className="w-[84vw] shrink-0 md:w-[64vw] lg:w-[52vw]">
            <figure className="tile flex h-full min-h-[22rem] flex-col justify-between p-8 md:min-h-[26rem] md:p-12">
              <blockquote lang={item.lang} className="text-[clamp(1.25rem,2.2vw,1.875rem)] leading-snug font-semibold tracking-tight">
                “{item.text}”
              </blockquote>
              <figcaption className="mt-8">
                <p className="text-base font-semibold">{item.name}</p>
                {item.who && <p className="mt-1 text-sm text-bone-2">{item.who}</p>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="flex h-12 items-center gap-2.5 rounded-full bg-wall-3 px-5" role="tablist" aria-label={title}>
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.name}
              onClick={() => {
                setPlaying(false);
                go(i);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index ? 'w-8 bg-bone' : 'w-2 bg-bone-3/70 hover:bg-bone-2'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause' : 'Play'}
          className="inline-flex size-12 items-center justify-center rounded-full bg-wall-3 text-bone"
        >
          {playing ? (
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden>
              <rect x="2" y="1.5" width="2.6" height="9" rx="0.8" />
              <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden>
              <path d="M3 1.8v8.4c0 .5.5.8.9.5l6.6-4.2a.6.6 0 0 0 0-1L3.9 1.3c-.4-.3-.9 0-.9.5Z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StudioObject } from '@/components/ui/StudioObject';
import { GhostMark } from '@/components/ui/Logo';

/*
 * The vitrine — the signature of the site.
 *
 * The work is displayed the way an expensive shop displays goods: objects under
 * studio light, the wordmark enormous and faint behind them, one caption at a
 * time underneath.
 *
 * It is a real horizontal scroller, not a slideshow pretending to be one. The
 * track is an `overflow-x` container with scroll snapping, so a two-finger
 * sideways swipe on a trackpad, a shift-wheel, a phone swipe and the arrow
 * buttons all do the same native thing, with the browser's own inertia. The
 * previous version simulated this with pointer maths and had to be labelled
 * «тяните вбок» before anyone realised it moved at all; a track that shows the
 * next object half in frame needs no label.
 *
 * Two rules this file must keep:
 *
 *  - nothing between a `StudioObject` and the band may create a stacking
 *    context (no z-index, transform, opacity or filter on the track or the
 *    slides). The objects are blended with `darken`, and a stacking context
 *    would have them blend against their own empty inside, which renders as
 *    nothing at all.
 *  - the section grows past one screen rather than clipping. It used to be a
 *    fixed `100svh` with `overflow-hidden`, which sheared the caption off on a
 *    short window.
 */

export type VitrineItem = {
  id: string;
  /** Cases take over the vitrine as soon as the owner publishes one. */
  kind: 'case' | 'service';
  title: string;
  caption: string;
  object: string;
  href: string;
  ctaLabel: string;
};

export function Vitrine({ items }: { items: VitrineItem[] }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLLIElement | null)[]>([]);

  const count = items.length;

  /** Scroll so that slide `i` lands in the middle of the track. */
  const scrollTo = useCallback((i: number) => {
    const el = slides.current[i];
    const box = track.current;
    if (!el || !box) return;
    box.scrollTo({
      left: el.offsetLeft - (box.clientWidth - el.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, []);

  const go = useCallback(
    (delta: number) => scrollTo(Math.min(count - 1, Math.max(0, index + delta))),
    [count, index, scrollTo],
  );

  /*
   * The caption follows the track rather than driving it: whichever slide is
   * most visible inside it wins, and that covers the swipe, the wheel, the
   * buttons and the keyboard without any of them having to report anything.
   *
   * An observer rather than a scroll listener on purpose. A listener has to be
   * told, and it is not told when the browser re-snaps the track itself — after
   * the images decode, or after a resize — which is exactly when the caption
   * and the object on screen drift apart. The observer sees the result instead
   * of the cause, and it fires once on mount, so the first caption is right
   * whatever the track settles on.
   */
  useEffect(() => {
    const box = track.current;
    if (!box) return;

    /*
     * The observer says when to look; the geometry says at what. Ratios alone
     * are not enough — a wide window can hold three whole objects at once, and
     * all three would report a ratio of one.
     */
    const observer = new IntersectionObserver(
      () => {
        const middle = box.getBoundingClientRect().left + box.clientWidth / 2;
        let best = 0;
        let bestGap = Infinity;
        slides.current.forEach((el, i) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const gap = Math.abs(rect.left + rect.width / 2 - middle);
          if (gap < bestGap) {
            bestGap = gap;
            best = i;
          }
        });
        setIndex(best);
      },
      { root: box, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    slides.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  };

  // A single item is a still life, not a scroller: no counter, no arrows.
  const interactive = count > 1;
  const current = items[index] ?? items[0];
  if (!current) return null;

  return (
    <section
      data-tone="light"
      className="stage relative flex min-h-[100svh] flex-col justify-between overflow-x-clip bg-ground pt-24 pb-6 md:pt-28"
      aria-roledescription={interactive ? 'карусель' : undefined}
      aria-label="Витрина работ"
    >
      {/* The wordmark, enormous and faint, is the backdrop of the whole stage. */}
      <GhostMark className="absolute inset-x-0 top-[42%] -translate-y-1/2 px-4 md:px-10" />

      {/*
       * `relative` without a z-index on purpose — see the stacking rule above.
       * Paint order already puts the track over the ghost mark: both are
       * positioned and this one comes later in the markup.
       */}
      <div
        ref={track}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={onKeyDown}
        className="relative flex flex-1 items-center overflow-x-auto overflow-y-hidden overscroll-x-contain py-4 outline-offset-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: interactive ? 'x mandatory' : undefined }}
      >
        <ul className="flex items-center gap-10 px-[max(1.25rem,calc(50vw-min(30svh,300px)))] md:gap-16 md:px-[max(2.5rem,calc(50vw-min(30svh,300px)))]">
          {items.map((item, i) => (
            <li
              key={item.id}
              ref={(el) => {
                slides.current[i] = el;
              }}
              /* The `vw` term is the one that matters on a phone: 52svh alone
                 comes out wider than the screen and cuts the object's edges. */
              className="aspect-square w-[min(52svh,480px,86vw)] shrink-0 md:w-[min(60svh,600px,80vw)]"
              style={{ scrollSnapAlign: 'center' }}
            >
              <StudioObject
                src={item.object}
                alt={item.title}
                priority={i === 0}
                sizes="(min-width: 768px) 600px, 76vw"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Caption and controls. One black pill, everything else hairline. */}
      <div className="shell relative pt-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="label mb-3">{current.kind === 'case' ? 'Работа' : 'Услуга'}</p>
            <h2 aria-live="polite" className="display-3 uppercase">
              {current.title}
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-2 md:text-base">
              {current.caption}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {interactive && (
              <>
                <span className="tabular label mr-1 select-none">
                  {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={index === 0}
                  aria-label="Предыдущая работа"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30"
                >
                  <Arrow direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  disabled={index === count - 1}
                  aria-label="Следующая работа"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30"
                >
                  <Arrow direction="right" />
                </button>
              </>
            )}
            <Link
              href={current.href}
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-[0.8125rem] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-2"
            >
              {current.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
    >
      {direction === 'right' ? (
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
      ) : (
        <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="square" />
      )}
    </svg>
  );
}

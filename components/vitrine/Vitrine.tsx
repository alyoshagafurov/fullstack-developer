'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StudioObject } from '@/components/ui/StudioObject';
import { GhostMark } from '@/components/ui/Logo';

/*
 * The vitrine — the work, shown the way an expensive shop shows goods: one
 * object under studio light, the wordmark enormous and faint behind it.
 *
 * Rebuilt around where the hand is. The controls used to sit along the bottom
 * edge — caption on the left, arrows and the button on the right — which on a
 * phone put everything you could press at the very bottom of the screen, and
 * now the floating request button lives there too. So:
 *   - what the piece is and the button to open it come first, at the top,
 *     where the eye lands after the heading;
 *   - the arrows stand on either side of the object, at mid-height, where a
 *     thumb reaches on both edges of a phone and it is obvious the thing turns;
 *   - the object itself opens the piece on a tap, the way a shop window does;
 *   - dragging, swiping and the arrow keys still switch it.
 * Nothing interactive is left in the strip the floating button covers.
 *
 * No animation library: the whole behaviour is a pointer delta and two CSS
 * transitions. Every object renders at once, stacked, with visibility driven by
 * index — no unmount flicker, and every neighbour is decoded before it is
 * asked for.
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
  /** The word that stands behind this item, enormous and faint, instead of the wordmark. */
  ghost?: string | null;
  /** Set when the words are in a language other than the page's (an untranslated case). */
  lang?: string;
};

export type VitrineCopy = {
  aria: string;
  caseLabel: string;
  serviceLabel: string;
  previous: string;
  next: string;
  allWork: string;
  tapToOpen: string;
};

const SWIPE_THRESHOLD = 56;
/** Under this many pixels a press is a tap — it opens the piece — not a drag. */
const TAP_SLOP = 8;

const ghostOf = (item: VitrineItem) => (item.ghost ?? '').trim();

/*
 * How wide a word will be, without measuring it: set uppercase and tightly
 * tracked, a glyph averages a little under two thirds of the type size. The
 * estimate runs wide on purpose — a word that stops short of the edge reads as
 * intended, one that runs past it reads as broken.
 */
const ghostSize = (word: string) =>
  `min(${(92 / (0.62 * Math.max(word.length, 3))).toFixed(2)}vw, 34svh, 22rem)`;

export function Vitrine({
  items,
  copy,
  allHref,
}: {
  items: VitrineItem[];
  copy: VitrineCopy;
  allHref: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ x: number; id: number } | null>(null);

  const count = items.length;
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  const current = items[index];

  // Arrow keys switch, Enter opens, whenever the stage holds focus.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'Enter' && current) {
      router.push(current.href);
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    pointerStart.current = { x: event.clientX, id: event.pointerId };
    setDragging(true);
    stage.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!pointerStart.current) return;
    setDrag(event.clientX - pointerStart.current.x);
  };

  const endDrag = (event: React.PointerEvent, cancelled = false) => {
    if (!pointerStart.current) return;
    const delta = event.clientX - pointerStart.current.x;
    pointerStart.current = null;
    setDrag(0);
    setDragging(false);
    if (cancelled) return;
    if (Math.abs(delta) > SWIPE_THRESHOLD && count > 1) go(delta < 0 ? 1 : -1);
    else if (Math.abs(delta) < TAP_SLOP && current) router.push(current.href);
  };

  useEffect(() => {
    // Keep the index valid if the list changes under an open page.
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  /*
   * The object answers the reader: it turns toward the pointer while the band
   * is under the hand, and drifts against the scroll. Written as custom
   * properties the object's transform quotes, so the drag and this never fight
   * over one `transform`, and a pointer move never re-renders the vitrine.
   */
  useEffect(() => {
    const el = band.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    const target = { tx: 0, ty: 0, zoom: 1, drift: 0 };
    const eased = { tx: 0, ty: 0, zoom: 1, drift: 0 };
    let frame = 0;

    const draw = () => {
      frame = 0;
      let moving = false;
      (Object.keys(target) as (keyof typeof target)[]).forEach((k) => {
        const step = (target[k] - eased[k]) * 0.09;
        if (Math.abs(step) > 0.0004) moving = true;
        eased[k] += step;
      });
      el.style.setProperty('--tilt-x', `${eased.tx.toFixed(3)}deg`);
      el.style.setProperty('--tilt-y', `${eased.ty.toFixed(3)}deg`);
      el.style.setProperty('--zoom', eased.zoom.toFixed(4));
      el.style.setProperty('--drift', `${eased.drift.toFixed(2)}px`);
      if (moving) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onPointer = (event: PointerEvent) => {
      if (!fine) return;
      const r = el.getBoundingClientRect();
      const inside = event.clientY > r.top && event.clientY < r.bottom;
      const nx = clamp((event.clientX - (r.left + r.width / 2)) / (r.width / 2 || 1));
      const ny = clamp((event.clientY - (r.top + r.height / 2)) / (r.height / 2 || 1));
      target.ty = inside ? nx * 10 : 0;
      target.tx = inside ? ny * -8 : 0;
      target.zoom = inside ? 1.035 : 1;
      wake();
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const middle = r.top + r.height / 2 - window.innerHeight / 2;
      target.drift = clamp(middle / window.innerHeight) * -46;
      wake();
    };

    onScroll();
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
      el.style.removeProperty('--zoom');
      el.style.removeProperty('--drift');
    };
  }, []);

  // A single item is a still life, not a carousel: no counter, no arrows.
  const interactive = count > 1;
  if (!current) return null;

  const arrow =
    'pointer-events-auto absolute top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-paper/80 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper md:size-14';

  return (
    <section
      ref={band}
      data-tone="light"
      className="stage relative flex min-h-[100svh] flex-col overflow-hidden bg-paper pt-24 pb-28 md:pt-28 md:pb-24"
      aria-roledescription={interactive ? 'carousel' : undefined}
      aria-label={copy.aria}
    >
      {/* What this piece is, and the way into it — first, at the top. */}
      <div className="shell relative z-10">
        <div className="flex items-center justify-between gap-6">
          <p className="label">{current.kind === 'case' ? copy.caseLabel : copy.serviceLabel}</p>
          <div className="flex items-center gap-5">
            {interactive && (
              <span className="tabular label select-none" aria-hidden>
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
            )}
            {current.kind === 'case' && (
              <Link
                href={allHref}
                className="label inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {copy.allWork}
              </Link>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="min-w-0" lang={current.lang}>
            <h2 aria-live="polite" className="display-3 uppercase">
              {current.title}
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-2 md:text-base">{current.caption}</p>
          </div>
          <Link
            href={current.href}
            className="inline-flex min-h-12 w-fit shrink-0 items-center gap-3 rounded-full bg-ink px-7 text-[0.875rem] font-semibold tracking-[0.02em] text-paper transition-colors hover:bg-ink-2"
          >
            {current.ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/*
       * The backdrop of the stage: his wordmark by default, or the case's own
       * word. Every word is in the markup from the start and switched by
       * opacity, exactly as the objects are.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[58%] -translate-y-1/2 px-4 select-none md:px-10"
      >
        <GhostMark
          className={`transition-opacity duration-[380ms] ease-[var(--ease-studio)] motion-reduce:transition-none ${
            ghostOf(current) ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {items.map((item, i) => {
          const word = ghostOf(item);
          if (!word) return null;
          const active = i === index;
          return (
            <span
              key={item.id}
              aria-hidden
              className="text-ghost absolute inset-x-0 top-1/2 block px-4 text-center leading-[0.8] font-extrabold tracking-[-0.04em] whitespace-nowrap uppercase transition-[opacity,transform] duration-[380ms] ease-[var(--ease-studio)] motion-reduce:transition-none md:px-10"
              style={{
                fontSize: ghostSize(word),
                opacity: active ? 1 : 0,
                transform: `translate3d(${active ? drag * 0.12 : 0}px, -50%, 0)`,
                transitionDuration: dragging ? '0ms' : undefined,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      <div className="relative flex flex-1 items-center justify-center pt-6">
        {/*
         * `relative` without a z-index on purpose: a z-index would make this a
         * stacking context, and the object's `darken` would blend against its
         * empty inside instead of the band and the ghost mark behind it.
         */}
        <div
          ref={stage}
          role="link"
          tabIndex={0}
          aria-label={`${current.title}. ${copy.tapToOpen}`}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => endDrag(event)}
          onPointerCancel={(event) => endDrag(event, true)}
          className={`relative aspect-square h-[min(48svh,520px)] max-w-[78vw] outline-offset-8 md:h-[min(60svh,660px)] ${
            interactive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          }`}
          style={{ touchAction: 'pan-y' }}
        >
          {items.map((item, i) => {
            const active = i === index;
            return (
              /*
               * Opacity and transform live on the image itself, never on this
               * wrapper: either on a parent creates a stacking context and the
               * object's `darken` would render as nothing at all.
               */
              <div key={item.id} aria-hidden={!active} className="absolute inset-0">
                <StudioObject
                  src={item.object}
                  alt={active ? item.title : ''}
                  priority={i === 0}
                  lift
                  sizes="(min-width: 1024px) 46vw, 78vw"
                  className="transition-[opacity,transform] duration-[380ms] ease-[var(--ease-studio)] motion-reduce:transition-none"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active
                      ? `perspective(1400px) translate3d(${drag * 0.45}px, var(--drift, 0px), 0) rotateY(calc(${drag * -0.03}deg + var(--tilt-y, 0deg))) rotateX(var(--tilt-x, 0deg)) scale(var(--zoom, 1))`
                      : 'perspective(1400px) translate3d(0, 22px, 0)',
                    transitionDuration: dragging ? '0ms' : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* The arrows flank the object, at the height a thumb reaches. */}
        {interactive && (
          <div className="shell pointer-events-none absolute inset-0">
            <div className="relative size-full">
              <button type="button" onClick={() => go(-1)} aria-label={copy.previous} className={`${arrow} left-0`}>
                <Arrow direction="left" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={copy.next} className={`${arrow} right-0`}>
                <Arrow direction="right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      {direction === 'right' ? (
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
      ) : (
        <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="square" />
      )}
    </svg>
  );
}

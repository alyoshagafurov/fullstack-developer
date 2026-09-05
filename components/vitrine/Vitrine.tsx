'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StudioObject } from '@/components/ui/StudioObject';
import { GhostMark } from '@/components/ui/Logo';

/*
 * The vitrine — the signature of the site.
 *
 * The work is displayed the way an expensive shop displays goods: one object
 * under studio light, the wordmark enormous and faint behind it, a row of small
 * pills underneath. Dragging, arrow keys, swiping and the ‹ › buttons all
 * change the object on show. It is the AirPods product switcher turned into an
 * index of what the owner makes.
 *
 * Why no animation library: the whole behaviour is a pointer delta and two CSS
 * transitions. A motion runtime would cost roughly forty kilobytes on the first
 * screen and buy nothing this file does not already do.
 *
 * Every object renders at once, stacked, with visibility driven by index. That
 * costs a little markup and removes the two problems the alternative has: no
 * unmount flicker mid-transition, and every neighbour is decoded before it is
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
};

const SWIPE_THRESHOLD = 56;

export function Vitrine({ items }: { items: VitrineItem[] }) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; id: number } | null>(null);

  const count = items.length;
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  // Arrow keys work whenever the stage holds focus. The stage is focusable, so
  // a keyboard user reaches it by tabbing rather than hunting for the arrow
  // buttons — which are also real buttons, further down.
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

  const endDrag = (event: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const delta = event.clientX - pointerStart.current.x;
    if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1);
    pointerStart.current = null;
    setDrag(0);
    setDragging(false);
  };

  useEffect(() => {
    // Keep the index valid if the owner publishes or unpublishes while a
    // visitor has the page open and it revalidates underneath them.
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  // A single item is a still life, not a carousel: no counter, no arrows.
  const interactive = count > 1;
  const current = items[index];
  if (!current) return null;

  return (
    <section
      className="stage relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ground pt-24 pb-8 md:pt-28"
      aria-roledescription={interactive ? 'карусель' : undefined}
      aria-label="Витрина работ"
    >
      {/* The wordmark, enormous and faint, is the backdrop of the whole stage. */}
      <GhostMark className="absolute inset-x-0 top-1/2 -translate-y-[58%] px-4 md:px-10" />

      <div
        ref={stage}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={onKeyDown}
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerUp={interactive ? endDrag : undefined}
        onPointerCancel={interactive ? endDrag : undefined}
        /*
         * `relative` without a z-index on purpose. Any z-index here would make
         * this a stacking context, and the object's `darken` would then blend
         * against its empty inside rather than against the band and the ghost
         * mark behind it — which is what erases the ghost inside a pale square.
         * Paint order already puts this above the ghost: both are positioned,
         * and this one comes later in the markup.
         */
        className={`relative flex flex-1 items-center justify-center outline-offset-8 ${
          interactive ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="relative aspect-square w-[76vw] max-w-[520px] md:w-[46vw] lg:w-[38vw]">
          {items.map((item, i) => {
            const active = i === index;
            return (
              /*
               * Opacity and transform live on the image itself, never on this
               * wrapper. Either property on a parent creates a stacking
               * context, and the object's `darken` would then blend against the
               * empty inside of that context instead of against the band —
               * which renders as nothing at all.
               */
              <div key={item.id} aria-hidden={!active} className="absolute inset-0">
                <StudioObject
                  src={item.object}
                  alt={active ? item.title : ''}
                  priority={i === 0}
                  sizes="(min-width: 1024px) 38vw, 76vw"
                  className="transition-[opacity,transform] duration-[380ms] ease-[var(--ease-studio)] motion-reduce:transition-none"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active
                      ? `translate3d(${drag * 0.28}px, 0, 0)`
                      : 'translate3d(0, 22px, 0)',
                    transitionDuration: dragging ? '0ms' : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption and controls. One black pill, everything else hairline. */}
      <div className="shell relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="label mb-3">{current.kind === 'case' ? 'Работа' : 'Услуга'}</p>
            <h2
              aria-live="polite"
              className="text-[clamp(1.75rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.03em]"
            >
              {current.title}
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-2 md:text-base">
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
                  aria-label="Предыдущая работа"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <Arrow direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Следующая работа"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
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

'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/* The screen both Mini App forms stand on: black like the welcome screen, the steps on top, the action at the bottom. */

/** 1.25rem of air, plus whatever the device and Telegram's own chrome need. */
const gutterTop =
  'calc(1.25rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))';
const gutterBottom =
  'calc(1.25rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))';
const footerBottom =
  'calc(0.75rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))';

/*
 * The forms continue the welcome screen rather than cut to white: a black
 * ground, #1c1c1e surfaces, white type, one question per screen in large
 * tight type, choices as full-width tiles (the way iOS lists them). Blue is
 * kept for the one button that moves the request forward and nothing else —
 * not the progress, not the picked tile, not the back link.
 *
 * `text-base` on fields is not a style choice: under 16px iOS zooms the page
 * when a field takes focus, and a Mini App has no address bar to zoom back.
 */

/** Keyboard focus, drawn white so it reads on black. */
const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export const box =
  'w-full rounded-[14px] border border-white/[0.08] bg-[#1c1c1e] px-4 py-3.5 text-left text-base leading-relaxed text-white outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-[#8e8e93] focus:border-white/40 focus:bg-[#232326] focus:shadow-[0_0_0_4px_rgb(255_255_255/0.08)]';

export const primary = `inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0071e3] px-7 text-[1.0625rem] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#0077ed] active:scale-[0.98] active:bg-[#0062c4] disabled:opacity-40 motion-reduce:active:scale-100 ${ring}`;

/** Any other button that is a button: bone on black, never blue. */
export const secondary = `inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#f5f5f7] px-4 py-2 text-base leading-tight font-semibold text-balance text-black transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.98] active:bg-[#e8e8ed] motion-reduce:active:scale-100 ${ring}`;

export const quiet = `min-h-11 rounded-lg px-3 text-[1.0625rem] text-bone-2 underline-offset-4 transition-colors hover:text-white hover:underline active:opacity-60 ${ring}`;

/*
 * A choice. Picked, it fills with bone and the text turns black — readable
 * from across the room, not a hairline to squint at — and a tick appears.
 * A press gives under the finger (0.97) the way an iOS cell does.
 */
export function chip(selected: boolean): string {
  return `relative flex min-h-13 w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-left text-base font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${ring} ${
    selected
      ? 'border-transparent bg-[#f5f5f7] text-black'
      : 'border-white/[0.08] bg-[#1c1c1e] text-white hover:border-white/20 active:bg-[#2c2c2e]'
  }`;
}

/* The tick inside a picked tile: black on bone. An empty ring otherwise, so every tile reads as pickable. */
export function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-150 ${
        on ? 'bg-black text-white' : 'border border-white/25 text-transparent'
      }`}
    >
      <svg
        viewBox="0 0 12 12"
        className={`size-3 transition-transform duration-200 ease-out motion-reduce:transition-none ${on ? 'scale-100' : 'scale-50'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 6.2 5 8.5l4.5-5" />
      </svg>
    </span>
  );
}

/** A tile with its label, an optional line under it, and the tick. */
export function Choice({
  selected,
  label,
  note,
  onPick,
  className = '',
}: {
  selected: boolean;
  label: string;
  note?: string;
  onPick: () => void;
  className?: string;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onPick} className={`${chip(selected)} ${className}`}>
      <span className="min-w-0">
        <span className="block">{label}</span>
        {note && (
          <span className={`mt-0.5 block text-sm font-normal ${selected ? 'text-black/60' : 'text-bone-2'}`}>{note}</span>
        )}
      </span>
      <Tick on={selected} />
    </button>
  );
}

export const question =
  'block font-display text-[clamp(1.75rem,7.4vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-white';

export const hint = 'mt-2.5 block text-base leading-relaxed text-bone-2';

/** A complaint about one answer: a soft red that holds 4.5:1 on black. */
export const problem = 'mt-3 text-[0.9375rem] text-[#ff6961]';

export function MiniStage({
  eyebrow,
  step,
  total,
  strip,
  children,
  footer,
}: {
  /** What this screen is: «Заявка», «Отзыв». */
  eyebrow: string;
  /** Zero-based. Left out once there are no questions left to answer. */
  step?: number;
  total: number;
  /** Kept for the callers; the Mini App has no sculpture. */
  shape?: string;
  /** One quiet line under the progress, above the question. */
  strip?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const at = step ?? total - 1;
  const counted = `${at + 1} из ${total}`;
  const reduce = useReducedMotion();
  return (
    <div
      data-mini="client"
      data-tone="dark"
      className="relative flex flex-col bg-black text-white"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop: gutterTop,
        paddingBottom: footer ? 0 : gutterBottom,
      }}
    >
      <header className="shrink-0 px-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{eyebrow}</span>
          {step !== undefined && (
            <span aria-hidden className="tabular-nums text-bone-3">
              {counted}
            </span>
          )}
        </div>
        <div
          className="mt-3 flex gap-1.5"
          role="progressbar"
          aria-label={eyebrow}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={at + 1}
          // Said as «2 из 5», not as a percentage.
          aria-valuetext={counted}
        >
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= at ? 'bg-white' : 'bg-white/15'}`}
            />
          ))}
        </div>
        {strip && <div className="mt-4">{strip}</div>}
      </header>

      {/*
        * Each question slides in from the right, the way a native flow moves
        * forward. The questions sit high, under the progress; the closing
        * screen, with nothing left to ask, sits in the middle.
        */}
      <div
        className={`relative flex flex-1 flex-col px-5 pb-8 ${
          step === undefined ? 'justify-center pt-6' : strip ? 'pt-[5svh]' : 'pt-[8svh]'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step ?? 'done'}
            initial={reduce ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -20 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {footer && (
        <div
          className="sticky bottom-0 z-10 shrink-0 border-t border-white/10 bg-black/80 px-5 pt-3 backdrop-blur-xl"
          style={{ paddingBottom: footerBottom }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

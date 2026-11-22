'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/* The screen both Mini App forms stand on: the site's light surface, the steps on top, the action at the bottom. */

/** 1.25rem of air, plus whatever the device and Telegram's own chrome need. */
const gutterTop =
  'calc(1.25rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))';
const gutterBottom =
  'calc(1.25rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))';

/*
 * The Mini App speaks the site's language now: Apple's light surfaces, one
 * question per screen in large tight type, grey fields that turn white with a
 * blue ring, choices as full-width tiles (the way iOS lists them), one blue
 * button. `text-base` on fields is not a style choice: under 16px iOS zooms the
 * page when a field takes focus, and a Mini App has no address bar to zoom back.
 */
export const box =
  'w-full rounded-[14px] border border-transparent bg-wall-2 px-4 py-3.5 text-left text-base leading-relaxed text-bone outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-bone-3 focus:border-[#0071e3] focus:bg-wall focus:shadow-[0_0_0_4px_rgb(0_113_227/0.16)]';

export const primary =
  'inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0071e3] px-7 text-[1.0625rem] font-semibold text-white transition-[background-color,transform] active:scale-[0.98] active:bg-[#0062c4] disabled:opacity-40';

export const quiet = 'min-h-11 px-2 text-[1.0625rem] text-[#0071e3] active:opacity-60';

/* A choice: a full-width tile that takes a blue outline and a tick when picked. */
export function chip(selected: boolean): string {
  return `relative flex min-h-13 w-full items-center justify-between gap-3 rounded-[14px] border px-4 text-left text-base font-medium transition-[border-color,box-shadow] ${
    selected ? 'border-[#0071e3] bg-wall text-bone shadow-[0_0_0_1px_#0071e3]' : 'border-seam-2 bg-wall text-bone'
  }`;
}

export function row(selected: boolean): string {
  return `flex min-h-12 w-full flex-wrap items-center justify-between gap-x-4 gap-y-0.5 rounded-[14px] border px-4 py-2.5 text-left transition-[border-color,box-shadow] ${
    selected ? 'border-[#0071e3] shadow-[0_0_0_1px_#0071e3]' : 'border-seam-2'
  }`;
}

export const question =
  'block font-display text-[clamp(1.75rem,7.4vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-bone';

export const hint = 'mt-2.5 block text-base leading-relaxed text-bone-2';

export function MiniStage({
  eyebrow,
  step,
  total,
  children,
  footer,
}: {
  /** What this screen is: «Заявка», «Отзыв». */
  eyebrow: string;
  /** Zero-based. Left out once there are no questions left to answer. */
  step?: number;
  total: number;
  /** Kept for the callers; the light Mini App has no sculpture. */
  shape?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const at = step ?? total - 1;
  const reduce = useReducedMotion();
  return (
    <div
      data-mini="client"
      className="relative flex flex-col bg-wall text-bone"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop: gutterTop,
        paddingBottom: gutterBottom,
      }}
    >
      <header className="shrink-0 px-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{eyebrow}</span>
          {step !== undefined && (
            <span className="tabular-nums text-bone-3">
              {step + 1} из {total}
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= at ? 'bg-[#0071e3]' : 'bg-wall-3'}`} />
          ))}
        </div>
      </header>

      {/* each question slides in from the right, the way a native flow moves forward */}
      <div className="relative flex flex-1 flex-col px-5 pt-[9svh] pb-8">
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
          className="sticky bottom-0 z-10 shrink-0 border-t border-black/5 bg-white/80 px-5 pt-3 backdrop-blur-xl"
          style={{ paddingBottom: '0.25rem' }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

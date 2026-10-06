'use client';

import { Sculpture, type Shape } from '@/components/three/Sculpture';

/*
 * The screen both Mini App forms stand on.
 *
 * The site answers a question with a white surface on pale grey, under a black
 * opening. A Mini App has one short screen and room for neither, so this takes
 * the site's other half — the black band with the point cloud on it, the one
 * every page already ends on — and puts the question inside it. Same black,
 * same cloud, same typeface, same hairline. Inverted, because that band was
 * always white type on black.
 *
 * The cloud earns its place rather than decorating: dust at the first question,
 * a solid form at the last, so answering is visibly what builds it. On the site
 * the same mechanic is driven by scrolling, which a window this short has none
 * of.
 *
 * Two things here are load-bearing and easy to undo by accident:
 *
 *   `Sculpture` is mounted here, beside the step rather than inside it. Put it
 *   within the subtree that is keyed by step and every answer would dispose the
 *   WebGL context and build a new one — a black gap and another lazy load,
 *   thirteen times over.
 *
 *   The height comes from `--tg-viewport-stable-height`, not
 *   `--tg-viewport-height`. Telegram updates the second one continuously and
 *   warns in its own documentation that it refreshes too slowly to pin anything
 *   to the bottom of; the stable one settles once the keyboard and the gestures
 *   are done. Outside Telegram neither exists and `100svh` stands in.
 */

/** 1.25rem of air, plus whatever the device and Telegram's own chrome need. */
const gutterTop =
  'calc(1.25rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))';
const gutterBottom =
  'calc(1.25rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))';

/*
 * The answer box, the site's own, inverted.
 *
 * On the site it is a white surface on pale grey: figure and ground doing the
 * work a border does badly, so it reads as somewhere to write before it reads
 * as anything else. On black the same idea is a surface lifted a little out of
 * it, with a hairline that sharpens to solid white on focus.
 *
 * Solid, not translucent, and that is the point rather than a detail. Four per
 * cent white looked right on an empty page and wrong on this one: the cloud
 * carried straight on through the field, so a sentence being typed was read
 * against moving dust. The site's own box is opaque for the same reason.
 *
 * `text-base` is not a style choice either. Under 16px iOS zooms the page when
 * a field takes focus, and a Mini App has no address bar to zoom back out with.
 */
export const box =
  'w-full rounded-2xl border border-white/20 bg-[#121212] px-5 py-4 text-left text-base leading-relaxed tracking-[-0.01em] text-paper outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-paper/45 focus:border-paper focus:shadow-[0_0_0_4px_rgba(255,255,255,0.09)]';

/** The site's pill, inverted: white on black rather than black on white. */
export const primary =
  'inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-paper px-7 text-[0.9375rem] font-semibold tracking-[0.02em] text-ink transition-opacity hover:opacity-90 disabled:opacity-40';

/** Everything secondary: a word you can press, not a second button. */
export const quiet =
  'min-h-11 px-2 text-sm text-paper/55 underline-offset-4 transition-colors hover:text-paper hover:underline';

export function chip(selected: boolean): string {
  return `inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
    selected
      ? 'border-paper bg-paper text-ink'
      : 'border-white/20 text-paper/75 hover:border-paper hover:text-paper'
  }`;
}

export function row(selected: boolean): string {
  return `flex min-h-12 w-full flex-wrap items-center justify-between gap-x-4 gap-y-0.5 rounded-xl border px-4 py-2.5 text-left transition-colors ${
    selected ? 'border-paper bg-paper text-ink' : 'border-white/20 hover:border-paper'
  }`;
}

/* Set the way the site sets a question: heavy, tight, and the largest thing on
   the screen — scaled to what a phone-sized window can actually hold. */
export const question =
  'block text-[clamp(1.5rem,6.6vw,2.375rem)] leading-[1.08] font-bold tracking-[-0.03em] text-balance';

export const hint = 'mt-3 block text-[0.9375rem] leading-relaxed text-paper/60';

export function MiniStage({
  eyebrow,
  step,
  total,
  shape,
  children,
  footer,
}: {
  /** The tiny letterspaced label every page of the site opens with. */
  eyebrow: string;
  /** Zero-based. Left out once there are no questions left to answer. */
  step?: number;
  total: number;
  shape: Shape;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  /*
   * Where the cloud sits, from how far through the form the reader is.
   *
   * The floor is 0.6 rather than 0, which looks arbitrary until it is measured.
   * The camera sees ±1.03 of the cloud's own units across a portrait phone; at
   * 0.22 gathered the points scatter out past 2.3, so most of the form is
   * beyond the edge of the frame and what is left reads as a smear instead of
   * as something assembling. A recognisable shape starts near 0.6, so that is
   * where the first question starts and the last one finishes the job.
   */
  const progress = step === undefined ? 1 : 0.6 + 0.4 * (step / Math.max(1, total - 1));
  const filled = ((step ?? total - 1) + 1) / total;

  return (
    <div
      data-mini
      /* `isolate` keeps the canvas above this black and below the type. */
      className="relative isolate flex flex-col overflow-hidden bg-void text-paper"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop: gutterTop,
        paddingBottom: gutterBottom,
      }}
    >
      <Sculpture shape={shape} progress={progress} eager className="absolute inset-0 -z-10" />

      {/*
       * The cloud is white and so is the question, and on a screen this narrow
       * the question stands in the middle of the cloud rather than beside it.
       * On the site that never comes up: the same band keeps its middle clear
       * and runs the type down the outer thirds, where there is room for both.
       *
       * So the dust is pushed down where the words are and left alone at the
       * edges. A flat scrim over the whole thing would have cost the cloud; a
       * radial one costs it only the part that was in the way.
       *
       * Same layer as the canvas and after it in the markup, so it paints over
       * the cloud and under everything that has something to say.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(88% 50% at 50% 52%, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.9) 45%, rgba(5,5,5,0) 100%)',
        }}
      />

      <header className="flex shrink-0 items-center gap-4 px-5">
        <span className="text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">
          {eyebrow}
        </span>
        <span aria-hidden className="h-px flex-1 bg-white/20">
          <span
            className="block h-px bg-paper transition-[width] duration-500 ease-[var(--ease-studio)] motion-reduce:transition-none"
            style={{ width: `${filled * 100}%` }}
          />
        </span>
        {step !== undefined && (
          <span className="tabular text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">
            {step + 1} / {total}
          </span>
        )}
      </header>

      <div className="flex flex-1 flex-col justify-center px-5 py-8">{children}</div>

      {footer && <div className="shrink-0 px-5">{footer}</div>}
    </div>
  );
}

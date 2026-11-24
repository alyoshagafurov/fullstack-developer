/*
 * One look for every form a client meets — the request and the review, on the
 * site and inside Telegram — drawn the way Apple draws a configurator: one
 * question per screen in large type, quiet grey fields that turn white with a
 * blue ring when you write in them, choices as tiles that take a blue outline
 * when picked, one blue button. The forms keep their own logic; only these
 * classes decide how they look, so the four of them cannot drift apart.
 */

export const question = 'font-display font-semibold tracking-[-0.04em] text-balance text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.06] text-bone';

export const hint = 'mt-3 text-[1.0625rem] leading-relaxed text-bone-2 text-pretty';

export const field =
  'w-full rounded-[14px] border border-transparent bg-wall-2 px-5 py-4 text-left text-[1.0625rem] leading-relaxed text-bone outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-bone-3 focus:border-bone focus:bg-wall focus:shadow-[0_0_0_4px_rgb(0_0_0/0.06)] md:px-6 md:py-5 md:text-[1.1875rem]';

export const fieldSmall =
  'w-full rounded-[12px] border border-transparent bg-wall-2 px-4 py-3.5 text-left text-base leading-relaxed text-bone outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-bone-3 focus:border-bone focus:bg-wall focus:shadow-[0_0_0_4px_rgb(0_0_0/0.06)] md:px-5';

export const label = 'mb-2 flex items-baseline gap-2 text-[0.9375rem] font-medium text-bone';

export const optional = 'text-sm font-normal text-bone-2';

/* A choice, drawn as a tile: a picked one fills with ink and gives a little under the finger. Blue is kept for the one button that sends. */
export const tile = (on: boolean) =>
  `relative flex min-h-14 w-full items-center justify-between gap-3 rounded-[14px] border px-5 py-3.5 text-left text-[1.0625rem] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
    on ? 'border-bone bg-bone text-wall' : 'border-seam-2 bg-wall text-bone hover:border-bone-3 active:bg-wall-2'
  }`;

export const primary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-action px-8 text-[1.0625rem] font-medium text-white transition-[background-color,scale] duration-200 hover:bg-action-2 active:scale-[0.98] active:bg-action-3 disabled:opacity-40';

export const back = 'min-h-11 px-2 text-[1.0625rem] text-bone-2 underline-offset-4 transition-colors hover:text-bone hover:underline';

export const problem = 'mt-3 text-[0.9375rem] text-[#e30000]';

export const fine = 'text-[0.8125rem] leading-relaxed text-bone-2';

/* Where the visitor is: one short bar per screen, the done ones in blue. */
export function Steps({ at, of }: { at: number; of: number }) {
  return (
    <div className="mx-auto flex w-full max-w-xs items-center gap-1.5" aria-label={`${at + 1} / ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= at ? 'bg-bone' : 'bg-wall-3'}`} />
      ))}
    </div>
  );
}

/* The tick inside a picked tile. */
export function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors ${on ? 'bg-wall text-bone' : 'border border-seam-2 text-transparent'}`}
    >
      <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6.2 5 8.5l4.5-5" />
      </svg>
    </span>
  );
}

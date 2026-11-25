/*
 * The small presentational pieces of the home's showroom, copied here so the
 * local page can stay a server component: the same type scale, the one blue
 * button, the quiet outline and the in-sentence link, and the icons drawn in
 * the site's stroke. Nothing here runs in the browser.
 */

export const display = 'font-display font-semibold tracking-[-0.045em] text-balance';

/* The one blue button: "start a project", and nothing else is blue. */
export const primary = (size: 'md' | 'lg' = 'md') =>
  `group inline-flex items-center justify-center gap-2 rounded-full bg-action font-medium text-white transition-[background-color,scale] duration-200 hover:bg-action-2 active:scale-[0.98] active:bg-action-3 ${
    size === 'lg' ? 'min-h-14 px-8 text-[1.0625rem]' : 'min-h-12 px-7 text-[1.0625rem]'
  }`;

/* Any other way out: an outline in the band's own colours. */
export const secondary = (size: 'sm' | 'md' = 'md') =>
  `group inline-flex items-center justify-center gap-2 rounded-full border border-seam-2 font-medium text-bone transition-[border-color,background-color,scale] duration-200 hover:border-bone hover:bg-bone/[0.06] active:scale-[0.98] ${
    size === 'sm' ? 'min-h-11 px-5 text-[0.9375rem]' : 'min-h-12 px-6 text-[1rem]'
  }`;

/* A link in a sentence's place: white, underlined on hover. */
export const textLink = (size: 'sm' | 'md' = 'md') =>
  `group inline-flex min-h-11 items-center gap-1 text-bone decoration-1 underline-offset-[0.3em] hover:underline ${
    size === 'sm' ? 'text-[0.9375rem]' : 'text-[1.0625rem]'
  }`;

export function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* A paper plane in the same stroke as the site's other icons. */
export function TelegramIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d="M21.5 2.5 15 21l-3.8-8.2L3 9l18.5-6.5Z" />
      <path d="M21.5 2.5 11.2 12.8" />
    </svg>
  );
}

/* The plus that turns into a cross when a question is open. */
export function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden className={className}>
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  );
}

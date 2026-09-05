/*
 * The one arrow on the site: a 14px glyph drawn once, one-pixel stroke, in
 * the current text colour, so every link and control points the same way.
 * Purely decorative — the text beside it carries the meaning — so it is
 * hidden from assistive technology.
 */
const PATHS = {
  right: 'M2 7h10M8 3l4 4-4 4',
  left: 'M12 7H2M6 3L2 7l4 4',
  'up-right': 'M3 11L11 3M5 3h6v6',
} as const;

export default function Arrow({
  dir = 'right',
  className = '',
}: {
  dir?: keyof typeof PATHS;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[dir]} />
    </svg>
  );
}

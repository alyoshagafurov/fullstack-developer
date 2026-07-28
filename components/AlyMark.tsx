/*
 * ALY logo — the single source of the wordmark, rebuilt as clean vector so it
 * scales, strokes, masks and animates without loss. Faithful to the brand:
 * single-story circular "a", tall straight "l", angular "y" with a long
 * diagonal descender. Colour follows `currentColor`; size via className.
 *
 *   variant="solid"    — filled bold wordmark (nav, footer, buttons)
 *   variant="outline"  — thin wireframe (decorative, hover, backgrounds)
 *   variant="draw"     — outline that draws itself in (loader / reveal)
 */

type Props = {
  className?: string;
  variant?: 'solid' | 'outline' | 'draw';
  title?: string;
  strokeWidth?: number;
};

export default function AlyMark({ className = '', variant = 'solid', title, strokeWidth }: Props) {
  const sw = strokeWidth ?? (variant === 'solid' ? 24 : variant === 'draw' ? 5 : 4);
  return (
    <svg
      viewBox="0 0 300 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="butt"
      strokeLinejoin="round"
    >
      {/* a — circular bowl + right stem */}
      <circle cx="56" cy="62" r="40" pathLength={1} className={variant === 'draw' ? 'aly-draw' : undefined} />
      <line x1="96" y1="22" x2="96" y2="102" pathLength={1} className={variant === 'draw' ? 'aly-draw' : undefined} />
      {/* l — tall straight bar */}
      <line x1="142" y1="6" x2="142" y2="102" pathLength={1} className={variant === 'draw' ? 'aly-draw' : undefined} />
      {/* y — long right stroke + descender, short left arm */}
      <line x1="264" y1="22" x2="190" y2="140" pathLength={1} className={variant === 'draw' ? 'aly-draw' : undefined} />
      <line x1="196" y1="22" x2="228" y2="82" pathLength={1} className={variant === 'draw' ? 'aly-draw' : undefined} />
    </svg>
  );
}

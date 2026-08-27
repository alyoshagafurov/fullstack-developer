import Image from 'next/image';

/*
 * A photograph placed in a composition.
 *
 * Ratio, corner treatment and focal point are all required decisions rather
 * than defaults, because the brief is explicit: photographs must not share one
 * radius, one size and one crop. There is no "card" here — a Frame is just a
 * cropped image with a chosen shape.
 *
 * `tone` optionally sinks a bright photo into the dark canvas without
 * recolouring it (a scrim, not a filter).
 */

type Props = {
  src: string;
  alt: string;
  /** CSS aspect-ratio, e.g. '4/5', '16/9', '1/1'. */
  ratio: string;
  /** object-position for the crop, e.g. '50% 30%'. */
  focus?: string;
  /** Corner treatment — vary it deliberately across the page. */
  corner?: 'none' | 'sm' | 'lg' | 'pill';
  /** Darkening scrim, 0–1, for photos that would otherwise punch a hole. */
  tone?: number;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
};

const CORNERS = {
  none: 'rounded-none',
  sm: 'rounded-md',
  lg: 'rounded-[1.75rem]',
  pill: 'rounded-[6rem]',
} as const;

export default function Frame({
  src, alt, ratio, focus = '50% 50%', corner = 'none',
  tone = 0, sizes, priority, quality = 88, className = '',
}: Props) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-low ${CORNERS[corner]} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: focus }}
      />
      {tone > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(27,32,40,${tone})` }}
        />
      )}
    </div>
  );
}

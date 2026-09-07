import Image from 'next/image';

/*
 * One photographed object, floating, with its own real shadow.
 *
 * The objects were shot on a near-white sweep and each already carries the
 * shadow it casts. `mix-blend-mode: darken` (set by .studio-object in
 * globals.css) drops that near-white backdrop to exactly the band colour while
 * keeping the object and the shadow, so nothing has to be cut out and the
 * shadow never turns into a flat grey ellipse.
 *
 * The consequence to respect: the band behind an object must never be darker
 * than the photograph's backdrop, or the blend clips the object's highlights.
 * Objects therefore live on `ground` and `paper`, never on `ink`.
 *
 * `lift` is for a band that is pure white. The sweep in these photographs
 * bottoms out around 247 rather than 255, so on white the blend leaves it
 * standing as a faint square. A few percent of brightness carries the sweep
 * the rest of the way to white, where it vanishes; the object and its shadow
 * lighten by the same few percent, which is not visible.
 */
export function StudioObject({
  src,
  alt,
  priority = false,
  sizes = '(min-width: 1024px) 40vw, 80vw',
  className = '',
  style,
  lift = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  lift?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1100}
      height={1100}
      priority={priority}
      sizes={sizes}
      className={`studio-object h-auto w-full select-none ${className}`}
      style={lift ? { filter: 'brightness(1.045)', ...style } : style}
      draggable={false}
    />
  );
}

import Image from 'next/image';

/*
 * The owner's wordmark.
 *
 * It is his own file and is never redrawn as text, never re-lettered and never
 * replaced by a font. His two source files are flat — black on cream, white on
 * black — so the shipped asset was built from the light one by turning its
 * luminance into an alpha channel and cropping to the letters. That leaves real
 * transparency, which works on any band without a blend mode; a blend would
 * have needed an isolated stacking context everywhere the mark appears.
 */

export function Logo({
  className = 'h-7 w-auto',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/wordmark.webp"
      alt="aly"
      width={663}
      height={462}
      priority={priority}
      className={className}
      draggable={false}
    />
  );
}

/**
 * The same wordmark set enormous and faint, behind the object.
 *
 * This is the ghost layer from the AirPods reference. The owner asked for his
 * logo there rather than a word (answer 2.3), so the mark itself carries it,
 * and it stays constant while the objects rotate in front of it. Decorative
 * and hidden from assistive technology: the header already says "aly".
 */
export function GhostMark({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      <Image
        src="/brand/wordmark.webp"
        alt=""
        width={663}
        height={462}
        sizes="100vw"
        className="h-auto w-full opacity-[0.06]"
        draggable={false}
      />
    </div>
  );
}

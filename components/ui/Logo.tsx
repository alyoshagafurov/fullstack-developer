import Image from 'next/image';

/*
 * The real ALY wordmark.
 *
 * public/aly-logo.png is the owner's own logo file, exported with a
 * transparent background so it can sit on any surface. It is never redrawn as
 * SVG and never replaced with text — this file is the brand.
 */
export default function Logo({
  className = 'h-6 w-auto',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/aly-logo.png"
      alt="ALY"
      width={720}
      height={405}
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}

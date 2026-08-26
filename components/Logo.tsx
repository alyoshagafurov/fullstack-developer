import Image from 'next/image';

/*
 * ALY logo — the owner's real wordmark ("aly", rounded geometric, teardrop "y"),
 * exported as a transparent warm-white PNG (public/aly-logo.png) so it sits on
 * any dark surface. This is the single source for the displayed logo; size it
 * with a height class (`h-* w-auto`). For giant faint background watermarks use
 * a `bg-[url('/aly-logo.png')]` div instead — see Footer / not-found.
 */
export default function Logo({
  className = '',
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

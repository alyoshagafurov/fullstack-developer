/*
 * Decorative 3D object rendered on black — `mix-blend-mode: screen` drops the
 * black so only the lit shape floats over the section. Sits behind the content
 * (section must be `relative isolate`), gently drifts, and its square edges are
 * feathered with a radial mask. Position/size via `className`.
 */
export default function FloatObject({
  src,
  className = '',
  opacity = 0.55,
}: {
  src: string;
  className?: string;
  opacity?: number;
}) {
  const mask = 'radial-gradient(closest-side, #000 55%, transparent 100%)';
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      className={`absolute -z-10 pointer-events-none select-none float-slow ${className}`}
      style={{ opacity, mixBlendMode: 'screen', maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

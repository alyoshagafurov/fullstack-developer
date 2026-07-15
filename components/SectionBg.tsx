/*
 * Decorative full-bleed background layer for a section. Sits behind the content
 * (the section must be `relative isolate`), low opacity + a soft radial mask so
 * text stays perfectly readable. Plain <img> — the assets are already small.
 */
export default function SectionBg({
  src,
  opacity = 0.38,
  focus = '50% 50%',
}: {
  src: string;
  opacity?: number;
  focus?: string;
}) {
  const mask = `radial-gradient(120% 100% at ${focus}, #000 25%, transparent 82%)`;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
        style={{ opacity, maskImage: mask, WebkitMaskImage: mask }}
      />
    </div>
  );
}

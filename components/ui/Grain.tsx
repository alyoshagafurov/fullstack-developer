/*
 * Paper grain over the whole page.
 *
 * A flat off-white ground reads as a screen; the same ground under a few
 * percent of paper grain reads as a photographed surface. It sits above
 * everything and takes no pointer events, so nothing under it changes.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage: 'url(/texture/grain.webp)',
        backgroundSize: '360px 360px',
        backgroundRepeat: 'repeat',
      }}
    />
  );
}

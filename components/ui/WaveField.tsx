/*
 * The hero object.
 *
 * A sphere lit from the left, sitting in a field of flowing ridges — drawn,
 * not photographed. The reference is an abstract greyscale form, and a
 * photograph could not be it: the same image has to survive any viewport
 * width, stay sharp on a retina panel and cost nothing to download.
 *
 * So it is one inline SVG. No file, no request, no layout shift, and every
 * value in it is a step on the same grey ramp the rest of the site uses.
 *
 * The ridges are stroked paths rather than filled shapes. A filled wave reads
 * as a solid object and fights the sphere for attention; a family of thin
 * strokes at graded opacity reads as a surface, which is what makes the sphere
 * look like it is sitting in something rather than pasted on top.
 *
 * `preserveAspectRatio="xMidYMid slice"` lets it behave like a background
 * photograph — it crops rather than letterboxes, so the composition stays
 * centred on the sphere at every width.
 */

const RIDGES = 64;

/**
 * Round before it reaches an attribute.
 *
 * Node and the browser do not always print the same digits for the same
 * double — 1.1442801643337466 against ...64 — and React compares the server's
 * HTML to the client's render as strings. Unrounded arithmetic here produced a
 * hydration mismatch on almost every path in the family. Three decimals is far
 * finer than a pixel at this scale and is identical on both sides.
 */
const r3 = (n: number): number => Math.round(n * 1000) / 1000;

/** One flowing ridge. `t` runs 0→1 across the family. */
function ridgePath(t: number): string {
  // Each ridge is the same curve, swept around the sphere and flattened as it
  // recedes. The eye reads the accumulating offset as depth, so the family
  // only needs one shape — the variation does the work, not the drawing.
  //
  // The family spans well above and below the panel: the reference's ridges
  // arrive from off-frame and leave off-frame, and a band that starts and
  // stops inside the picture reads as a drawing of waves rather than as a
  // surface the sphere is resting in.
  const y = -220 + t * 1340;
  // Amplitude peaks in the middle of the family, where the sphere is, so the
  // ridges appear to wrap it rather than run past it.
  const swell = Math.sin(t * Math.PI);
  const lift = 90 + 250 * swell;
  const skew = 200 * (t - 0.5);
  return [
    `M -160 ${r3(y + lift * 0.62)}`,
    `C ${r3(240 + skew)} ${r3(y - lift)} ${r3(540 + skew)} ${r3(y + lift * 0.95)} 760 ${r3(y - lift * 0.2)}`,
    `C ${r3(1060 - skew)} ${r3(y - lift * 1.2)} ${r3(1300 - skew)} ${r3(y + lift * 0.4)} 1640 ${r3(y - lift * 0.78)}`,
  ].join(' ');
}

export default function WaveField({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        {/* The ground: black at the edges, barely lifted at the centre, so the
            panel has a middle rather than being flat. */}
        <radialGradient id="wf-ground" cx="52%" cy="42%" r="78%">
          <stop offset="0%" stopColor="#1c1c1c" />
          <stop offset="55%" stopColor="#101010" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>

        {/* The sphere. Light source upper-left, terminator soft, and it never
            reaches pure white — a blown highlight would flatten it. */}
        <radialGradient id="wf-sphere" cx="34%" cy="30%" r="76%">
          <stop offset="0%" stopColor="#f2f2f2" />
          <stop offset="42%" stopColor="#c9c9c9" />
          <stop offset="74%" stopColor="#6e6e6e" />
          <stop offset="100%" stopColor="#232323" />
        </radialGradient>

        {/* Ridges fade at both ends so no stroke terminates on a hard edge. */}
        <linearGradient id="wf-ridge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="52%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="82%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Everything behind the sphere is masked out of the ridge family, so
            the sphere occludes them instead of being overdrawn. That single
            mask is what makes the composition read as depth. */}
        <mask id="wf-occlude">
          <rect x="0" y="0" width="1440" height="900" fill="#fff" />
          <ellipse cx="720" cy="360" rx="252" ry="252" fill="#000" />
        </mask>

        <filter id="wf-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>

        <clipPath id="wf-clip">
          <circle cx="720" cy="360" r="250" />
        </clipPath>

        {/* The photograph is shown as shot — no desaturation, no tone curve.
            This is the one thing laid over it, and it is not a treatment of
            the image: it is the panel's own edge, so the circle meets the
            ridges instead of being stamped on top of them. It touches only the
            outer eighth of the disc and leaves the subject untouched. */}
        <radialGradient id="wf-shade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="86%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="1440" height="900" fill="url(#wf-ground)" />

      {/* ── The ridge family ─────────────────────────────────────────── */}
      <g mask="url(#wf-occlude)" fill="none" stroke="url(#wf-ridge)">
        {Array.from({ length: RIDGES }, (_, i) => {
          const t = i / (RIDGES - 1);
          // Brightest where the family is densest, around the sphere; the
          // outermost ridges fall away so the panel edges stay quiet.
          const swell = Math.sin(t * Math.PI);
          return (
            <path
              key={i}
              d={ridgePath(t)}
              strokeWidth={r3(0.5 + swell * 0.9)}
              strokeOpacity={r3(0.06 + swell * 0.42)}
            />
          );
        })}
      </g>

      {/* A soft shadow under the sphere seats it on the ridges. */}
      <ellipse cx="720" cy="392" rx="286" ry="286" fill="#000" opacity="0.55" filter="url(#wf-soft)" />

      {/* The disc is the photograph.
          Geometry, so the face lands on the centre rather than near it: the
          source is 1402×1122 and the subject's head sits at about 44.5%
          across and 26% down. Drawing it into a 1250×1000 box at (164, 100)
          puts that point at (720, 360) — the circle's centre — and makes the
          head roughly 270px inside a 500px disc, which is the crop a portrait
          wants. The box also has to reach past the circle on every side, or
          the clip would expose the fill behind it; at this size its top edge
          clears the disc by ten pixels. */}
      <g clipPath="url(#wf-clip)">
        <circle cx="720" cy="360" r="250" fill="#141414" />
        <image
          href="/hero-portrait.jpg"
          x="164" y="100" width="1250" height="1000"
          preserveAspectRatio="xMidYMid slice"
        />
        <circle cx="720" cy="360" r="250" fill="url(#wf-shade)" />
      </g>
      {/* The rim. A hairline on the shadow side is what keeps the disc reading
          as a lit object rather than a hole cut in the page. */}
      <circle
        cx="720" cy="360" r="249"
        fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5"
      />
    </svg>
  );
}

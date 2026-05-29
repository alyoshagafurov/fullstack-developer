/**
 * Global SVG filters. Used by:
 *  - .morph-target  → distorts the hero face during hover/morph
 *  - chromatic aberration via feColorMatrix offsets
 *  - turbulence for "energy" and warp moments
 *
 * Animated via GSAP on attributes like baseFrequency / scale.
 */
export default function SVGFilters() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        {/* Displacement filter — animate baseFrequency + scale */}
        <filter id="displacement-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            id="morph-turb"
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="7"
            result="turb"
          />
          <feDisplacementMap
            id="morph-disp"
            in="SourceGraphic"
            in2="turb"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Chromatic aberration */}
        <filter id="chromatic" x="-5%" y="-5%" width="110%" height="110%">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feOffset id="chrom-r" in="r" dx="0" dy="0" result="ro" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="g"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="b"
          />
          <feOffset id="chrom-b" in="b" dx="0" dy="0" result="bo" />
          <feBlend in="ro" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bo" mode="screen" />
        </filter>

        {/* Portal warp — animated heavily during transition */}
        <filter id="portal-warp" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            id="portal-turb"
            type="fractalNoise"
            baseFrequency="0.005"
            numOctaves="3"
            seed="11"
            result="turb"
          />
          <feDisplacementMap
            id="portal-disp"
            in="SourceGraphic"
            in2="turb"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Soft bloom */}
        <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Radial gradient mask for portal opening */}
        <radialGradient id="portal-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="60%" stopColor="#8A2BE2" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

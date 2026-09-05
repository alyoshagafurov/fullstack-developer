/*
 * The five service previews.
 *
 * Drawn, not photographed. The brief rules out stock imagery and photographs
 * of people, and the five objects it asks for — a laptop, a phone, a
 * dashboard, a before/after pair, an orbital system — have no honest source in
 * this repository. Line drawings are the alternative that stays in one visual
 * language by construction: one stroke width, one palette, one grid.
 *
 * They are deliberately unlit and low-contrast: a hint of the object at the
 * end of each row, not an illustration competing with the title.
 *
 * Every drawing shares the same 320×180 viewBox, so the five previews line up
 * whatever is inside them. Colours come from the theme (stroke-ink, fill-copper)
 * so the drawings follow the tokens like everything else.
 */

export type PreviewKind = 'laptop' | 'phone' | 'dashboard' | 'redesign' | 'orbit';

const STROKE = 'stroke-ink/[0.22]';
const STROKE_SOFT = 'stroke-ink/[0.12]';
const FILL_SOFT = 'fill-ink/[0.12]';
const COPPER_STROKE = 'stroke-copper/[0.55]';
const COPPER_FILL = 'fill-copper/[0.55]';

export default function ServicePreview({ kind }: { kind: PreviewKind }) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      aria-hidden
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {kind === 'laptop' && (
        <g strokeLinecap="round">
          <rect x="72" y="26" width="176" height="106" rx="4" className={STROKE} />
          <path d="M72 46h176" className={STROKE_SOFT} />
          <circle cx="82" cy="36" r="2" className={FILL_SOFT} />
          <rect x="86" y="58" width="60" height="8" rx="2" className={COPPER_FILL} opacity="0.5" />
          <rect x="86" y="74" width="104" height="5" rx="2" className={FILL_SOFT} />
          <rect x="86" y="86" width="82" height="5" rx="2" className={FILL_SOFT} />
          <rect x="86" y="104" width="42" height="14" rx="3" className={COPPER_STROKE} />
          <rect x="180" y="58" width="52" height="60" rx="3" className={STROKE_SOFT} />
          <path d="M52 144h216l-10-12H62l-10 12Z" className={STROKE} />
          <path d="M136 138h48" className={STROKE_SOFT} />
        </g>
      )}

      {kind === 'phone' && (
        <g strokeLinecap="round">
          <rect x="126" y="14" width="68" height="152" rx="10" className={STROKE} />
          <path d="M150 24h20" className={STROKE_SOFT} strokeWidth="2" />
          <rect x="136" y="38" width="48" height="34" rx="3" className={FILL_SOFT} opacity="0.6" />
          <rect x="136" y="82" width="34" height="6" rx="2" className={COPPER_FILL} opacity="0.55" />
          <rect x="136" y="96" width="48" height="4" rx="2" className={FILL_SOFT} />
          <rect x="136" y="106" width="40" height="4" rx="2" className={FILL_SOFT} />
          <rect x="136" y="124" width="48" height="16" rx="3" className={COPPER_STROKE} />
          {/* the page continues past the frame — a landing scrolls */}
          <path d="M104 96h10M206 96h10" className={STROKE_SOFT} />
        </g>
      )}

      {kind === 'dashboard' && (
        <g strokeLinecap="round">
          <rect x="34" y="20" width="252" height="140" rx="4" className={STROKE} />
          <path d="M76 20v140" className={STROKE_SOFT} />
          <rect x="48" y="38" width="14" height="3" rx="1.5" className={FILL_SOFT} />
          <rect x="48" y="52" width="14" height="3" rx="1.5" className={FILL_SOFT} />
          <rect x="48" y="66" width="14" height="3" rx="1.5" className={COPPER_FILL} opacity="0.6" />
          <rect x="48" y="80" width="14" height="3" rx="1.5" className={FILL_SOFT} />
          <path
            d="M94 118l26-22 22 14 26-34 24 18 26-30 24 20"
            className={COPPER_STROKE}
            strokeWidth="1.4"
          />
          <path d="M94 138h176" className={STROKE_SOFT} />
          <rect x="94" y="36" width="52" height="26" rx="3" className={STROKE_SOFT} />
          <rect x="156" y="36" width="52" height="26" rx="3" className={STROKE_SOFT} />
          <rect x="218" y="36" width="52" height="26" rx="3" className={STROKE_SOFT} />
        </g>
      )}

      {kind === 'redesign' && (
        <g strokeLinecap="round">
          {/* before — crowded, behind */}
          <rect x="30" y="34" width="130" height="112" rx="4" className={STROKE_SOFT} />
          <rect x="42" y="48" width="106" height="5" rx="2" className={FILL_SOFT} />
          <rect x="42" y="60" width="106" height="5" rx="2" className={FILL_SOFT} />
          <rect x="42" y="72" width="106" height="5" rx="2" className={FILL_SOFT} />
          <rect x="42" y="84" width="106" height="5" rx="2" className={FILL_SOFT} />
          <rect x="42" y="96" width="106" height="5" rx="2" className={FILL_SOFT} />
          <rect x="42" y="108" width="70" height="5" rx="2" className={FILL_SOFT} />
          {/* after — spaced, in front */}
          <rect x="150" y="20" width="140" height="140" rx="4" className={`${STROKE} fill-base`} />
          <rect x="166" y="42" width="56" height="9" rx="2" className={COPPER_FILL} opacity="0.5" />
          <rect x="166" y="64" width="100" height="5" rx="2" className={FILL_SOFT} />
          <rect x="166" y="78" width="78" height="5" rx="2" className={FILL_SOFT} />
          <rect x="166" y="104" width="46" height="16" rx="3" className={COPPER_STROKE} />
        </g>
      )}

      {kind === 'orbit' && (
        <g>
          <ellipse cx="160" cy="90" rx="118" ry="46" className={STROKE_SOFT} />
          <ellipse cx="160" cy="90" rx="86" ry="33" className={STROKE_SOFT} />
          <ellipse cx="160" cy="90" rx="52" ry="20" className={STROKE} />
          <circle cx="160" cy="90" r="7" className={COPPER_FILL} />
          <circle cx="278" cy="90" r="3.5" className={COPPER_FILL} opacity="0.8" />
          <circle cx="74" cy="90" r="2.5" className="fill-ink/[0.22]" />
          <circle cx="196" cy="66" r="2.5" className="fill-ink/[0.22]" />
        </g>
      )}
    </svg>
  );
}

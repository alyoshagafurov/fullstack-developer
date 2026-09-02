/*
 * The bento panel — the unit of layout on this site.
 *
 * The references are built from soft-cornered blocks on a near-black field,
 * separated by gap rather than by rules. This is that block, and it exists as
 * a component so the corner radius, the hairline and the surface step are
 * decided once. Seven sections open-coding the same four classes is how three
 * of them end up with a different radius.
 *
 * `tone` is the only choice a caller makes:
 *
 *   low     the default surface — most panels
 *   high    one step brighter, for a panel that should sit forward
 *   bare    hairline only, no fill, for a panel that frames rather than holds
 *
 * It is a <div> by default; `as` takes an element when the content is
 * semantically a section, an article or a list item.
 */

import type { ElementType, ReactNode } from 'react';

const TONE = {
  low: 'bg-surface-low border-line',
  high: 'bg-surface-high border-line-2',
  bare: 'bg-transparent border-line',
} as const;

export default function Panel({
  as: Tag = 'div',
  tone = 'low',
  className = '',
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: keyof typeof TONE;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag className={`rounded-panel border ${TONE[tone]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

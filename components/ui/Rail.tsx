import type { ReactNode } from 'react';

import { Led } from '@/components/ui/Panel';

/*
 * A rail opens a section.
 *
 * One line of light across the column with the section's name sitting on it
 * as a nameplate — the label interrupts the line rather than floating above
 * a heading. Every section below the hero starts this way, so the page reads
 * as one run of rails, each one lit as the reader reaches it.
 *
 * Whatever is passed as children sits to the right of the plate on the same
 * line — a count, a link — and stays small.
 */
export default function Rail({
  label,
  children,
  className = '',
}: {
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div data-light="" className={`relative h-10 ${className}`}>
      <Led />
      <span className="plate">{label}</span>
      {children && (
        <span className="absolute right-0 top-0 -translate-y-1/2 bg-base pl-3 text-[11px] uppercase tracking-[0.18em] text-ink-3">
          {children}
        </span>
      )}
    </div>
  );
}

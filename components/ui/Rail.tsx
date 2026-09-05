import type { ReactNode } from 'react';

import { Led } from '@/components/ui/Panel';

/*
 * A rail opens a section.
 *
 * One line of light runs across the column at the heading's own height, and
 * the heading interrupts it like a nameplate: no label above the title, the
 * title is the plate. A count or a note may sit at the rail's far end on the
 * same line. The line brightens where the pointer passes, like every edge on
 * the site.
 *
 * `children` is the heading element itself (h1 / h2 / p), styled by the
 * caller; the rail only positions it on the line.
 */
export default function Rail({
  children,
  count,
  className = '',
}: {
  children: ReactNode;
  count?: ReactNode;
  className?: string;
}) {
  return (
    <div data-light="" className={`relative ${className}`}>
      <Led at="mid" />
      <div className="relative z-[2] flex items-center justify-between gap-6">
        <div className="min-w-0 bg-base pr-5">{children}</div>
        {count !== undefined && count !== null && (
          <span aria-hidden className="shrink-0 bg-base pl-4 text-[11px] uppercase tracking-[0.18em] text-ink-3">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

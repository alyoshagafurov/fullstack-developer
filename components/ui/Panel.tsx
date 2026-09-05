/*
 * The panel — the unit of layout on this site — and the edge that lights it.
 *
 * There are no borders in this world. A panel is a slightly lighter piece of
 * the same graphite, and what separates it from the ground is a single warm
 * line along its top edge that brightens where the pointer passes and lights
 * fully when the panel is hovered, focused or pressed. The CSS for all of that
 * lives in globals.css under `.led` and `.panel`; this file decides the
 * markup once so seven sections cannot disagree about it.
 *
 * `tone` is the only material choice a caller makes:
 *
 *   flush    the default — a step up from the ground
 *   raised   a step higher, with the skin texture that marks a raised piece
 *   day      the one daylight panel; it carries no LED
 *
 * `edge` puts the line at the top (default), the bottom, or nowhere.
 * `as` takes an element (or next/link) when the panel is a link, a list
 * item or a section; the rest of the props pass straight through.
 */

import type { ElementType, ReactNode } from 'react';

export type Edge = 'top' | 'mid' | 'bottom' | 'none';

/* The lit edge on its own, for hosts that are not panels — the header, the
   hero track, a rail at the top of a section. The host must be positioned
   and marked data-light so the pool knows where the pointer is. */
export function Led({ at = 'top', className = '' }: { at?: Exclude<Edge, 'none'>; className?: string }) {
  const where = at === 'bottom' ? 'led-b' : at === 'mid' ? 'led-mid' : '';
  return <span aria-hidden className={`led ${where} ${className}`.trim()} />;
}

const TONE = {
  flush: 'panel',
  raised: 'panel panel-raised',
  day: 'panel panel-day',
} as const;

export default function Panel({
  as: Tag = 'div',
  tone = 'flush',
  edge = 'top',
  className = '',
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: keyof typeof TONE;
  edge?: Edge;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const lit = edge !== 'none';
  return (
    <Tag data-light={lit ? '' : undefined} className={`${TONE[tone]} ${lit ? 'lit' : ''} ${className}`} {...rest}>
      {lit && <Led at={edge} />}
      {children}
    </Tag>
  );
}

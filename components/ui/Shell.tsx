/*
 * The grid shell.
 *
 * Every composition sits inside this, and every composition is allowed to
 * break out of it — that tension is the layout system. `bleed` drops the
 * max-width so a block can run edge to edge; `grid` exposes the 12 columns
 * for the sections that want to place things by column rather than by flow.
 */

type Props = {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav';
  /** Edge-to-edge: no max-width, no gutters. */
  bleed?: boolean;
  /** Expose the 12-column grid to direct children. */
  grid?: boolean;
  className?: string;
  id?: string;
};

export default function Shell({
  children, as: Tag = 'div', bleed = false, grid = false, className = '', id,
}: Props) {
  const base = bleed ? 'w-full' : 'shell';
  return (
    <Tag id={id} className={`${base} ${grid ? 'grid-12' : ''} ${className}`}>
      {children}
    </Tag>
  );
}

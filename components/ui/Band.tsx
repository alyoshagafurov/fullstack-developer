import type { ReactNode } from 'react';

/*
 * A full-bleed horizontal band.
 *
 * The page is built from stripes that alternate ground, paper and shelf, the
 * way the AirPods reference alternates white and grey. Sections are never
 * floating cards with shadows: they are bands of studio floor.
 */

type Tone = 'ground' | 'paper' | 'shelf' | 'ink' | 'void';

const tones: Record<Tone, string> = {
  ground: 'bg-ground text-ink',
  paper: 'bg-paper text-ink',
  shelf: 'bg-shelf text-ink',
  ink: 'bg-ink text-paper',
  // True black. Studio objects must never sit on this: their `darken` blend
  // would clip everything to black. Type and photographs only.
  void: 'bg-void text-paper',
};

export function Band({
  tone = 'ground',
  id,
  className = '',
  innerClassName = '',
  children,
  as: Tag = 'section',
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  as?: 'section' | 'div' | 'footer' | 'header';
}) {
  return (
    // `stage` isolates the band so studio objects inside it have this band's
    // background to blend against. Without it their `darken` reaches the
    // viewport canvas and paints nothing.
    <Tag id={id} className={`stage relative w-full ${tones[tone]} ${className}`}>
      <div className={`shell ${innerClassName}`}>{children}</div>
    </Tag>
  );
}

/** A hairline across the band. The only divider the site uses. */
export function Rule({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`h-px w-full bg-line ${className}`} />;
}

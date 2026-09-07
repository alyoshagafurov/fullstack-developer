import { Sculpture, type Shape } from '@/components/three/Sculpture';

/*
 * The band the form stands on: one screen of black after a page's opening,
 * the cloud filling it, and a column of plain facts down each side.
 *
 * Every fact here is the owner's own, lifted from the answers the rest of the
 * site is built from. Nothing on this band is written for it — a page of
 * invented "interesting facts" beside a portfolio is exactly the thing that
 * makes a portfolio read as filler.
 *
 * The columns sit in the outer thirds so the middle stays clear for the form;
 * on a phone they stack under it and the cloud runs behind them.
 */

export type Fact = { label: string; value: string };

/* Readonly, so the content modules can hand over their `as const` arrays. */
type Facts = readonly Fact[];

export function Stage({
  left = [],
  right = [],
  shape,
}: {
  left?: Facts;
  right?: Facts;
  shape?: Shape;
}) {
  return (
    <section
      data-tone="dark"
      /* `isolate` keeps the canvas above this band's black and below the type,
         rather than under the whole page. */
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-void py-24 text-paper"
    >
      <Sculpture shape={shape} className="absolute inset-0 -z-10" />

      <div className="shell relative grid w-full gap-14 md:grid-cols-3 md:items-center md:gap-10">
        <Column facts={left} />
        <div aria-hidden className="hidden md:block" />
        <Column facts={right} align="right" />
      </div>
    </section>
  );
}

function Column({ facts, align }: { facts: Facts; align?: 'right' }) {
  if (facts.length === 0) return <div aria-hidden className="hidden md:block" />;
  return (
    <dl data-reveal="group" className={`space-y-10 ${align === 'right' ? 'md:text-right' : ''}`}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">
            {fact.label}
          </dt>
          <dd className="mt-3 text-[clamp(1.0625rem,1.5vw,1.375rem)] leading-snug tracking-[-0.02em] text-paper/85">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

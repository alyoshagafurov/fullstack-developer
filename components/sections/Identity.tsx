'use client';

import Image from 'next/image';
import Link from 'next/link';

import Action from '@/components/ui/Action';
import { Led } from '@/components/ui/Panel';
import { useI18n } from '@/lib/i18n';

/*
 * The first screen.
 *
 * A dark room. The ceiling carries eleven ribs of light in slight
 * perspective above the words; they brighten around the pointer and are
 * barely on elsewhere. The right half of the room is a window from floor to ceiling —
 * the owner's own photograph, feathered only at its edges, with the light of
 * the room pooling along its sill. Across the whole screen, under the claim,
 * runs one LED track: the datum everything on the page registers to. The
 * claim sits above it and is reflected faintly in the floor below it; the
 * one copper control stands on the track like a switch on a rail.
 *
 * Layout is a full-bleed grid (`.stage`): the words stay in the shell
 * column, the track runs from edge to edge. Rows, top to bottom:
 *
 *   1  air
 *   2  the claim
 *   3  the track
 *   4  the line under the claim, the way to the work, and the reflection
 *   5  air
 *
 * Everything the brief struck out is absent: no service list, no numbers,
 * no logos, no cards. The screen ends where it ends.
 */

/* The ribs: eleven lines in percent of the box, spaced by a power curve so
   they compress toward the top (far) and open toward the reader, and fanned
   a little on the right so the ceiling is seen slightly off-axis. Computed
   once; there is nothing per-frame here. */
const RIBS = Array.from({ length: 11 }, (_, i) => {
  const f = Math.pow(i / 10, 1.55);
  return { y1: 2 + 21 * f, y2: 2 + 26 * f };
});

function Ribs({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {RIBS.map((r, i) => (
        <line
          key={i}
          x1="0"
          y1={r.y1}
          x2="100"
          y2={r.y2}
          vectorEffect="non-scaling-stroke"
          strokeWidth="1"
          className="stroke-led"
        />
      ))}
    </svg>
  );
}

export default function Identity() {
  const { t } = useI18n();
  const h = t.hero;

  return (
    <section
      id="top"
      data-light=""
      className="stage relative isolate min-h-[100svh] overflow-hidden bg-base pt-16
                 grid-rows-[minmax(48px,1fr)_auto_72px_auto_minmax(64px,1fr)] md:pt-20"
    >
      {/* The ceiling. */}
      <div aria-hidden className="ribs light-up z-0">
        <Ribs className="ribs-base" />
        <Ribs className="ribs-lit" />
      </div>

      {/* The window. Below lg the photograph steps back into the room as a
          muted ground behind the words. */}
      <div className="absolute inset-y-0 right-0 z-0 w-full opacity-30 lg:w-1/2 lg:opacity-100">
        <div className="window-feather-x relative h-full w-full">
          <div className="window-feather-y relative h-full w-full">
            <Image
              src="/hero-portrait.jpg"
              alt="Алишер Гафуров за работой"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              /* 1402×1122 with the subject a little left of centre; this keeps
                 them in the middle of the window without losing the desk. */
              className="object-cover object-[38%_50%]"
            />
          </div>
        </div>
        <div aria-hidden className="window-glow light-up pointer-events-none absolute inset-x-0 bottom-0 hidden h-44 lg:block" />
        <div aria-hidden className="window-sill light-up pointer-events-none absolute inset-x-0 bottom-0 hidden h-px lg:block" />
      </div>

      {/* 2 — the claim. */}
      <div className="relative z-10 row-start-2 lg:w-1/2 lg:pr-12">
        <span className="block text-[11px] uppercase tracking-[0.24em] text-ink-3">{h.eyebrow}</span>
        <h1 className="display mt-7 max-w-[7.6ch] text-d-l text-ink">
          {h.titleMain} <span className="block text-copper">{h.titleAccent}</span>
        </h1>
      </div>

      {/* 3 — the track, and the one copper control on it. */}
      <div data-light="" className="full relative z-10 row-start-3 h-[72px]">
        <Led at="mid" />
        <div className="shell relative h-full">
          <div className="absolute left-gutter top-1/2 -translate-y-1/2 lg:left-1/2 lg:-translate-x-full lg:pr-12">
            <Action href="/start-project" variant="signal">
              {h.ctaContact}
            </Action>
          </div>
        </div>
      </div>

      {/* 4 — under the track: the reflection in the floor, then the line and
             the way to the work. */}
      <div className="relative z-10 row-start-4 lg:w-1/2 lg:pr-12">
        <span aria-hidden className="reflect display absolute left-0 top-0 max-w-[7.6ch] text-d-l text-ink">
          {h.titleMain} <span className="block">{h.titleAccent}</span>
        </span>
        <p className="relative mt-7 max-w-[34ch] text-[15px] leading-[1.7] text-ink-2">{h.sub}</p>
        <Link
          href="/work"
          className="group relative mt-8 inline-flex min-h-[44px] items-center gap-4 text-[12px]
                     uppercase tracking-[0.2em] text-ink hover:text-copper"
        >
          {h.ctaWork}
          <span
            aria-hidden
            className="h-px w-10 origin-left bg-edge-2 transition-transform duration-300 ease-out
                       group-hover:scale-x-150 group-hover:bg-copper"
          />
          <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

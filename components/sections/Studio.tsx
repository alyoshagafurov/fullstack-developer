'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 05 — About.
 *
 * Composition: the portrait holds the left half at full height and bleeds past
 * the grid to the page edge — it is the subject of the spread, not an
 * illustration beside text. "About" is set vertically down the gutter between
 * photograph and copy, so the two halves are stitched by type rather than by a
 * border. The prose sits high and narrow on the right; the facts drop to the
 * bottom of the column as a mono ledger.
 *
 * The photograph is used exactly as shot — no filter, no retouch, no recolour.
 * A single low scrim on its outer edge blends it into the matte black; the
 * face is never touched by it.
 */
export default function Studio() {
  const { t } = useI18n();
  const a = t.about;

  return (
    <section id="studio" className="relative beat-wide overflow-x-clip">
      <Shell>
        <div className="grid-12 gap-y-14 items-start">
          {/* ── The portrait — bleeds to the left page edge ───────────── */}
          <Reveal className="col-span-12 lg:col-span-6 relative">
            <div className="relative lg:-ml-[calc((100vw-100%)/2)] lg:w-[calc(100%+((100vw-100%)/2))]">
              {/* 3:2 is the source ratio — the photograph is shown whole,
                  uncropped and ungraded, exactly as it was shot. */}
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src="/about-portrait-dark-office.jpg"
                  alt="Алишер Гафуров — портрет"
                  fill
                  quality={92}
                  sizes="(max-width:1024px) 100vw, 52vw"
                  className="object-cover object-center"
                />
                {/* blends the outer edge into the page, never across the face */}
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1/4 pointer-events-none hidden lg:block"
                  style={{ background: 'linear-gradient(90deg, rgba(12,13,15,0.85) 0%, transparent 100%)' }}
                />
              </div>
            </div>
          </Reveal>

          {/* ── "About" set vertically in the gutter ──────────────────── */}
          <div className="hidden lg:flex col-span-1 justify-center pt-6" aria-hidden>
            <span
              className="display text-[clamp(2rem,3.4vw,3.6rem)] leading-none text-surface-high select-none"
              style={{ writingMode: 'vertical-rl' }}
            >
              About
            </span>
          </div>

          {/* ── Copy, high and narrow ─────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-5">
            <Reveal>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
                05 / {a.eyebrow}
              </span>
              <h2 className="display text-d-m text-ink mt-6 mb-9 max-w-[15ch]">{a.title}</h2>
              <div className="space-y-5 max-w-md">
                <p className="text-body text-ink-2">{a.p1}</p>
                <p className="text-body text-ink-2">{a.p2}</p>
                <p className="text-body text-ink-3">{a.p3}</p>
              </div>
            </Reveal>

            {/* the ledger */}
            <Reveal delay={1}>
              <dl className="mt-12 border-t border-line">
                {a.facts.map((f) => (
                  <div
                    key={f.k}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                  >
                    <dt className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-3">
                      {f.k}
                    </dt>
                    <dd className="text-body text-ink text-right">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}

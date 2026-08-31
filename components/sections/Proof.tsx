'use client';

import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { projects } from '@/lib/projects';
import { useI18n } from '@/lib/i18n';

/*
 * 08 — Proof.
 *
 * Composition: one outcome pulled to display scale as the section's statement,
 * attributed the way a magazine credits a photograph — project, type, year, in
 * mono, under a rule. The remaining outcomes follow as a quiet ledger, and the
 * numbers close the section staggered across the grid.
 *
 * NOTE ON CONTENT: the dictionary's `testimonials` entries are placeholders
 * (the previous implementation carried a TODO to replace them with real client
 * reviews). Rendering them would be inventing social proof, so this section is
 * built from facts that are actually verifiable — outcomes of shipped projects
 * that each have a live URL. When real, attributable reviews exist, a quote
 * drops into the statement slot and the outcomes move down.
 */
export default function Proof() {
  const { t } = useI18n();

  const outcomes = projects
    .map((p) => ({ meta: p, case: t.cases[p.slug] }))
    .filter((o) => o.case?.result?.value);

  const [lead, ...rest] = outcomes;

  return (
    <section id="proof" className="relative beat">
      <Shell>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
          08 / {t.testimonials.eyebrow}
        </span>

        {/* ── the statement ─────────────────────────────────────────── */}
        {lead && (
          <Reveal>
            <figure className="mt-10 md:mt-14 grid-12 gap-y-8 items-end">
              <blockquote className="col-span-12 lg:col-span-8">
                <p className="display text-d-l text-ink leading-[1.02]">
                  {lead.case.result.value}
                </p>
                <p className="text-lead text-ink-2 mt-6 max-w-lg">{lead.case.result.label}</p>
              </blockquote>

              <figcaption className="col-span-12 lg:col-span-3 lg:col-start-10 border-t border-line pt-5">
                <dl className="space-y-3">
                  {[
                    ['Project', lead.case.title],
                    ['Type', lead.case.category],
                    ['Year', lead.meta.year],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4">
                      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-3">
                        {k}
                      </dt>
                      <dd className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-2 text-right">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </figcaption>
            </figure>
          </Reveal>
        )}

        {/* ── the ledger of remaining outcomes ──────────────────────── */}
        {rest.length > 0 && (
          <ul className="mt-rhythm-s border-t border-line">
            {rest.map((o, i) => (
              <Reveal as="li" key={o.meta.slug} delay={i % 3} className="group border-b border-line">
                <div className="grid-12 items-baseline gap-y-2 py-6 md:py-8">
                  <span className="col-span-3 md:col-span-2 display text-d-s text-ink">
                    {o.case.result.value}
                  </span>
                  <p className="col-span-9 md:col-span-6 text-body text-ink-2">
                    {o.case.result.label}
                  </p>
                  <span className="col-span-12 md:col-span-3 md:col-start-10 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3 md:text-right">
                    {o.case.title}
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        )}

        {/* ── the numbers, staggered ────────────────────────────────── */}
        <div className="grid-12 gap-y-12 mt-rhythm-s">
          {t.stats.items.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i}
              className={`col-span-6 md:col-span-3 ${i % 2 ? 'md:pt-12' : ''}`}
            >
              <div className="display text-d-m text-ink tabular-nums">
                {s.value}
                <span className="text-signal">{s.suffix}</span>
              </div>
              <p className="text-micro text-ink-3 mt-3 max-w-[18ch]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

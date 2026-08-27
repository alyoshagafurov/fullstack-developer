'use client';

import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 07 — Proof.
 *
 * Composition: numbers first, at display scale, staggered down the grid so
 * they read as a chart rather than a stat bar. One testimonial is then pulled
 * out large as a quotation — the rest are set small underneath as attribution
 * lines, which keeps the section from becoming a wall of equal quote cards.
 */
export default function Proof() {
  const { t } = useI18n();
  const [lead, ...rest] = t.testimonials.items;

  return (
    <section id="proof" className="relative py-rhythm-m">
      <Shell>
        <Meta rule className="mb-14">07 — {t.testimonials.eyebrow}</Meta>

        {/* numbers, staggered */}
        <div className="grid-12 gap-y-12 mb-24 md:mb-32">
          {t.stats.items.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i}
              className={`col-span-6 md:col-span-3 ${i % 2 ? 'md:pt-14' : ''}`}
            >
              <div className="display text-d-m text-ink tabular-nums">
                {s.value}
                <span className="text-signal">{s.suffix}</span>
              </div>
              <p className="text-micro text-ink-3 mt-3 max-w-[18ch]">{s.label}</p>
            </Reveal>
          ))}
        </div>

        {/* the pulled quotation */}
        {lead && (
          <Reveal className="grid-12">
            <blockquote className="col-span-12 md:col-span-9">
              <p className="display text-d-m text-ink leading-[1.18]">
                <span className="text-signal" aria-hidden>“</span>
                {lead.text}
                <span className="text-signal" aria-hidden>”</span>
              </p>
              <footer className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-3">
                {lead.name} — {lead.role}
              </footer>
            </blockquote>
          </Reveal>
        )}

        {/* the rest, as quiet attribution */}
        {rest.length > 0 && (
          <ul className="mt-20 grid-12 gap-y-10 border-t border-line pt-10">
            {rest.map((r, i) => (
              <Reveal as="li" key={r.name} delay={i} className="col-span-12 md:col-span-4">
                <p className="text-body text-ink-2 mb-4">{r.text}</p>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">
                  {r.name} — {r.role}
                </p>
              </Reveal>
            ))}
          </ul>
        )}
      </Shell>
    </section>
  );
}

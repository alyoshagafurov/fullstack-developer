'use client';

import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 03 — Capabilities.
 *
 * Composition: an uneven editorial grid. Each capability claims a different
 * span and a different starting column, so the eye moves diagonally instead of
 * scanning a matrix. No borders, no cards — separation comes from whitespace
 * and a single hairline above each entry.
 */

/* span / start, per index — the asymmetry is authored, not random. */
const PLACEMENT = [
  'md:col-span-7',
  'md:col-span-4 md:col-start-9',
  'md:col-span-5',
  'md:col-span-6 md:col-start-7',
  'md:col-span-4',
  'md:col-span-5 md:col-start-6',
];

export default function Capabilities() {
  const { t } = useI18n();

  return (
    <section id="capabilities" className="relative py-rhythm-m bg-base-deep">
      <Shell>
        <div className="grid-12 mb-16 md:mb-24">
          <div className="col-span-12 md:col-span-6">
            <Meta rule className="mb-6">03 — {t.services.eyebrow}</Meta>
            <h2 className="display text-d-l text-ink">{t.services.title}</h2>
          </div>
          <p className="col-span-12 md:col-span-4 md:col-start-9 text-body text-ink-2 self-end mt-6 md:mt-0">
            {t.services.sub}
          </p>
        </div>

        <div className="grid-12 gap-y-14 md:gap-y-24">
          {t.services.items.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i % 3}
              className={`col-span-12 ${PLACEMENT[i % PLACEMENT.length]}`}
            >
              <div className="border-t border-line pt-6">
                <span className="font-mono text-[0.6875rem] text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display text-d-s text-ink mt-4 mb-3">{s.title}</h3>
                <p className="text-body text-ink-2 max-w-sm mb-6">{s.body}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {s.tags.map((tag) => (
                    <li key={tag} className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

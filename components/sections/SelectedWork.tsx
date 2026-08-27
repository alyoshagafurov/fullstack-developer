'use client';

import { ArrowUpRight } from 'lucide-react';
import Shell from '@/components/ui/Shell';
import Meta from '@/components/ui/Meta';
import Reveal from '@/components/ui/Reveal';
import { projects } from '@/lib/projects';
import { useI18n } from '@/lib/i18n';

/*
 * 02 — Selected work.
 *
 * Composition: an editorial index, not a gallery. Each project is a full-width
 * row on a hairline — index, name at display scale, category, year — and the
 * row itself is the link. Alternating indentation keeps the column of names
 * off a single hard edge.
 *
 * Type carries this section on purpose: the owner removed the old project
 * screenshots. When new ones exist, a Frame drops into the right of each row
 * without changing this structure.
 */
export default function SelectedWork() {
  const { t } = useI18n();

  return (
    <section id="work" className="relative py-rhythm-l">
      <Shell>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <Meta rule className="mb-6">02 — {t.work.eyebrow}</Meta>
            <h2 className="display text-d-l text-ink max-w-[10ch]">{t.work.title}</h2>
          </div>
          <p className="text-body text-ink-2 max-w-xs">{t.work.sub}</p>
        </div>
      </Shell>

      <Shell>
        <ul className="border-t border-line">
          {projects.map((p, i) => {
            const c = t.cases[p.slug];
            if (!c) return null;
            return (
              <Reveal as="li" key={p.slug} delay={i} className="border-b border-line">
                <a
                  href={p.liveUrl ?? '#start'}
                  {...(p.liveUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group grid-12 items-baseline gap-y-3 py-8 md:py-11 transition-colors"
                >
                  <span className="col-span-2 md:col-span-1 font-mono text-[0.6875rem] text-ink-3 group-hover:text-signal transition-colors pt-2">
                    {p.index}
                  </span>

                  <h3
                    className={`col-span-10 md:col-span-6 display text-d-m text-ink-2 group-hover:text-ink transition-colors ${
                      i % 2 ? 'md:pl-[8%]' : ''
                    }`}
                  >
                    {c.title}
                  </h3>

                  <span className="col-span-8 md:col-span-3 text-micro text-ink-3">{c.category}</span>

                  <span className="col-span-4 md:col-span-2 flex items-baseline justify-end gap-4">
                    <span className="font-mono text-[0.6875rem] text-ink-3">{p.year}</span>
                    <ArrowUpRight
                      size={18}
                      aria-hidden
                      className="text-ink-3 group-hover:text-signal group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                    />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </Shell>
    </section>
  );
}

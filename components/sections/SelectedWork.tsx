'use client';

import { ArrowUpRight } from 'lucide-react';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { projects } from '@/lib/projects';
import { useI18n } from '@/lib/i18n';

/*
 * 02 — Selected work.
 *
 * A visual story, not a card grid. The first three projects each get their own
 * composition and their own scale; the remainder close the section as a
 * compact index. Nothing shares a layout with anything else.
 *
 *   01  full width, giant name, the outcome set as a large typographic plate
 *   02  offset right, metadata column pushed left, medium scale
 *   03  mirrored — name left, narrow description column far right
 *   04+ compact index rows, smallest scale
 *
 * There are no project screenshots in the repository (the owner removed them),
 * so the large visual object in each composition is typographic. When real
 * screenshots exist they drop into the reserved space beside 01 and above 02
 * without changing this structure.
 *
 * Motion is transform/opacity only: the name shifts a few pixels, the index
 * takes the signal colour, the arrow travels. Nothing loops.
 */

export default function SelectedWork() {
  const { t } = useI18n();
  const [lead, second, third, ...restProjects] = projects;

  const linkProps = (url?: string) =>
    url ? { href: url, target: '_blank' as const, rel: 'noopener noreferrer' } : { href: '#start' };

  const leadCase = t.cases[lead.slug];
  const secondCase = t.cases[second.slug];
  const thirdCase = t.cases[third.slug];

  return (
    <section id="work" className="relative beat-wide overflow-x-clip">
      {/* ── Section head ──────────────────────────────────────────────── */}
      <Shell>
        <div className="grid-12 items-end gap-y-6 mb-20 md:mb-28">
          <div className="col-span-12 md:col-span-7">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
              02 / {t.work.eyebrow}
            </span>
            <h2 className="display text-d-l text-ink mt-6 max-w-[11ch]">{t.work.title}</h2>
          </div>
          <p className="col-span-12 md:col-span-4 md:col-start-9 text-body text-ink-2">
            {t.work.sub}
          </p>
        </div>
      </Shell>

      {/* ── 01 — the lead project ─────────────────────────────────────── */}
      {leadCase && (
        <Reveal>
          <Shell>
            <a {...linkProps(lead.liveUrl)} className="group block">
              <div className="flex items-baseline gap-5 mb-5">
                <span className="font-mono text-[0.6875rem] text-signal">{lead.index}</span>
                <span className="h-px flex-1 bg-line group-hover:bg-signal/40 transition-colors duration-300" />
                <span className="font-mono text-[0.6875rem] text-ink-3">{lead.year}</span>
              </div>

              <h3 className="display text-d-l text-ink transition-transform duration-500 ease-out group-hover:translate-x-2 max-w-[16ch]">
                {leadCase.title}
              </h3>

              <div className="grid-12 gap-y-10 mt-10">
                {/* the outcome, set as a plate — the section's largest object */}
                <div className="col-span-12 lg:col-span-6 flex flex-col justify-between gap-12 lg:gap-14 lg:min-h-[22rem] bg-surface/70 border border-line group-hover:border-signal/30 transition-colors duration-500 p-8 md:p-12">
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-3">
                    {leadCase.category}
                  </span>
                  <div>
                    <p className="display text-d-m text-ink leading-[1.05]">
                      {leadCase.result.value}
                    </p>
                    <p className="text-body text-ink-2 mt-4 max-w-sm">{leadCase.result.label}</p>
                  </div>
                </div>

                {/* description + stack, dropped and offset */}
                <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-16">
                  <p className="text-lead text-ink-2 max-w-md">{leadCase.summary}</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-8">
                    {leadCase.stack.map((s) => (
                      <li key={s} className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-2 mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-2 group-hover:text-signal transition-colors">
                    {t.work.open}
                    <ArrowUpRight
                      size={15}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </a>
          </Shell>
        </Reveal>
      )}

      {/* ── 02 — offset right, metadata pushed left ───────────────────── */}
      {secondCase && (
        <Reveal>
          <Shell className="mt-rhythm-m">
            <a {...linkProps(second.liveUrl)} className="group grid-12 gap-y-8 items-start">
              <div className="col-span-12 lg:col-span-3 flex lg:flex-col gap-5 lg:gap-3 items-baseline">
                <span className="font-mono text-[0.6875rem] text-signal">{second.index}</span>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">
                  {secondCase.category}
                </span>
                <span className="font-mono text-[0.625rem] text-ink-3 lg:mt-2">{second.year}</span>
              </div>

              <div className="col-span-12 lg:col-span-8 lg:col-start-5">
                <h3 className="display text-d-m text-ink transition-transform duration-500 ease-out group-hover:translate-x-2">
                  {secondCase.title}
                </h3>
                <div className="mt-6 border-t border-line group-hover:border-line-2 transition-colors duration-500 pt-6 max-w-xl">
                  <p className="text-body text-ink-2">{secondCase.summary}</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
                    {secondCase.stack.map((s) => (
                      <li key={s} className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </a>
          </Shell>
        </Reveal>
      )}

      {/* ── 03 — mirrored: name left, narrow column far right ─────────── */}
      {thirdCase && (
        <Reveal>
          <Shell className="mt-rhythm-m">
            <a {...linkProps(third.liveUrl)} className="group grid-12 gap-y-8 items-end">
              <div className="col-span-12 lg:col-span-6">
                <div className="flex items-baseline gap-5 mb-6">
                  <span className="font-mono text-[0.6875rem] text-signal">{third.index}</span>
                  <span className="font-mono text-[0.625rem] text-ink-3">{third.year}</span>
                </div>
                <h3 className="display text-d-m text-ink transition-transform duration-500 ease-out group-hover:translate-x-2 max-w-[12ch]">
                  {thirdCase.title}
                </h3>
              </div>

              <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:border-l lg:border-line lg:pl-8 transition-colors duration-500 group-hover:lg:border-signal/30">
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">
                  {thirdCase.category}
                </span>
                <p className="text-body text-ink-2 mt-4">{thirdCase.summary}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-6">
                  {thirdCase.stack.map((s) => (
                    <li key={s} className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </a>
          </Shell>
        </Reveal>
      )}

      {/* ── 04+ — the index closes the section, smallest scale ────────── */}
      {restProjects.length > 0 && (
        <Shell className="mt-rhythm-m">
          <ul className="border-t border-line">
            {restProjects.map((p, i) => {
              const c = t.cases[p.slug];
              if (!c) return null;
              return (
                <Reveal as="li" key={p.slug} delay={i} className="border-b border-line">
                  <a
                    {...linkProps(p.liveUrl)}
                    className="group grid-12 items-baseline gap-y-2 py-7 md:py-9"
                  >
                    <span className="col-span-2 md:col-span-1 font-mono text-[0.6875rem] text-ink-3 group-hover:text-signal transition-colors">
                      {p.index}
                    </span>
                    <h3 className="col-span-10 md:col-span-5 display text-d-s text-ink-2 group-hover:text-ink transition-colors">
                      {c.title}
                    </h3>
                    <span className="col-span-8 md:col-span-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">
                      {c.category}
                    </span>
                    <span className="col-span-4 md:col-span-2 flex items-baseline justify-end gap-4">
                      <span className="font-mono text-[0.625rem] text-ink-3">{p.year}</span>
                      <ArrowUpRight
                        size={16}
                        aria-hidden
                        className="text-ink-3 group-hover:text-signal transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </ul>
        </Shell>
      )}
    </section>
  );
}

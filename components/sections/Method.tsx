'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';

import Panel, { Led } from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Process — the steps as segments of one track.
 *
 * From md up the seven steps sit on a single LED track, each holding a
 * segment whose length is its share of a project, and the segment being
 * read is the one held on. Its text appears in the readout below, beside
 * the workspace photograph. Below md the steps are simply listed in full.
 *
 * The dictionary carries no durations and none are claimed on screen. The
 * weights only give the track the proportions of a real project — the build
 * is the long stretch, the launch is short, support is open-ended — instead
 * of seven equal boxes. A step beyond the seventh takes the last weight.
 *
 * The segments are tabs: arrow keys move along the track, focus selects.
 * Between md and lg the segments carry only their number — the short ones
 * have no room for a word — and the readout names the step.
 */
const WEIGHTS = [1, 1.4, 2, 4, 1.4, 1, 2];

export default function Method() {
  const { t } = useI18n();
  const steps = t.process.steps;
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const current = steps[Math.min(active, steps.length - 1)];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = steps.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const columns = steps
    .map((_, i) => `${WEIGHTS[Math.min(i, WEIGHTS.length - 1)]}fr`)
    .join(' ');

  return (
    <section id="process" className="beat relative scroll-mt-20">
      <Shell>
        <Rail count={String(steps.length).padStart(2, '0')}>
          <h2 className="display m-0 text-d-m text-ink">{t.process.title}</h2>
        </Rail>
        <p className="m-0 mt-5 max-w-[52ch] text-[14px] leading-[1.6] text-ink-2">{t.process.sub}</p>

        {/* ── The track ─────────────────────────────────────────────── */}
        <Reveal className="mt-12 hidden md:block">
          <div role="tablist" aria-label={t.process.title} className="grid" style={{ gridTemplateColumns: columns }}>
            {steps.map((step, i) => {
              const on = i === active;
              return (
                <button
                  key={step.n}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${id}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  data-light=""
                  className={`lit relative min-h-[92px] px-3 pb-3 pt-5 text-left ${
                    on ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  <Led className={on ? 'led-on' : 'led-flat'} />
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 h-3 w-px ${on ? 'bg-led' : 'bg-edge-2'}`}
                  />
                  <span className="block text-[11px] tabular-nums tracking-[0.16em]">{step.n}</span>
                  <span className="mt-2 hidden text-[13px] font-medium leading-tight lg:block">{step.t}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-12">
            <Panel
              tone="raised"
              role="tabpanel"
              id={`${id}-panel`}
              aria-labelledby={`${id}-tab-${active}`}
              tabIndex={0}
              className="px-7 py-8 md:px-9 md:py-9 lg:col-span-7"
            >
              <span className="display text-[13px] text-copper tabular-nums">{current.n}</span>
              <h3 className="display mt-3 text-d-s text-ink">{current.t}</h3>
              <p className="m-0 mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-ink-2">{current.d}</p>
            </Panel>
            <Panel edge="none" className="relative min-h-[240px] overflow-hidden lg:col-span-5">
              <Image
                src="/workspace-detail.jpg"
                alt="Рабочий стол поздним вечером"
                fill
                sizes="(max-width:1024px) 100vw, 40vw"
                className="object-cover"
              />
            </Panel>
          </div>
        </Reveal>

        {/* ── Below md: the steps in full ───────────────────────────── */}
        <ol className="m-0 mt-10 grid list-none gap-2 p-0 md:hidden">
          {steps.map((step) => (
            <Panel as="li" key={step.n} className="px-5 py-5">
              <span className="display text-[12px] text-ink-3 tabular-nums">{step.n}</span>
              <h3 className="m-0 mt-2 text-[16px] font-medium leading-tight text-ink">{step.t}</h3>
              <p className="m-0 mt-2 text-[14px] leading-[1.6] text-ink-2">{step.d}</p>
            </Panel>
          ))}
        </ol>
      </Shell>
    </section>
  );
}

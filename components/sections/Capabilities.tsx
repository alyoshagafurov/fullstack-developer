'use client';

import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 03 — Capabilities.
 *
 * A typographic system, not a grid. Each capability is a full-width rule with
 * its number, its name set as a graphic object, and a description that is
 * present in the document at all times but only *visible* on hover or keyboard
 * focus — so the list reads as a clean index until you interrogate it.
 *
 * The reveal animates opacity and transform only: the description keeps its
 * space in the layout, so nothing reflows and there is no CLS. Below `lg` the
 * description is simply always visible — hover is not a thing on touch, and
 * hiding content behind it would be a trap.
 */
export default function Capabilities() {
  const { t } = useI18n();

  return (
    <section id="capabilities" className="relative py-rhythm-m bg-base-deep">
      <Shell>
        <div className="grid-12 items-end gap-y-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-7">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
              03 / {t.services.eyebrow}
            </span>
            <h2 className="display text-d-l text-ink mt-6 max-w-[12ch]">{t.services.title}</h2>
          </div>
          <p className="col-span-12 md:col-span-4 md:col-start-9 text-body text-ink-2">
            {t.services.sub}
          </p>
        </div>

        <ul className="border-t border-line">
          {t.services.items.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i % 3}
              className="group border-b border-line"
            >
              {/* focus-within keeps the reveal reachable from the keyboard */}
              <div
                tabIndex={0}
                className="grid-12 items-baseline gap-y-4 py-8 md:py-10 outline-none
                           focus-visible:ring-1 focus-visible:ring-signal/60 focus-visible:ring-offset-4
                           focus-visible:ring-offset-base-deep"
              >
                <span className="col-span-2 md:col-span-1 font-mono text-[0.6875rem] text-ink-3 transition-colors duration-300 group-hover:text-signal group-focus-within:text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <h3 className="col-span-10 md:col-span-5 display text-d-s text-ink-2 transition-all duration-500 ease-out group-hover:text-ink group-hover:translate-x-1.5 group-focus-within:text-ink group-focus-within:translate-x-1.5">
                  {s.title}
                </h3>

                {/* Always in the DOM; revealed on hover / focus from lg up. */}
                <div
                  className="col-span-12 md:col-span-6 lg:opacity-0 lg:translate-y-1
                             transition-[opacity,transform] duration-500 ease-out
                             group-hover:lg:opacity-100 group-hover:lg:translate-y-0
                             group-focus-within:lg:opacity-100 group-focus-within:lg:translate-y-0"
                >
                  <p className="text-body text-ink-2 max-w-md">{s.body}</p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                    {s.tags.map((tag) => (
                      <li
                        key={tag}
                        className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </Shell>
    </section>
  );
}

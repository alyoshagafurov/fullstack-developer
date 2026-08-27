'use client';

import Shell from '@/components/ui/Shell';
import Action from '@/components/ui/Action';
import { useI18n } from '@/lib/i18n';

/*
 * 08 — Start a project.
 *
 * Composition: the one inverted moment on the page. After eight screens of
 * deep canvas, the light block lands like a page turn and makes the signal
 * colour on the button the loudest thing on the site — which is exactly where
 * the conversion is.
 *
 * The channels sit under a rule as a mono list, not as icon buttons.
 */
export default function StartProject() {
  const { t } = useI18n();
  const c = t.contact;

  return (
    <section id="start" className="relative bg-ink text-base py-rhythm-m">
      <Shell grid className="gap-y-14 items-start">
        <div className="col-span-12 md:col-span-7">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-base/50">
            08 — {c.eyebrow}
          </span>
          <h2 className="display text-d-l mt-6 max-w-[13ch]">
            {c.title1} <span className="text-base/45">{c.title2}</span>
          </h2>
          <p className="text-body text-base/70 mt-7 max-w-sm">{c.sub}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Action href="#top" variant="signal">{t.nav.cta}</Action>
          </div>
        </div>

        <ul className="col-span-12 md:col-span-4 md:col-start-9 border-t border-base/15">
          {c.channels.map((ch) => (
            <li key={ch.label} className="border-b border-base/15">
              <a
                href={ch.href}
                {...(ch.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-baseline justify-between gap-4 py-4"
              >
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-base/45">
                  {ch.label}
                </span>
                <span className="text-body text-base group-hover:text-signal-deep transition-colors">
                  {ch.value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}

'use client';

import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Capabilities — a bento grid of services.
 *
 * Was a column of hairline-separated rows with an enormous serif numeral
 * carrying the scale. The references do not work that way: they hold
 * information in soft-cornered blocks on a dark field, close together, and let
 * the grid rather than the type do the organising. So each service is a panel
 * and the numeral drops to a quiet index in the corner.
 *
 * The first panel spans two columns. A grid of identical cells has no entry
 * point, and the first capability is the one worth reading first.
 */
export default function Capabilities() {
  const { t } = useI18n();

  return (
    <section id="capabilities" className="relative beat">
      <Shell>
        <header className="mb-8 flex items-baseline justify-between gap-6 md:mb-10">
          <div>
            <span className="label">{t.services.eyebrow}</span>
            <h2 className="display text-d-s text-ink mt-3">{t.services.title}</h2>
          </div>
          <span className="label text-ink-3 shrink-0">
            {String(t.services.items.length).padStart(2, '0')}
          </span>
        </header>

        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((service, index) => (
            <Reveal
              as="li"
              key={service.title}
              delay={index % 3}
              className={index === 0 ? 'sm:col-span-2' : undefined}
            >
              <Panel className="group h-full p-6 transition-colors duration-200 hover:border-line-2 md:p-7">
                <span
                  aria-hidden
                  className="font-mono text-[11px] tracking-[0.16em] text-ink-3
                             transition-colors duration-200 group-hover:text-ink-2"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3 className="mb-2 mt-4 text-[17px] font-medium leading-tight tracking-tight text-ink">
                  {service.title}
                </h3>

                <p className="m-0 text-[14px] leading-[1.6] text-ink-2">{service.body}</p>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Shell>
    </section>
  );
}

'use client';

import Shell from '@/components/ui/Shell';
import Logo from '@/components/ui/Logo';
import Action from '@/components/ui/Action';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 09 — Start a project. The last page of the story.
 *
 * Composition: it answers the Hero. The opening set the name at display scale
 * over a photograph on matte black; the close sets the invitation at the same
 * scale over nothing at all — the page empties out, and the only things left
 * are the words, the wordmark and one turquoise action.
 *
 * Deliberately no inverted light block here: after eight sections of black,
 * the finale is stronger as silence than as a flashbulb. The signal colour on
 * the single button is the loudest thing on the page because everything around
 * it is quiet.
 */
export default function StartProject() {
  const { t } = useI18n();
  const c = t.contact;

  return (
    <section id="start" className="relative py-rhythm-l overflow-x-clip">
      {/* the same dotted field that opens the site, mirrored to the left */}
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute left-0 bottom-0 h-[40vh] w-[52vw] opacity-20
                   [mask-image:radial-gradient(70%_70%_at_10%_90%,#000,transparent)]"
      />

      <Shell className="relative">
        <Reveal>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-3">
            09 / {c.eyebrow}
          </span>
        </Reveal>

        <Reveal delay={1}>
          {/* Russian copy wraps, so this holds a safe leading rather than the
              token's tight display value — collided descenders otherwise. */}
          <h2 className="display text-d-l text-ink mt-10 leading-[1.04] max-w-[16ch]">
            {c.title1}
            <br />
            <span className="text-ink-2">{c.title2}</span>
          </h2>
        </Reveal>

        <div className="grid-12 gap-y-12 items-end mt-16 md:mt-24">
          <Reveal delay={2} className="col-span-12 lg:col-span-5">
            <p className="text-lead text-ink-2 max-w-sm mb-10">{c.sub}</p>
            <Action href="#top" variant="signal">{t.nav.cta}</Action>
          </Reveal>

          {/* channels as a mono ledger, aligned to the right margin */}
          <Reveal delay={3} className="col-span-12 lg:col-span-5 lg:col-start-8">
            <ul className="border-t border-line">
              {c.channels.map((ch) => (
                <li key={ch.label} className="border-b border-line">
                  <a
                    href={ch.href}
                    {...(ch.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="group flex items-baseline justify-between gap-4 py-4"
                  >
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-3">
                      {ch.label}
                    </span>
                    <span className="text-body text-ink-2 group-hover:text-signal transition-colors">
                      {ch.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* the wordmark signs off the story */}
        <Reveal delay={4}>
          <div className="mt-rhythm-s flex items-center gap-6">
            <Logo className="h-6 md:h-8 w-auto opacity-80" />
            <span aria-hidden className="h-px flex-1 bg-line" />
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-3">
              Dushanbe · Tajikistan
            </span>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

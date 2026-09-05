'use client';

import Action from '@/components/ui/Action';
import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Start a project — the close.
 *
 * One wide raised panel: the invitation, the copper control, and the four
 * channels as a ledger beside it. Hovering a channel lights the line under
 * its row. The action is the brightest thing here because everything around
 * it is a line.
 */
export default function StartProject() {
  const { t } = useI18n();
  const c = t.contact;

  return (
    <section id="start" className="beat relative scroll-mt-20">
      <Shell>
        <Rail>
          <h2 className="display m-0 max-w-[16ch] text-d-l text-ink">
            {c.title1}{' '}
            <br />
            <span className="text-ink-2">{c.title2}</span>
          </h2>
        </Rail>
        <Reveal className="mt-8">
          <Panel
            tone="raised"
            className="grid gap-10 px-6 py-9 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-7">
              <p className="m-0 max-w-[44ch] text-[15px] leading-[1.7] text-ink-2">{c.sub}</p>
              <div className="mt-8">
                <Action href="/start-project" variant="signal">
                  {t.nav.cta}
                </Action>
              </div>
            </div>

            <ul className="m-0 list-none self-end p-0 lg:col-span-5">
              {c.channels.map((channel, index) => (
                <li key={channel.label} className={index > 0 ? 'border-t border-edge' : ''}>
                  <a
                    href={channel.href}
                    {...(channel.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="lnk group flex min-h-[48px] items-baseline justify-between gap-4 py-3"
                  >
                    <span className="label">{channel.label}</span>
                    <span className="text-[14px] text-ink-2 group-hover:text-ink">{channel.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </Shell>
    </section>
  );
}

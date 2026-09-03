'use client';

import Action from '@/components/ui/Action';
import Logo from '@/components/ui/Logo';
import Panel from '@/components/ui/Panel';
import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * Start a project — the close.
 *
 * It still answers the hero: the opening sets the name at display scale inside
 * a panel, and this sets the invitation at the same scale inside another. What
 * changes is that the finale is no longer an empty page. In a bento layout an
 * un-panelled block does not read as deliberate silence — it reads as a
 * section someone forgot to finish.
 *
 * So the invitation is one wide panel and the channels sit beside it as a
 * ledger. The action keeps its solid fill and is the brightest thing here,
 * because everything around it is a hairline.
 */
export default function StartProject() {
  const { t } = useI18n();
  const c = t.contact;

  return (
    <section id="start" className="relative beat overflow-x-clip">
      <Shell className="relative">
        <div className="grid gap-3 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Panel className="flex h-full flex-col justify-between p-6 md:p-9">
              <div>
                <span className="label">{c.eyebrow}</span>
                {/* Russian copy wraps, so this holds a safe leading rather than
                    the token's tight display value — descenders collided. */}
                <h2 className="display text-d-m text-ink mt-4 max-w-[16ch] leading-[1.06]">
                  {c.title1}
                  <br />
                  <span className="text-ink-2">{c.title2}</span>
                </h2>
              </div>

              <div className="mt-10">
                <p className="mb-7 max-w-sm text-[15px] leading-[1.65] text-ink-2">{c.sub}</p>
                <Action href="/start-project" variant="signal">
                  {t.nav.cta}
                </Action>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={1} className="lg:col-span-5">
            <Panel className="h-full px-6 py-2 md:px-7">
              <ul className="m-0 list-none p-0">
                {c.channels.map((channel) => (
                  <li key={channel.label} className="border-b border-line last:border-b-0">
                    <a
                      href={channel.href}
                      {...(channel.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="group flex min-h-[44px] items-baseline justify-between gap-4 py-4"
                    >
                      <span className="label text-[10px]">{channel.label}</span>
                      <span className="text-[14px] text-ink-2 transition-colors group-hover:text-ink">
                        {channel.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        </div>

        {/* The wordmark signs off the story. */}
        <Reveal delay={2}>
          <div className="mt-10 flex items-center gap-6">
            <Logo className="h-9 w-auto opacity-90 md:h-11" />
            <span aria-hidden className="h-px flex-1 bg-line" />
            <span className="label text-[10px]">Dushanbe · Tajikistan</span>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

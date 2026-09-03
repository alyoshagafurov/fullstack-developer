'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/ui/Logo';
import Action from '@/components/ui/Action';
import { useI18n } from '@/lib/i18n';

/*
 * Site chrome.
 *
 * The site is one continuous composition now, so navigation points at
 * positions in the story rather than at routes. It stays out of the way:
 * transparent over the opening, then a hairline and a blur once you leave it.
 */

/*
 * Absolute hrefs, not bare fragments.
 *
 * The header now renders on /work and /work/[slug] as well as the landing, and
 * a bare `#capabilities` there points at a section that lives on another page
 * — it would scroll nowhere. Prefixing with `/` makes each link mean the same
 * thing from anywhere on the site.
 *
 * Work is a route rather than a fragment at all: the case register moved off
 * the landing page and has its own address now.
 */
const SECTIONS = [
  { href: '/work', key: 'work' as const },
  { href: '/#services', key: 'services' as const },
  { href: '/#studio', key: 'about' as const },
  { href: '/#process', key: 'process' as const },
  { href: '/#start', key: 'contact' as const },
];

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-out ${
        lifted ? 'bg-base/80 backdrop-blur-xl border-b border-line' : 'border-b border-transparent'
      }`}
    >
      <div className="shell h-16 md:h-20 flex items-center justify-between gap-6">
        {/* The wordmark, with the one dot of colour on the page beside it. The
            logo itself is the owner's own file and is never redrawn as text —
            the dot is set next to it rather than baked into it. */}
        <a
          href="/#top"
          aria-label="ALY"
          className="inline-flex min-h-[44px] shrink-0 items-baseline gap-[3px] opacity-90 transition-opacity hover:opacity-100"
        >
          <Logo priority className="h-[15px] w-auto md:h-4" />
          <span aria-hidden className="text-copper text-[15px] leading-none md:text-base">
            .
          </span>
        </a>

        {/* Small, thin and evenly spaced — the numbering is gone. Numbered
            items read as a table of contents, which competes with the hero
            instead of getting out of its way. */}
        <nav className="hidden items-center gap-7 md:flex lg:gap-10" aria-label="Разделы">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="inline-flex min-h-[44px] items-center whitespace-nowrap py-3 text-[11px]
                         uppercase tracking-[0.18em] text-ink-3 transition-colors hover:text-ink"
            >
              {t.nav[s.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden xs:flex items-center gap-1" role="group" aria-label="Язык">
            {(['ru', 'tg', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`font-mono text-[0.625rem] uppercase tracking-[0.14em] px-2 min-h-[44px] inline-flex items-center transition-colors ${
                  lang === l ? 'text-signal' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Action href="/start-project" variant="ghost" className="!px-5 !py-3 !text-micro !min-h-[44px]">
            {t.nav.cta}
          </Action>
        </div>
      </div>
    </header>
  );
}

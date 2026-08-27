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

const SECTIONS = [
  { id: 'work', key: 'work' as const },
  { id: 'capabilities', key: 'services' as const },
  { id: 'process', key: 'process' as const },
  { id: 'studio', key: 'about' as const },
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
        <a href="#top" aria-label="ALY" className="shrink-0 opacity-90 hover:opacity-100 transition-opacity">
          <Logo priority className="h-[15px] md:h-4 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-9" aria-label="Разделы">
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="group inline-flex items-baseline gap-2 text-micro text-ink-2 hover:text-ink transition-colors"
            >
              <span className="font-mono text-[0.625rem] text-ink-3 group-hover:text-signal transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
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
                className={`font-mono text-[0.625rem] uppercase tracking-[0.14em] px-1.5 py-1 transition-colors ${
                  lang === l ? 'text-signal' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Action href="#start" variant="ghost" className="!px-5 !py-2.5 !text-micro">
            {t.nav.cta}
          </Action>
        </div>
      </div>
    </header>
  );
}

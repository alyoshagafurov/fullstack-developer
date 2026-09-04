'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import Action from '@/components/ui/Action';
import Logo from '@/components/ui/Logo';
import { Led } from '@/components/ui/Panel';
import { LANGS, useI18n } from '@/lib/i18n';

/*
 * Site chrome.
 *
 * Transparent over the opening so the ceiling and the window run under it;
 * once the reader leaves the first screen it takes the ground colour and its
 * bottom edge lights, the same line as every other edge on the page.
 *
 * Absolute hrefs, not bare fragments: the header also renders on /work and
 * /services, where a bare `#services` would scroll nowhere.
 *
 * Below lg the sections live in a sheet that drops from the header. The room
 * stays visible beneath it and closes it on a tap; Escape closes it; the page
 * does not scroll while it is open; focus goes to the first item and comes
 * back to the button. Tab cycles inside the sheet while it is open.
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
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    // Escape closes; Tab stays inside the sheet, with the close button (the
    // burger, now an X) as the first stop so the loop has a way out.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const inside = Array.from(
        sheet.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
      const ring = [burger.current, ...inside].filter(Boolean) as HTMLElement[];
      if (ring.length === 0) return;
      const head = ring[0];
      const tail = ring[ring.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const known = active ? ring.includes(active) : false;
      if (e.shiftKey && (active === head || !known)) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && (active === tail || !known)) {
        e.preventDefault();
        head.focus();
      }
    };
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    first.current?.focus();
    return () => {
      root.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
      burger.current?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);
  const solid = lifted || open;

  const langGroup = (className: string) => (
    <div className={className} role="group" aria-label="Язык">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[11px] uppercase tracking-[0.14em] ${
            lang === l ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <header
        data-light=""
        className={`fixed inset-x-0 top-0 z-50 ${solid ? 'bg-base' : ''}`}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
          {/* The owner's wordmark, never redrawn as text, with the one dot of
              colour set beside it. */}
          <Link
            href="/#top"
            aria-label="aly — на главную"
            className="inline-flex min-h-[44px] shrink-0 items-end gap-[5px]"
            onClick={close}
          >
            <Logo priority className="h-6 w-auto md:h-7" />
            <span aria-hidden className="mb-[5px] h-[5px] w-[5px] bg-copper md:mb-[6px]" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Разделы">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="lnk inline-flex min-h-[44px] items-center whitespace-nowrap text-[11px]
                           uppercase tracking-[0.18em] text-ink-3 hover:text-ink"
              >
                {t.nav[s.key]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 lg:gap-4">
            {langGroup('hidden items-center lg:flex')}
            <Action
              href="/start-project"
              variant="ghost"
              className="hidden !min-h-[44px] !px-5 !text-[12px] uppercase tracking-[0.14em] sm:inline-flex"
            >
              {t.nav.cta}
            </Action>
            <button
              ref={burger}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span aria-hidden className="relative block h-[15px] w-6">
                <i
                  className={`absolute left-0 top-0 h-px w-6 bg-ink transition-transform duration-200 ease-out ${
                    open ? 'translate-y-[7px] rotate-45' : ''
                  }`}
                />
                <i
                  className={`absolute bottom-0 left-0 h-px w-6 bg-ink transition-transform duration-200 ease-out ${
                    open ? '-translate-y-[7px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
        <Led at="bottom" className={solid ? '' : 'opacity-0'} />
      </header>

      <div id="site-menu" hidden={!open} className="fixed inset-0 z-40 lg:hidden">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Закрыть меню"
          onClick={close}
          className="absolute inset-0 h-full w-full cursor-default bg-base/70"
        />
        <div
          ref={sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          data-light=""
          className="relative bg-base px-gutter pb-8 pt-20"
        >
          <nav aria-label="Разделы">
            <ul className="m-0 list-none p-0">
              {SECTIONS.map((s, i) => (
                <li key={s.href}>
                  <a
                    ref={i === 0 ? first : undefined}
                    href={s.href}
                    onClick={close}
                    className="lnk display flex min-h-[56px] items-center text-[22px] text-ink"
                  >
                    {t.nav[s.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            {langGroup('flex items-center')}
            <Action href="/start-project" variant="signal" onClick={close}>
              {t.nav.cta}
            </Action>
          </div>
          <Led at="bottom" />
        </div>
      </div>
    </>
  );
}

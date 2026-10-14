'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { localePath, stripLocale, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';
import { site } from '@/lib/content/site';
import { useBandTone } from '@/components/chrome/useBandTone';

/*
 * Site chrome, with as little chrome as possible: no bar, no background, no
 * blur — three things on the band behind them, changing colour with it.
 *
 * The owner set the arrangement: the menu on the left, his wordmark in the
 * middle, the language on the right. The same three on a phone and on a desk
 * screen. A centred mark only reads as centred if both sides weigh the same,
 * so the bar is a three-column grid with equal outer columns rather than a
 * flex row — the wordmark sits on the page's axis whatever the two labels on
 * either side happen to measure.
 *
 * The menu opens over the whole screen at every width now. The old desk-screen
 * row of seven uppercase links made the wordmark compete with them; one word,
 * "Menu", says the same and leaves the centre to the mark.
 */

export type HeaderCopy = {
  header: Dictionary['header'];
  nav: Dictionary['nav'];
  getQuote: string;
};

export function Header({
  lang,
  copy,
  open,
  setOpen,
}: {
  lang: Locale;
  copy: HeaderCopy;
  open: boolean;
  setOpen: (value: boolean | ((v: boolean) => boolean)) => void;
}) {
  const pathname = usePathname();
  const { dark: onDark, ready } = useBandTone('top', 44);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const href = (path: string) => localePath(lang, path);
  const items = [
    { href: href('/work'), label: copy.nav.work },
    { href: href('/services'), label: copy.nav.services },
    { href: href('/prices'), label: copy.nav.prices },
    { href: href('/reviews'), label: copy.nav.reviews },
    { href: href('/about'), label: copy.nav.about },
    { href: href('/contacts'), label: copy.nav.contacts },
  ];

  // An open menu owns the screen: no scrolling behind it, Escape closes it,
  // and focus stays inside it.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const scope = document.querySelector<HTMLElement>('[data-chrome-header]');
      if (!scope) return;
      const focusable = scope.querySelectorAll<HTMLElement>('a[href], button');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  /*
   * Over a dark band everything is paper; over a light one it is ink. The
   * wordmark file is cut black, so it is inverted on the dark side. An open
   * menu is all black, so it counts as dark.
   */
  const dark = onDark || open;
  const tone = dark ? 'text-paper' : 'text-ink';
  const bar = dark ? 'bg-paper' : 'bg-ink';
  const current = stripLocale(pathname);

  return (
    <header data-chrome-header>
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-opacity duration-200 ${
          ready || open ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="shell grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-24">
          <button
            ref={trigger}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? copy.header.closeMenu : copy.header.openMenu}
            className={`pointer-events-auto -ml-2 inline-flex min-h-11 items-center gap-3 justify-self-start px-2 transition-colors duration-300 ${tone}`}
          >
            <span aria-hidden className="relative block h-3 w-6">
              <span
                className={`absolute inset-x-0 block h-0.5 transition-transform duration-300 ease-[var(--ease-studio)] ${bar} ${
                  open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute inset-x-0 block h-0.5 transition-transform duration-300 ease-[var(--ease-studio)] ${bar} ${
                  open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-full -translate-y-full'
                }`}
              />
            </span>
            <span aria-hidden className="text-[0.6875rem] tracking-[0.18em] uppercase">
              {open ? copy.header.close : copy.header.menu}
            </span>
          </button>

          <Link
            href={href('/')}
            aria-label={copy.header.home}
            onClick={() => setOpen(false)}
            className="pointer-events-auto inline-flex min-h-11 items-center"
          >
            <Image
              src="/brand/wordmark.webp"
              alt="aly"
              width={663}
              height={462}
              priority
              className={`h-7 w-auto transition-[filter] duration-300 md:h-9 ${dark ? 'invert' : ''}`}
              draggable={false}
            />
          </Link>

          <LangSwitch lang={lang} label={copy.header.language} className={`justify-self-end ${tone}`} />
        </div>
      </div>

      {open && (
        <div
          id="site-menu"
          ref={panel}
          className="menu-panel fixed inset-0 z-40 overflow-y-auto bg-void text-paper"
        >
          <div className="shell grid min-h-full gap-14 pt-28 pb-12 md:grid-cols-[1.5fr_1fr] md:items-end md:gap-20 md:pt-36 md:pb-16">
            <nav aria-label={copy.header.sections}>
              <ul>
                {items.map((item, index) => {
                  const here = current === stripLocale(item.href);
                  return (
                    <li key={item.href} className="menu-item" style={{ animationDelay: `${60 + index * 45}ms` }}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={here ? 'page' : undefined}
                        className="group flex items-baseline gap-4 py-1.5 text-[clamp(2.25rem,7vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.04em] transition-colors hover:text-paper/60 aria-[current=page]:text-paper/45"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="menu-item mt-10" style={{ animationDelay: `${60 + items.length * 45}ms` }}>
                <Link
                  href={href('/start')}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-14 items-center gap-3 rounded-full bg-paper px-8 text-[0.9375rem] font-semibold tracking-[0.02em] text-void transition-colors hover:bg-paper/85"
                >
                  {copy.getQuote}
                  <ArrowIcon />
                </Link>
              </div>
            </nav>

            <div className="menu-item space-y-8 text-sm" style={{ animationDelay: '320ms' }}>
              <div>
                <p className="mb-4 text-[0.6875rem] tracking-[0.18em] text-paper/55 uppercase">
                  {copy.header.menuWrite}
                </p>
                <ul className="space-y-2">
                  <li>
                    <a
                      href={`https://t.me/${site.contact.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-lg text-paper transition-opacity hover:opacity-60"
                    >
                      Telegram @{site.contact.telegram}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="inline-flex min-h-11 items-center text-lg break-all text-paper transition-opacity hover:opacity-60"
                    >
                      {site.contact.email}
                    </a>
                  </li>
                </ul>
              </div>
              <p className="text-[0.6875rem] tracking-[0.18em] text-paper/55 uppercase">
                {copy.header.menuNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/*
 * The language, as two short codes: the one in use full strength, the other
 * dimmed. A full page load rather than a client-side swap — the language is
 * the root of the page, <html lang> included, and a switch is rare enough
 * that a clean document is worth more than a faster one.
 */
function LangSwitch({ lang, label, className = '' }: { lang: Locale; label: string; className?: string }) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const options: { code: Locale; text: string }[] = [
    { code: 'en', text: 'EN' },
    { code: 'ru', text: 'RU' },
  ];

  return (
    <nav aria-label={label} className={`pointer-events-auto flex items-center transition-colors duration-300 ${className}`}>
      {options.map((option, index) => {
        const active = option.code === lang;
        return (
          <span key={option.code} className="flex items-center">
            {index > 0 && <span aria-hidden className="mx-0.5 h-3 w-px bg-current opacity-30" />}
            <a
              href={localePath(option.code, path)}
              hrefLang={option.code}
              lang={option.code}
              aria-current={active ? 'true' : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center text-[0.6875rem] tracking-[0.18em] uppercase transition-opacity ${
                active ? 'opacity-100' : 'opacity-45 hover:opacity-100'
              }`}
            >
              {option.text}
            </a>
          </span>
        );
      })}
    </nav>
  );
}

export function ArrowIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}

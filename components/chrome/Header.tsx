'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

/*
 * Site chrome.
 *
 * Transparent over the vitrine, then a hairline and a ground once the visitor
 * leaves the first screen — the header is a caption, not a bar. Five
 * destinations and one action; the reference sites never exceed that.
 */

const NAV = [
  { href: '/work', label: 'Проекты' },
  { href: '/services', label: 'Услуги' },
  { href: '/about', label: 'Обо мне' },
  { href: '/#process', label: 'Процесс' },
  { href: '/#start', label: 'Контакты' },
];

export function Header() {
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // An open menu owns the screen: the page behind it must not scroll, Escape
  // must close it, and focus must not wander out of it into hidden content.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;

      const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button');
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
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ease-[var(--ease-studio)] ${
        lifted || open
          ? 'border-b border-line bg-ground/90 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          aria-label="aly, на главную"
          className="inline-flex min-h-11 shrink-0 items-center transition-opacity hover:opacity-70"
        >
          <Logo priority className="h-5 w-auto md:h-6" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex lg:gap-11" aria-label="Разделы сайта">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label inline-flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/start"
            className="hidden min-h-11 items-center rounded-full bg-ink px-5 text-[0.75rem] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-2 sm:inline-flex"
          >
            Обсудить проект
          </Link>

          <button
            ref={trigger}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line-2 transition-colors hover:border-ink md:hidden"
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span
                className={`absolute inset-x-0 block h-px bg-ink transition-transform duration-200 ${
                  open ? 'top-1/2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute inset-x-0 block h-px bg-ink transition-transform duration-200 ${
                  open ? 'top-1/2 -rotate-45' : 'top-full'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 -z-10 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            id="mobile-nav"
            ref={panel}
            className="shell flex flex-col gap-1 border-t border-line bg-ground pt-4 pb-8 md:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center border-b border-line text-[1.375rem] tracking-[-0.02em]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/start"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-[0.8125rem] font-medium tracking-[0.04em] text-paper"
            >
              Обсудить проект
            </Link>
          </div>
        </>
      )}
    </header>
  );
}

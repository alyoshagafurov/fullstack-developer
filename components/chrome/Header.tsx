'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/*
 * Site chrome, with as little chrome as possible.
 *
 * No bar, no background, no blur — the header sits directly on the band behind
 * it and simply changes colour.
 *
 * It did that with `mix-blend-mode: difference` first, which needs no state at
 * all. That failed in the one place it mattered: difference against a mid-grey
 * returns a mid-grey, so over the photograph in the opening the links vanished
 * into the wall behind them. The observer below is more code and always legible,
 * which is the right trade for navigation.
 */

const NAV = [
  { href: '/work', label: 'Проекты' },
  { href: '/services', label: 'Услуги' },
  { href: '/about', label: 'Обо мне' },
  { href: '/#process', label: 'Процесс' },
  { href: '/#contacts', label: 'Контакты' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);
  /*
   * The header is invisible until it has measured the band beneath it.
   *
   * Server-rendered markup cannot know whether the page opens on black or on
   * paper — the home page opens light, every inner page opens dark — so any
   * fixed initial colour is wrong half the time and flashes before the first
   * measurement corrects it. Fading in after the measurement costs one frame
   * and is never wrong.
   */
  const [ready, setReady] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  /*
   * Which band is under the header right now?
   *
   * Every band declares `data-tone`, and the header takes the tone of whichever
   * one its own midline is crossing. That keeps it legible the whole way down a
   * page that alternates black and white eight times, rather than only over the
   * first screen — which is all the earlier version handled.
   *
   * The bands are collected once and re-measured on scroll: reading the DOM on
   * every frame would be the expensive part, and their order never changes.
   */
  useEffect(() => {
    const bands = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'));
    if (bands.length === 0) {
      setOnDark(false);
      setReady(true);
      return;
    }

    // The line the header occupies, in viewport coordinates.
    const MIDLINE = 44;

    /** Read every band's box and take the tone of the one crossing the line. */
    const check = () => {
      let tone: string | undefined;
      for (const band of bands) {
        const rect = band.getBoundingClientRect();
        if (rect.top <= MIDLINE && rect.bottom > MIDLINE) tone = band.dataset.tone;
      }
      setOnDark(tone === 'dark');
      setReady(true);
    };

    check();

    /*
     * An observer, not a scroll listener.
     *
     * Two scroll listeners have already failed here for reasons that had
     * nothing to do with this component: `overflow-x: hidden` on the body once
     * made the body the scroll container so window never saw the event, and
     * programmatic scrolling does not always emit one at all. An observer
     * watching a one-pixel strip at the header's own line reports the crossing
     * directly, regardless of who is scrolling or how.
     *
     * The strip is rebuilt on resize because its bottom inset is measured in
     * pixels against the viewport height.
     */
    let observer: IntersectionObserver | undefined;

    const observe = () => {
      observer?.disconnect();
      const bottomInset = Math.max(0, window.innerHeight - MIDLINE - 1);
      observer = new IntersectionObserver(check, {
        rootMargin: `-${MIDLINE}px 0px -${bottomInset}px 0px`,
        threshold: 0,
      });
      for (const band of bands) observer.observe(band);
    };

    observe();

    const onResize = () => {
      observe();
      check();
    };

    // Kept as a second path: on browsers that batch observer callbacks during a
    // fast flick, the listener keeps the colour in step with the scroll.
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // An open menu owns the screen: the page behind it must not scroll, Escape
  // must close it, and focus must not wander into the hidden content.
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

  // Over the opening everything is paper; everywhere else it is ink. The
  // wordmark file is cut black, so it is inverted only on the dark side.
  const dark = onDark && !open;
  const tone = dark ? 'text-paper' : 'text-ink';
  const bar = open || dark ? 'bg-paper' : 'bg-ink';

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 transition-opacity duration-200 ${
        ready || open ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="shell flex h-20 items-center justify-between gap-6 md:h-24">
        <Link
          href="/"
          aria-label="aly, на главную"
          className="pointer-events-auto inline-flex min-h-11 shrink-0 items-center"
        >
          <Image
            src="/brand/wordmark.webp"
            alt="aly"
            width={663}
            height={462}
            priority
            className={`h-7 w-auto transition-[filter] duration-300 md:h-9 ${
              open || dark ? 'invert' : ''
            }`}
            draggable={false}
          />
        </Link>

        <nav
          className={`pointer-events-auto hidden items-center gap-9 transition-colors duration-300 md:flex lg:gap-12 ${tone}`}
          aria-label="Разделы сайта"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-[0.6875rem] tracking-[0.18em] whitespace-nowrap uppercase transition-opacity hover:opacity-60"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/start"
            className="inline-flex min-h-11 items-center border-b border-current text-[0.6875rem] tracking-[0.18em] uppercase"
          >
            Заявка
          </Link>
        </nav>

        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          className="pointer-events-auto inline-flex size-11 items-center justify-center md:hidden"
        >
          <span aria-hidden className="relative block h-3 w-6">
            <span
              className={`absolute inset-x-0 block h-0.5 transition-transform duration-200 ${bar} ${
                open ? 'top-1/2 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute inset-x-0 block h-0.5 transition-transform duration-200 ${bar} ${
                open ? 'top-1/2 -rotate-45' : 'top-full'
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          ref={panel}
          className="pointer-events-auto fixed inset-0 top-20 flex flex-col justify-between bg-void px-5 pt-10 pb-12 md:hidden"
        >
          <nav aria-label="Разделы сайта">
            {[...NAV, { href: '/start', label: 'Оставить заявку' }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="display-3 block py-3 text-paper"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-[0.6875rem] tracking-[0.18em] text-white/40 uppercase">
            Душанбе · UTC+5
          </p>
        </div>
      )}
    </header>
  );
}

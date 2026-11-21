'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { localePath, stripLocale, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';
import { site } from '@/lib/content/site';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';

/*
 * The bar along the top. It reads the section under it: over a black section
 * it turns itself dark (data-tone flips every colour token), over warm paper
 * it is light. Clear at the very top, a blurred band once the page moves.
 * Below 1024px the links fold into a full-screen menu.
 */

export type HeaderCopy = {
  header: Dictionary['header'];
  nav: Dictionary['nav'];
  getQuote: string;
  whatsapp: string;
};

export { ArrowIcon };

const LANG_COOKIE = 'aly-lang';

export function Header({
  lang,
  copy,
  open,
  setOpen,
  whatsappHref,
}: {
  lang: Locale;
  copy: HeaderCopy;
  open: boolean;
  setOpen: (value: boolean | ((v: boolean) => boolean)) => void;
  whatsappHref: string;
}) {
  const pathname = usePathname();
  const current = stripLocale(pathname);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const [under, setUnder] = useState<'light' | 'dark' | 'brand' | 'stage'>('light');
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const check = () => {
      setMoved(window.scrollY > 12);
      const probe = 28;
      const hit = Array.from(document.querySelectorAll<HTMLElement>('main section[data-tone]')).find((el) => {
        const box = el.getBoundingClientRect();
        return box.top <= probe && box.bottom >= probe;
      });
      const tone = hit?.dataset.tone;
      setUnder(tone === 'dark' || tone === 'brand' || tone === 'stage' ? tone : 'light');
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [pathname]);

  const href = (path: string) => localePath(lang, path);
  const items = [
    { href: href('/'), label: copy.nav.home },
    { href: href('/work'), label: copy.nav.work },
    { href: href('/services'), label: copy.nav.services },
    { href: href('/about'), label: copy.nav.about },
    { href: href('/contacts'), label: copy.nav.contacts },
  ];

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return (
    <header data-chrome-header>
      <div
        data-tone={open ? 'light' : under}
        className={`fixed inset-x-0 top-0 z-50 text-bone transition-[background-color,border-color] duration-300 ${
          moved && !open ? 'border-b border-seam bg-wall/80 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="hall-wide flex h-14 items-center justify-between gap-4 md:h-16">
          <Link
            href={href('/')}
            aria-label={copy.header.home}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center px-1"
          >
            <Image
              src="/brand/wordmark.webp"
              alt="aly"
              width={663}
              height={462}
              priority
              unoptimized
              className="h-6 w-auto dark:invert"
              draggable={false}
            />
          </Link>

          <nav aria-label={copy.header.sections} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current === stripLocale(item.href) ? 'page' : undefined}
                    className="inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-normal text-bone/70 transition-colors hover:text-bone aria-[current=page]:text-bone"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <LangSwitch lang={lang} label={copy.header.language} />
            <Link
              href={href('/start')}
              className="ml-1 hidden min-h-10 items-center rounded-full bg-bone px-5 text-sm font-semibold text-wall transition-transform hover:-translate-y-px md:inline-flex"
            >
              {copy.getQuote}
            </Link>
            <button
              ref={trigger}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? copy.header.closeMenu : copy.header.openMenu}
              className="inline-flex size-11 items-center justify-center text-bone lg:hidden"
            >
              <span aria-hidden className="relative block h-2 w-4">
                <span
                  className={`absolute inset-x-0 block h-px bg-current transition-transform duration-300 ${
                    open ? 'top-1/2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute inset-x-0 block h-px bg-current transition-transform duration-300 ${
                    open ? 'top-1/2 -rotate-45' : 'top-full'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            ref={panel}
            className="fixed inset-0 z-40 overflow-y-auto bg-wall"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="hall flex min-h-full flex-col justify-between gap-12 pt-20 pb-10">
              <nav aria-label={copy.header.sections}>
                <ul>
                  {items.map((item, index) => (
                    <motion.li
                      key={item.href}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + index * 0.03, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="font-display block py-2 text-[2.5rem] leading-none font-black tracking-tight text-bone"
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap gap-3">
                  <Link href={href('/start')} onClick={() => setOpen(false)} className="btn-bone">
                    {copy.getQuote}
                  </Link>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-line">
                    <WhatsAppIcon className="size-[1.05rem]" />
                    {copy.whatsapp}
                  </a>
                </div>
                <p className="wall-note">
                  Telegram @{site.contact.telegram} · {site.contact.email}
                  <br />
                  {copy.header.menuNote}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const other: Locale = lang === 'en' ? 'ru' : 'en';

  return (
    <nav aria-label={label}>
      <a
        href={localePath(other, path)}
        hrefLang={other}
        lang={other}
        onClick={() => {
          document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
        }}
        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[0.75rem] font-semibold text-bone/80 transition-colors hover:bg-bone/10 hover:text-bone"
      >
        {other.toUpperCase()}
      </a>
    </nav>
  );
}

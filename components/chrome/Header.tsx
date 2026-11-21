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
 * The museum's door frame: the wordmark, the halls, the language, the request.
 * It sits on the wall without a bar of its own; once the page moves, a dusk
 * gradient rises behind it so the links stay legible over a lit exhibit.
 * Below 1024px the halls fold into a full-screen menu.
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
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  const href = (path: string) => localePath(lang, path);
  const items = [
    { href: href('/work'), label: copy.nav.work },
    { href: href('/services'), label: copy.nav.services },
    { href: href('/prices'), label: copy.nav.prices },
    { href: href('/reviews'), label: copy.nav.reviews },
    { href: href('/about'), label: copy.nav.about },
    { href: href('/contacts'), label: copy.nav.contacts },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-20 border-b border-seam bg-wall/95 backdrop-blur-sm transition-opacity duration-500 md:h-24 ${
          scrolled && !open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="fixed inset-x-0 top-0 z-50">
        <div className="hall flex h-20 items-center justify-between gap-6 md:h-24">
          <Link
            href={href('/')}
            aria-label={copy.header.home}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center"
          >
            <Image
              src="/brand/wordmark.webp"
              alt="aly"
              width={663}
              height={462}
              priority
              unoptimized
              className="h-7 w-auto invert md:h-8"
              draggable={false}
            />
          </Link>

          <nav aria-label={copy.header.sections} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.slice(0, 5).map((item) => {
                const here = current === stripLocale(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={here ? 'page' : undefined}
                      className="relative inline-flex min-h-11 items-center px-3.5 text-sm text-bone-2 transition-colors hover:text-bone aria-[current=page]:text-bone"
                    >
                      {item.label}
                      {here && <span aria-hidden className="absolute inset-x-3.5 bottom-2 h-px bg-brass" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LangSwitch lang={lang} label={copy.header.language} />
            <Link
              href={href('/start')}
              className="hidden min-h-11 items-center gap-2 rounded-full bg-bone px-5 text-sm font-medium text-wall transition-colors hover:bg-white md:inline-flex"
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
              className="inline-flex size-11 items-center justify-center rounded-full border border-seam-2 text-bone lg:hidden"
            >
              <span aria-hidden className="relative block h-2.5 w-4">
                <span
                  className={`absolute inset-x-0 block h-px bg-current transition-transform duration-500 ease-[var(--ease-gallery)] ${
                    open ? 'top-1/2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute inset-x-0 block h-px bg-current transition-transform duration-500 ease-[var(--ease-gallery)] ${
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
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hall flex min-h-full flex-col justify-between gap-14 pt-28 pb-10">
              <nav aria-label={copy.header.sections}>
                <ul>
                  {items.map((item, index) => (
                    <motion.li
                      key={item.href}
                      initial={reduce ? false : { y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 + index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={current === stripLocale(item.href) ? 'page' : undefined}
                        className="font-display block py-1 text-[clamp(2.5rem,11vw,4.5rem)] leading-[1] font-black text-bone transition-colors [font-synthesis:none] hover:text-brass aria-[current=page]:text-bone/40"
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-3">
                  <Link href={href('/start')} onClick={() => setOpen(false)} className="btn-bone">
                    {copy.getQuote}
                    <ArrowIcon />
                  </Link>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-line">
                    <WhatsAppIcon className="size-[1.1rem]" />
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
  const options: { code: Locale; text: string }[] = [
    { code: 'en', text: 'EN' },
    { code: 'ru', text: 'RU' },
  ];

  return (
    <nav aria-label={label} className="flex items-center rounded-full border border-seam px-1">
      {options.map((option) => {
        const active = option.code === lang;
        return (
          <a
            key={option.code}
            href={localePath(option.code, path)}
            hrefLang={option.code}
            lang={option.code}
            aria-current={active ? 'true' : undefined}
            // A choice made by hand outranks what the browser says.
            onClick={() => {
              document.cookie = `${LANG_COOKIE}=${option.code}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[0.6875rem] tracking-[0.14em] transition-colors ${
              active ? 'text-bone' : 'text-bone-3 hover:text-bone'
            }`}
          >
            {option.text}
          </a>
        );
      })}
    </nav>
  );
}

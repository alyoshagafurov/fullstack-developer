'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { localePath, stripLocale, type Locale } from '@/lib/i18n';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';

/*
 * The two doors, within reach once the first screen has gone by — never on it,
 * where the hero's own button is the one thing to press.
 *
 * On a phone: a pair at the foot of the screen, the blue request and WhatsApp
 * beside it. On a desk screen: WhatsApp alone as a round button in the corner,
 * since the request is in the header the whole way down. WhatsApp is graphite,
 * not green: it is the quiet second door and must not out-shout the blue one.
 * Hidden on the form pages, where the form is the door, over a section that
 * has its own doors (data-doors: one with its own blue button, so a phone
 * never shows two blue buttons at once), and while the menu is open.
 */

const FORM_PAGES = ['/start', '/reviews/new'];

export function StickyCta({
  lang,
  label,
  whatsappLabel,
  whatsappHref,
  menuOpen,
}: {
  lang: Locale;
  label: string;
  whatsappLabel: string;
  whatsappHref: string;
  menuOpen: boolean;
}) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const onFormPage = FORM_PAGES.some((page) => path === page || path.startsWith(`${page}/`));
  const [past, setPast] = useState(false);
  const [doorsInView, setDoorsInView] = useState(false);

  useEffect(() => {
    // past the first screen, not merely scrolled a little into it
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // A section with its own blue button does not need the floating pair over it.
  useEffect(() => {
    const seen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        }
        setDoorsInView(seen.size > 0);
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll('[data-doors]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const shown = past && !doorsInView && !menuOpen && !onFormPage;

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`sticky-cta pointer-events-none fixed inset-x-4 z-30 flex gap-2 md:inset-x-auto md:right-6 ${
        shown ? 'sticky-cta--in' : ''
      }`}
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <Link
        href={localePath(lang, '/start')}
        // the ring is white and inset, inside the fill: it has to show over a black band and a white page alike
        className="pointer-events-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-action px-6 text-base font-medium text-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)] transition-[background-color,scale] duration-200 hover:bg-action-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white active:scale-[0.98] active:bg-action-3 md:hidden"
      >
        {label}
        <ArrowIcon />
      </Link>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappLabel}
        className="pointer-events-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f]/90 text-white/80 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)] ring-1 ring-white/15 backdrop-blur-md transition-[background-color,color,scale,translate] duration-200 hover:-translate-y-px hover:bg-[#2c2c2e] hover:text-white focus-visible:outline-offset-[-4px] focus-visible:outline-white active:scale-95"
      >
        <WhatsAppIcon className="size-[1.375rem]" />
      </a>
    </div>
  );
}

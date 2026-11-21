'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { localePath, stripLocale, type Locale } from '@/lib/i18n';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';

/*
 * The two doors, always within reach once the first screen has gone by.
 *
 * On a phone: a pair at the foot of the screen, the request filled and
 * WhatsApp beside it. On a desk screen: WhatsApp alone as a round button in
 * the corner, since the request is in the header the whole way down. Hidden on
 * the form pages, where the form is the door, and while the menu is open.
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
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // A hall with its own two doors does not need the floating pair over it.
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
        className="pointer-events-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 text-base font-medium text-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)] md:hidden"
      >
        {label}
        <ArrowIcon />
      </Link>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappLabel}
        className="pointer-events-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-whatsapp text-[#0a0a0a] shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)] transition-transform hover:-translate-y-px md:size-14"
      >
        <WhatsAppIcon className="size-6" />
      </a>
    </div>
  );
}

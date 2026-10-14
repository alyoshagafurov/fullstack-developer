'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { localePath, stripLocale, type Locale } from '@/lib/i18n';
import { useBandTone } from '@/components/chrome/useBandTone';
import { ArrowIcon } from '@/components/chrome/Header';

/*
 * The request button, stuck to the bottom of every page.
 *
 * The owner's rule: a visitor should never have to look for it. It rises from
 * the bottom edge once the page is up and stays there while they read.
 *
 * It sinks back out of sight in three places, and rises again the moment they
 * are left:
 *   - while the menu is open — the menu carries the same button itself;
 *   - on the form pages — the request form, its thank-you page, and the review
 *     form, where a client came to write, not to be sold something;
 *   - while the page's own big request button is on screen (`data-cta-twin`),
 *     so the closing band never shows two identical buttons stacked.
 * In all three a request button is still on screen, or the visitor is already
 * where it leads — "never look for it" holds without ever doubling it.
 *
 * A phone gets a full-width bar in the thumb's reach; a desk screen a pill in
 * the corner, where it stays out of the compositions laid along the bottom
 * centre (the opening's desk line, the vitrine's stage). Its fill follows the
 * band under it the way every button on the site does: ink on light, paper on
 * dark.
 */

const FORM_PAGES = ['/start', '/reviews/new'];

export function StickyCta({ lang, label, menuOpen }: { lang: Locale; label: string; menuOpen: boolean }) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const onFormPage = FORM_PAGES.some((page) => path === page || path.startsWith(`${page}/`));

  const { dark } = useBandTone('bottom', 48);
  const [entered, setEntered] = useState(false);
  const [twinInView, setTwinInView] = useState(false);

  // Rises once the first frame has painted, so it arrives rather than appears.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /*
   * The page's own request buttons. Rebuilt per route, for the same reason as
   * the band list in useBandTone: the layout outlives the page under it.
   */
  useEffect(() => {
    const seen = new Set<Element>();
    let observer: IntersectionObserver | undefined;

    const observe = () => {
      observer?.disconnect();
      seen.clear();
      setTwinInView(false);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) seen.add(entry.target);
            else seen.delete(entry.target);
          }
          setTwinInView(seen.size > 0);
        },
        // Only counts once it is properly on screen, not a sliver at the edge.
        { threshold: 0.6 },
      );
      document.querySelectorAll('[data-cta-twin]').forEach((el) => observer?.observe(el));
    };

    observe();
    const frame = requestAnimationFrame(observe);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname]);

  const shown = entered && !menuOpen && !onFormPage && !twinInView;
  const fill = dark ? 'bg-paper text-void hover:bg-paper/90' : 'bg-ink text-paper hover:bg-ink-2';

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`sticky-cta pointer-events-none fixed inset-x-4 z-30 md:inset-x-auto md:right-6 ${
        shown ? 'sticky-cta--in' : ''
      }`}
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <Link
        href={localePath(lang, '/start')}
        className={`pointer-events-auto group flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-8 text-[0.9375rem] font-semibold tracking-[0.02em] shadow-[0_14px_36px_-14px_rgba(5,5,5,0.55)] transition-colors duration-300 md:w-auto ${fill}`}
      >
        {label}
        <ArrowIcon className="size-4 transition-transform duration-300 ease-[var(--ease-studio)] group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

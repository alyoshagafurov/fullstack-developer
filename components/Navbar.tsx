'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import LangSwitcher from './LangSwitcher';
import Logo from './Logo';

/*
 * Top nav — multi-page. Links go to dedicated routes; the active one is derived
 * from the pathname. Scrolling fades in a blurred bar + hairline.
 */
export default function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const LINKS = [
    { href: '/work', label: t.nav.work },
    { href: '/services', label: t.nav.services },
    { href: '/process', label: t.nav.process },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/about', label: t.nav.about },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (open) { document.documentElement.style.overflow = 'hidden'; lenis?.stop?.(); }
    else { document.documentElement.style.overflow = ''; lenis?.start?.(); }
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  // Close the mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[130] transition-[background,border-color,backdrop-filter] duration-500 ${scrolled && !open ? 'bg-bg/70 backdrop-blur-xl border-b border-line' : 'bg-transparent border-b border-transparent'}`}>
        <div className="mx-auto max-w-wide px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" data-hover aria-label="ALY — Алишер Гафуров, на главную" className="opacity-90 hover:opacity-100 transition-opacity">
            <Logo priority className="h-[16px] md:h-[17px] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} data-hover className={`relative text-[13px] tracking-tight transition-colors ${isActive(l.href) ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}>
                {l.label}
                <span className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300 ${isActive(l.href) ? 'w-full' : 'w-0'}`} />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LangSwitcher />
            <Link href="/contact" data-hover className="btn btn-primary !py-2.5 !px-5 !text-[13px] !rounded-xl">{t.nav.cta}</Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LangSwitcher />
            <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} data-hover className="relative w-10 h-10 flex flex-col items-center justify-center gap-[7px]">
              <span className={`block h-[1.5px] w-6 bg-ink transition-transform duration-300 ${open ? 'translate-y-[4px] rotate-45' : ''}`} />
              <span className={`block h-[1.5px] w-6 bg-ink transition-transform duration-300 ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-[110] md:hidden flex flex-col ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-bg/95 backdrop-blur-2xl transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} />
        <nav className="relative flex-1 flex flex-col justify-center px-8 gap-4">
          {[...LINKS, { href: '/contact', label: t.nav.contact }].map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="group flex items-baseline gap-5 transition-all duration-500"
              style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(24px)', transitionDelay: open ? `${140 + i * 60}ms` : '0ms' }}>
              <span className="label text-[10px] w-6">0{i + 1}</span>
              <span className={`display text-4xl transition-colors ${isActive(l.href) ? 'text-white' : 'text-ink group-hover:text-white'}`}>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="relative px-8 pb-12 flex flex-col gap-4 transition-opacity duration-500" style={{ opacity: open ? 1 : 0, transitionDelay: open ? '420ms' : '0ms' }}>
          <div className="h-px w-full bg-line" />
          <div className="flex items-center justify-between label text-[10px]">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent pulse-soft" /> Душанбе · TJ</span>
            <a href="https://t.me/alishergafurovv" className="text-ink" data-hover>@alishergafurovv</a>
          </div>
        </div>
      </div>
    </>
  );
}

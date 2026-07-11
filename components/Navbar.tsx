'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import LangSwitcher from './LangSwitcher';

/*
 * Minimal top nav. The whole site is dark, so type is always light; scrolling
 * just fades in a blurred bar + hairline. Labels come from the active language.
 */

const SECTIONS = ['hero', 'work', 'services', 'process', 'stack', 'pricing', 'about', 'contact'];

export default function Navbar() {
  const { t } = useI18n();
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const LINKS = [
    { id: 'work', label: t.nav.work },
    { id: 'services', label: t.nav.services },
    { id: 'process', label: t.nav.process },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'about', label: t.nav.about },
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let cur = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
      setScrolled(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (open) {
      document.documentElement.style.overflow = 'hidden';
      lenis?.stop?.();
    } else {
      document.documentElement.style.overflow = '';
      lenis?.start?.();
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      const lenis = (window as any).lenis;
      if (lenis?.scrollTo) {
        lenis.start?.();
        lenis.scrollTo(el, { duration: 1.2, offset: -80 });
      } else {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[130] transition-[background,border-color,backdrop-filter] duration-500 ${
          scrolled && !open ? 'bg-bg/70 backdrop-blur-xl border-b border-line' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto max-w-wide px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <a href="#hero" onClick={(e) => go(e, 'hero')} data-hover className="font-semibold text-sm tracking-[0.18em] text-ink hover:text-white transition-colors">
            A<span className="text-muted">/</span>G
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={(e) => go(e, l.id)}
                  data-hover
                  className={`relative text-[13px] tracking-tight transition-colors ${isActive ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
                >
                  {l.label}
                  <span className={`absolute -bottom-1.5 left-0 h-px bg-white transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LangSwitcher />
            <a href="#contact" onClick={(e) => go(e, 'contact')} data-hover className="btn btn-primary !py-2.5 !px-5 !text-[13px] !rounded-xl">
              {t.nav.cta}
            </a>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LangSwitcher />
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              data-hover
              className="relative w-10 h-10 flex flex-col items-center justify-center gap-[7px]"
            >
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
          {[...LINKS, { id: 'contact', label: t.nav.contact }].map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id)}
              className="group flex items-baseline gap-5 transition-all duration-500"
              style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(24px)', transitionDelay: open ? `${140 + i * 60}ms` : '0ms' }}
            >
              <span className="label text-[10px] w-6">0{i + 1}</span>
              <span className={`display text-4xl transition-colors ${active === l.id ? 'text-white' : 'text-ink group-hover:text-white'}`}>{l.label}</span>
            </a>
          ))}
        </nav>
        <div className="relative px-8 pb-12 flex flex-col gap-4 transition-opacity duration-500" style={{ opacity: open ? 1 : 0, transitionDelay: open ? '420ms' : '0ms' }}>
          <div className="h-px w-full bg-line" />
          <div className="flex items-center justify-between label text-[10px]">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white pulse-soft" /> Душанбе · TJ</span>
            <a href="https://t.me/alishergafurovv" className="text-ink" data-hover>@alishergafurovv</a>
          </div>
        </div>
      </div>
    </>
  );
}

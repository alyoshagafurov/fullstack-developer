'use client';

import { useEffect, useState } from 'react';

/**
 * Navigation. Two visual states:
 *   • over the dark hero  → transparent bar, light text
 *   • scrolled into body  → light glass bar, ink text
 * Desktop: inline links with an active-section underline.
 * Mobile: a burger that opens a clean full-screen light menu.
 */

const LINKS = [
  { id: 'about', label: 'ОБО МНЕ' },
  { id: 'services', label: 'УСЛУГИ' },
  { id: 'pricing', label: 'ТАРИФЫ' },
  { id: 'projects', label: 'РАБОТЫ' },
  { id: 'contact', label: 'КОНТАКТЫ' },
];

const SECTIONS = [
  'hero',
  'about',
  'code',
  'services',
  'pricing',
  'projects',
  'fight',
  'contact',
  'finale',
];

export default function Navbar() {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let cur = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock scroll while the mobile menu is open
  useEffect(() => {
    const lenis = (window as any).lenis;
    if (open) {
      document.documentElement.style.overflow = 'hidden';
      lenis?.stop?.();
    } else {
      document.documentElement.style.overflow = '';
      lenis?.start?.();
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
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
        lenis.scrollTo(el, { duration: 1.2, offset: -72 });
      } else {
        const y = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  };

  // Light text only while floating over the dark hero
  const onDark = !scrolled && !open;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[130] transition-[background,border-color,backdrop-filter] duration-500 ${
          scrolled && !open
            ? 'bg-paper/85 backdrop-blur-md border-b border-line'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto max-w-content px-6 md:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => go(e, 'hero')}
            data-hover
            className={`font-display font-bold text-sm tracking-[0.3em] transition-colors hover:text-accent ${
              onDark ? 'text-white' : 'text-ink'
            }`}
          >
            A<span className="text-accent">·</span>G
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-9">
            {LINKS.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={(e) => go(e, l.id)}
                  data-hover
                  className={`relative label text-[10px] transition-colors ${
                    isActive
                      ? 'text-accent'
                      : onDark
                        ? 'text-white/70 hover:text-white'
                        : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Desktop status */}
          <div
            className={`hidden md:flex items-center gap-2 label text-[10px] ${
              onDark ? 'text-white/70' : 'text-ink-2'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-soft" />
            <span>ДУШАНБЕ · TJ</span>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            data-hover
            className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-2"
          >
            <span
              className={`block h-[2px] w-6 transition-transform duration-300 ${
                open ? 'translate-y-[5px] rotate-45 bg-ink' : onDark ? 'bg-white' : 'bg-ink'
              }`}
            />
            <span
              className={`block h-[2px] w-6 transition-transform duration-300 ${
                open ? '-translate-y-[5px] -rotate-45 bg-ink' : onDark ? 'bg-white' : 'bg-ink'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 z-[110] md:hidden flex flex-col ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-paper/97 backdrop-blur-xl transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Links */}
        <nav className="relative flex-1 flex flex-col justify-center px-8 gap-5">
          {LINKS.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id)}
              className="group flex items-baseline gap-5 transition-all duration-500"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: open ? `${140 + i * 70}ms` : '0ms',
              }}
            >
              <span className="label text-xs text-muted">0{i + 1}</span>
              <span
                className={`text-cinematic text-5xl transition-colors ${
                  active === l.id ? 'text-accent' : 'text-ink group-hover:text-accent'
                }`}
              >
                {l.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="relative px-8 pb-12 flex flex-col gap-4 transition-opacity duration-500"
          style={{ opacity: open ? 1 : 0, transitionDelay: open ? '420ms' : '0ms' }}
        >
          <div className="h-px w-full bg-line" />
          <div className="flex items-center justify-between label text-[10px] text-ink-2">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-soft" />
              ДУШАНБЕ · TJ
            </span>
            <a href="https://t.me/alishergafurovv" className="text-accent" data-hover>
              @alishergafurovv
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

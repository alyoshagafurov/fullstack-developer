'use client';

import { useEffect, useState } from 'react';

/**
 * Navigation. Desktop: inline links with active-section highlight + glass
 * backing after the hero. Mobile: a morphing burger that opens a full-screen
 * overlay menu with large, staggered links.
 */

const LINKS = [
  { id: 'about', label: 'ABOUT' },
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
        lenis.scrollTo(el, { duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[130] transition-[background,border-color,backdrop-filter] duration-500 ${
          scrolled && !open
            ? 'bg-ink-0/55 backdrop-blur-md border-b border-white/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1800px] px-6 md:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => go(e, 'hero')}
            data-hover
            className="font-mono text-[12px] tracking-[0.4em] text-white hover:text-neon-yellow transition-colors"
          >
            A<span className="text-neon-yellow">·</span>G
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={(e) => go(e, l.id)}
                  data-hover
                  className={`relative font-mono text-[10px] tracking-[0.4em] transition-colors ${
                    isActive ? 'text-neon-yellow' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-neon-yellow transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Desktop status */}
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-white/55">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow pulse-soft" />
            <span>LIVE · DUSHANBE</span>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-hover
            className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-2"
          >
            <span
              className={`block h-px w-6 bg-white transition-transform duration-300 ${
                open ? 'translate-y-[4.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-6 bg-white transition-transform duration-300 ${
                open ? '-translate-y-[4.5px] -rotate-45' : ''
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
          className={`absolute inset-0 bg-ink-0/95 backdrop-blur-xl transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 80% 20%, rgba(0,255,255,0.08), transparent 60%), radial-gradient(50% 40% at 10% 90%, rgba(138,43,226,0.08), transparent 60%)',
          }}
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
              <span className="font-mono text-xs tracking-[0.3em] text-white/30">
                0{i + 1}
              </span>
              <span
                className={`text-cinematic text-5xl transition-colors ${
                  active === l.id ? 'text-neon-yellow' : 'text-white group-hover:text-neon-blue'
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
          <div className="h-px w-full bg-white/10" />
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em] text-white/50">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow pulse-soft" />
              DUSHANBE · TJ
            </span>
            <a href="https://t.me/alishergafurovv" className="text-neon-blue" data-hover>
              @alishergafurovv
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

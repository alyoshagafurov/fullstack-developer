'use client';

import { useEffect } from 'react';

/*
 * The page has no colour of its own: it takes the colour of whatever is in
 * front of the reader. Every section marked data-stage carries its colours in
 * data-bg / data-ink / data-accent; the one crossing the middle of the screen
 * paints the whole page, and the change is eased by CSS. Hovering a work in
 * the hero ribbon borrows that work's colour for as long as the pointer stays.
 */
export const STAGE_HOVER = 'stage:hover';
export type StageColours = { bg: string; ink: string; accent: string; dark: boolean };

function paint(c: StageColours) {
  const root = document.documentElement;
  root.style.setProperty('--stage-bg', c.bg);
  root.style.setProperty('--stage-ink', c.ink);
  root.style.setProperty('--stage-accent', c.accent);
  root.dataset.stageDark = c.dark ? '1' : '0';
}

function read(el: HTMLElement): StageColours {
  return {
    bg: el.dataset.bg ?? '#f2f0eb',
    ink: el.dataset.ink ?? '#121212',
    accent: el.dataset.accent ?? '#121212',
    dark: el.dataset.dark === '1',
  };
}

export function ColourStage() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('has-stage');
    let current: HTMLElement | null = null;
    let hover: StageColours | null = null;
    const apply = () => {
      if (hover) paint(hover);
      else if (current) paint(read(current));
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) current = entry.target as HTMLElement;
        }
        apply();
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'));
    sections.forEach((el) => io.observe(el));
    current = sections[0] ?? null;
    apply();

    const onHover = (event: Event) => {
      hover = (event as CustomEvent<StageColours | null>).detail;
      apply();
    };
    window.addEventListener(STAGE_HOVER, onHover);

    return () => {
      io.disconnect();
      window.removeEventListener(STAGE_HOVER, onHover);
      root.classList.remove('has-stage');
      ['--stage-bg', '--stage-ink', '--stage-accent'].forEach((p) => root.style.removeProperty(p));
      delete root.dataset.stageDark;
    };
  }, []);

  return null;
}

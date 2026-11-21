'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowIcon } from '@/components/museum/Icons';
import { Rise, Words } from '@/components/site/Reveal';
import type { StageColours } from '@/components/stage/ColourStage';

type Capture = { src: string; width: number; height: number };

export type Chapter = {
  slug: string;
  index: number;
  title: string;
  year: string;
  client: string | null;
  line: string;
  liveUrl: string | null;
  href: string;
  desktop: Capture;
  phone: Capture;
  colour: StageColours;
};

type Mode = 'desktop' | 'phone';

/*
 * One project, a whole screen in its own colour. On the right, the real site
 * in a device the visitor switches between a computer and a phone; the frame
 * changes shape in place, and the page inside can be scrolled by hand. Until
 * it is touched, it scrolls itself slowly, so the screen is never still.
 */
export function CaseChapter({
  chapter,
  labels,
}: {
  chapter: Chapter;
  labels: { project: string; desktop: string; phone: string; inside: string; openSite: string; howMade: string };
}) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>('desktop');
  const c = chapter.colour;

  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) setMode('phone');
  }, []);

  return (
    <section
      id={`case-${chapter.slug}`}
      data-stage
      data-tone="stage"
      data-bg={c.bg}
      data-ink={c.ink}
      data-accent={c.accent}
      data-dark={c.dark ? '1' : '0'}
      aria-labelledby={`case-${chapter.slug}-title`}
      className="relative flex min-h-[100svh] items-center py-24 md:py-28"
    >
      <div className="hall grid w-full gap-12 md:grid-cols-12 md:items-center md:gap-8">
        <div className="md:col-span-4">
          <Rise>
            <p className="flex items-center gap-3 text-sm font-light text-bone-2">
              <span className="tabular-nums">{String(chapter.index).padStart(2, '0')}</span>
              <span className="h-px w-8 bg-current opacity-40" />
              {labels.project} · {chapter.year}
            </p>
          </Rise>
          <Words id={`case-${chapter.slug}-title`} text={chapter.title} className="stage-title mt-5 text-[clamp(2.75rem,5vw,5.25rem)] break-words" />
          <Rise delay={0.15}>
            <p className="wall-note mt-6">{chapter.line}</p>
            {chapter.client && <p className="mt-3 text-xs font-light text-bone-3">{chapter.client}</p>}
          </Rise>
          <Rise delay={0.25} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            {chapter.liveUrl && (
              <a href={chapter.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-bone group">
                {labels.openSite}
                <ArrowIcon className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
              </a>
            )}
            <Link href={chapter.href} className="link-more text-sm">
              {labels.howMade}
              <ArrowIcon className="size-3.5" />
            </Link>
          </Rise>
        </div>

        <div className="md:col-span-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <DeviceSwitch mode={mode} setMode={setMode} labels={labels} />
            <span className="hidden text-xs font-light text-bone-2 sm:block">{labels.inside}</span>
          </div>
          <Device chapter={chapter} mode={mode} reduce={!!reduce} />
        </div>
      </div>
    </section>
  );
}

function DeviceSwitch({
  mode,
  setMode,
  labels,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  labels: { desktop: string; phone: string };
}) {
  return (
    <div role="tablist" aria-label={`${labels.desktop} / ${labels.phone}`} className="relative inline-flex rounded-full bg-wall-3 p-1">
      {(['desktop', 'phone'] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => setMode(m)}
          className="relative z-10 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-300 aria-selected:text-wall"
        >
          {mode === m && (
            <motion.span layoutId="device-pill" className="absolute inset-0 -z-10 rounded-full bg-bone" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
          )}
          {m === 'desktop' ? <DesktopGlyph /> : <PhoneGlyph />}
          {m === 'desktop' ? labels.desktop : labels.phone}
        </button>
      ))}
    </div>
  );
}

const BAR = 30;

function Device({ chapter, mode, reduce }: { chapter: Chapter; mode: Mode; reduce: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* The frame's size for each device, fitted into the stage. */
  let fw = 0;
  let fh = 0;
  if (box.w && box.h) {
    if (mode === 'desktop') {
      fw = box.w;
      fh = fw * 0.625 + BAR;
      if (fh > box.h) {
        fh = box.h;
        fw = (fh - BAR) / 0.625;
      }
    } else {
      fh = box.h;
      fw = Math.min(fh * 0.49, box.w);
    }
  }
  const capture = mode === 'desktop' ? chapter.desktop : chapter.phone;

  return (
    <div ref={stage} className="relative flex h-[min(68svh,620px)] items-center justify-center md:h-[min(66svh,600px)]">
      {fw > 0 && (
        <motion.div
          className="relative overflow-hidden bg-[#0e0e10] shadow-[0_60px_120px_-50px_rgb(0_0_0/0.6)]"
          initial={false}
          animate={{ width: fw, height: fh, borderRadius: mode === 'desktop' ? 14 : 46 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22, mass: 1 }}
        >
          {/* browser bar */}
          <motion.div
            className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-3.5"
            style={{ height: BAR }}
            animate={{ opacity: mode === 'desktop' ? 1 : 0 }}
          >
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            {chapter.liveUrl && (
              <span className="mx-auto truncate rounded-md bg-white/8 px-6 py-0.5 text-[0.6875rem] font-light text-white/60">
                {new URL(chapter.liveUrl).host}
              </span>
            )}
          </motion.div>

          {/* screen */}
          <motion.div
            className="absolute overflow-hidden bg-black"
            initial={false}
            animate={
              mode === 'desktop'
                ? { top: BAR, left: 0, right: 0, bottom: 0, borderRadius: 0 }
                : { top: 10, left: 10, right: 10, bottom: 10, borderRadius: 36 }
            }
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={mode}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                <Screen capture={capture} title={chapter.title} reduce={reduce} />
              </motion.div>
            </AnimatePresence>
            {mode === 'phone' && <span className="absolute top-2.5 left-1/2 z-10 h-[22px] w-[30%] -translate-x-1/2 rounded-full bg-black" />}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* The page inside: scrollable by hand, drifting by itself until touched. */
function Screen({ capture, title, reduce }: { capture: Capture; title: string; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    let dir = 1;
    let touched = false;
    let visible = false;
    let wait = 90;
    const stop = () => {
      touched = true;
    };
    const tick = () => {
      if (!touched && visible) {
        if (wait > 0) wait--;
        else {
          el.scrollTop += 0.7 * dir;
          const end = el.scrollHeight - el.clientHeight;
          if (el.scrollTop >= end - 1 && dir > 0) {
            dir = -1;
            wait = 120;
          } else if (el.scrollTop <= 0 && dir < 0) {
            dir = 1;
            wait = 120;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    el.addEventListener('wheel', stop, { passive: true });
    el.addEventListener('pointerdown', stop);
    el.addEventListener('touchstart', stop, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('wheel', stop);
      el.removeEventListener('pointerdown', stop);
      el.removeEventListener('touchstart', stop);
    };
  }, [reduce, capture.src]);

  return (
    <div ref={ref} data-lenis-prevent className="stage-screen absolute inset-0">
      <Image src={capture.src} alt={title} width={capture.width} height={capture.height} sizes="(min-width: 768px) 60vw, 90vw" className="block h-auto w-full" />
    </div>
  );
}

function DesktopGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.2" />
      <path d="M5.5 13.5h5M8 11v2.5" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="4.5" y="1.5" width="7" height="13" rx="1.6" />
      <path d="M7 12.5h2" />
    </svg>
  );
}

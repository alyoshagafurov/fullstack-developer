'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useHaptics, useTelegram } from '@/components/mini/telegram';
import { Logo } from '@/components/ui/Logo';
import { PROMISE, site } from '@/lib/content/site';

/*
 * What a visitor sees when they press the blue button in the chat: the site's
 * first screen, folded to the size of a phone. Black, like the site's hero and
 * the card the bot's greeting stands on — the same question for a headline,
 * then the work itself on a computer and a phone, both screens scrolling the
 * same page, changing project every few seconds. Three facts that answer "how
 * fast and how safe", and the request button pinned under the thumb with the
 * promise right beneath it.
 *
 * Blue is spent once, on that button, and it stands alone in the bar: the
 * review link, which is for past clients, is in the «Ещё» list. Emphasis in
 * the headline is white against grey, the way the card sets it — no coloured
 * words.
 *
 * Project status is not on this screen: the bot answers it, from a button
 * under /start or from plain words.
 */

/**
 * The site's first screen in its own words, handed down from the page (which
 * reads lib/i18n/ru.ts on the server), so an edit to the hero reaches this
 * screen too and nothing here can drift from it.
 */
export type MiniIntro = {
  eyebrow: string;
  /** The statement, then the question set in grey. */
  headline: readonly string[];
  sub: string;
  /** How fast, how proven, how safe — the promise first. */
  facts: readonly { value: string; label: string }[];
};

export type MiniWork = {
  title: string;
  kind: string;
  host: string;
  desktop: string;
  phone: string;
  blur?: string;
  phoneBlur?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const TURN_MS = 6500;

/*
 * A focus ring the black background cannot swallow: the global one is
 * near-black. Inset inside the rounded list, where an outer ring is clipped.
 */
const RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
const RING_INSET = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';

/** Telegram's own way out to a browser or a chat when inside it; a plain link otherwise. */
function useOpeners() {
  const { app, inside } = useTelegram();
  const via = (run?: () => void) => (event: React.MouseEvent) => {
    if (!run) return;
    event.preventDefault();
    run();
  };
  return {
    web: (url: string) => via(inside && app ? () => app.openLink(url) : undefined),
    chat: (url: string) => via(inside && app ? () => app.openTelegramLink(url) : undefined),
  };
}

function Chevron() {
  return (
    <svg viewBox="0 0 10 16" className="h-3.5 w-2 text-bone-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2.5 2.5 8 8l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* One project on a computer with a phone leaning on it, both scrolling the same page. */
function Device({ work }: { work: MiniWork }) {
  return (
    <div className="relative pb-[10%]">
      <div className="overflow-hidden rounded-[12px] bg-[#1d1d1f] shadow-[0_40px_80px_-30px_rgb(255_255_255/0.12)] ring-1 ring-white/10">
        <div className="flex h-6 items-center gap-1.5 border-b border-white/5 bg-[#2a2a2c] px-2.5">
          <span className="size-[7px] rounded-full bg-[#ff5f57]" />
          <span className="size-[7px] rounded-full bg-[#febc2e]" />
          <span className="size-[7px] rounded-full bg-[#28c840]" />
          <span className="mx-auto max-w-[62%] truncate rounded bg-white/[0.07] px-5 py-0.5 text-[10px] text-bone-3">{work.host}</span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          <Image
            src={work.desktop}
            alt={work.title}
            fill
            sizes="(min-width: 480px) 440px, 90vw"
            unoptimized
            priority
            placeholder={work.blur ? 'blur' : 'empty'}
            blurDataURL={work.blur}
            className="screen-drift object-cover object-top"
          />
        </div>
      </div>
      <div className="absolute right-[-1%] bottom-0 w-[27%] rounded-[18px] bg-[#0b0b0c] p-[4px] shadow-[0_24px_50px_-12px_rgb(0_0_0/0.8)] ring-1 ring-white/15">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[14px] bg-black">
          <Image
            src={work.phone}
            alt=""
            fill
            sizes="(min-width: 480px) 120px, 30vw"
            unoptimized
            priority
            placeholder={work.phoneBlur ? 'blur' : 'empty'}
            blurDataURL={work.phoneBlur}
            className="screen-drift object-cover object-top"
          />
          <span className="absolute top-[2.4%] left-1/2 h-[3.2%] w-[32%] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}

export function Welcome({ intro, from, works }: { intro: MiniIntro; from: string | null; works: MiniWork[] }) {
  const haptics = useHaptics();
  const open = useOpeners();
  const reduce = useReducedMotion();
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const dm = `https://t.me/${site.contact.telegram}`;
  const work = works[at];
  const [statement, question] = intro.headline;

  /*
   * The projects take turns on the stage. They hold still while a pointer or
   * the keyboard focus is on them, and stop for good once a dot is picked —
   * from then on the visitor chooses (WCAG 2.2.2: nothing moves on its own
   * without a way to stop it). Someone who asked for less motion gets no
   * turning at all; the dots still change it, at their pace.
   */
  useEffect(() => {
    if (reduce || picked || hovered || focused || works.length < 2) return;
    const timer = window.setTimeout(() => setAt((i) => (i + 1) % works.length), TURN_MS);
    return () => window.clearTimeout(timer);
  }, [at, works.length, reduce, picked, hovered, focused]);

  /*
   * The same `initial` and `animate` whatever the setting, and only the timing
   * changes. `useReducedMotion` is null on the server and true on the first
   * client render for someone who asked for less motion, so branching the
   * props themselves left the server's `opacity: 0` in the page — React does
   * not patch styles when it hydrates — and the screen came up nearly empty.
   * The transition never reaches the markup, so it can differ safely.
   */
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });

  return (
    <div
      data-mini="welcome"
      data-tone="dark"
      className="flex flex-col bg-black text-bone"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop: 'calc(1rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
      }}
    >
      {/*
       * One column, phone-wide everywhere. Telegram Desktop opens Mini Apps in
       * a narrow window, but the page can also be opened full-screen or in a
       * browser, where a 1400px laptop mock-up would swallow the screen.
       */}
      <header className="mx-auto flex w-full max-w-[30rem] items-center justify-between px-5">
        <Logo className="h-6 w-auto invert" priority />
        <span className="text-[13px] text-bone-3">Душанбе · RU · EN · TJ</span>
      </header>

      <main className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col">
        <section className="px-5 pt-8 text-center">
          <motion.p {...rise(0)} className="text-[15px] font-medium text-bone-2">
            {intro.eyebrow}
          </motion.p>
          {/*
           * Kept whole rather than shortened for the phone — at this size it
           * sets in four short lines, and the question is what makes people
           * read on.
           */}
          <motion.h1
            {...rise(0.08)}
            className="mt-3 font-display text-[clamp(2.125rem,9.4vw,2.75rem)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance"
          >
            {statement}
            {question && <span className="text-bone-3"> {question}</span>}
          </motion.h1>
          <motion.p {...rise(0.16)} className="mx-auto mt-4 max-w-[21rem] text-[1.0625rem] leading-relaxed text-bone-2 text-pretty">
            {intro.sub}
          </motion.p>
        </section>

        {/* the proof: his sites, one at a time, on a computer and a phone */}
        <motion.section
          {...rise(0.26)}
          aria-label="Работы"
          className="mt-9 px-5"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          <div className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={work.title}
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <Device work={work} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={work.title}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="min-w-0 text-[15px] leading-snug"
              >
                {/* two lines, so the kind of business is read rather than cut off beside the dots */}
                <span className="block truncate font-semibold">{work.title}</span>
                <span className="block truncate text-[13px] text-bone-3">{work.kind}</span>
              </motion.p>
            </AnimatePresence>
            {/*
             * Each dot is a full 44px square to press, the pill drawn inside
             * it; the negative margin puts the last pill on the column's edge.
             */}
            <div className="-mr-3 flex shrink-0" role="group" aria-label="Проекты">
              {works.map((w, i) => (
                <button
                  key={w.title}
                  type="button"
                  aria-pressed={i === at}
                  aria-label={w.title}
                  onClick={() => {
                    haptics.tap();
                    setPicked(true);
                    setAt(i);
                  }}
                  className={`group grid size-11 place-items-center rounded-full ${RING}`}
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ${
                      i === at ? 'w-5 bg-bone' : 'w-1.5 bg-white/30 group-hover:bg-white/60'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* how fast, how proven, how safe — the promise first, in the site's own figures */}
        <motion.ul
          {...rise(0.36)}
          role="list"
          className="mx-5 mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-[18px] bg-white/10"
        >
          {intro.facts.map((f) => (
            <li key={f.label} className="bg-[#111112] px-3 py-4">
              <span className="block font-display text-[1.5rem] leading-none font-semibold tracking-[-0.03em]">{f.value}</span>
              <span className="mt-1.5 block text-[13px] leading-snug text-bone-2">{f.label}</span>
            </li>
          ))}
        </motion.ul>

        <motion.nav {...rise(0.44)} aria-label="Ещё" className="mx-5 mt-4 overflow-hidden rounded-[18px] bg-[#111112]">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={open.web(site.url)}
            className={`flex min-h-13 items-center justify-between px-4 py-2 text-base transition-colors hover:bg-white/5 active:bg-white/10 ${RING_INSET}`}
          >
            <span>
              Все работы и цены
              {from && <span className="block text-[13px] text-bone-3">цены {from.toLowerCase()}</span>}
            </span>
            <Chevron />
          </a>
          <span aria-hidden className="ml-4 block h-px bg-white/10" />
          <a
            href={dm}
            target="_blank"
            rel="noopener noreferrer"
            onClick={open.chat(dm)}
            className={`flex min-h-13 items-center justify-between px-4 text-base transition-colors hover:bg-white/5 active:bg-white/10 ${RING_INSET}`}
          >
            Написать Алишеру
            <Chevron />
          </a>
          <span aria-hidden className="ml-4 block h-px bg-white/10" />
          <a
            href="/mini/review"
            onClick={haptics.tap}
            className={`flex min-h-13 items-center justify-between px-4 text-base transition-colors hover:bg-white/5 active:bg-white/10 ${RING_INSET}`}
          >
            Оставить отзыв
            <Chevron />
          </a>
        </motion.nav>

        <div className="min-h-6 flex-1" />

        {/* the request, under the thumb, with the promise that makes it safe to press */}
        <div
          className="sticky bottom-0 z-10 mt-6 border-t border-white/10 bg-black/80 px-5 pt-3 backdrop-blur-xl"
          style={{ paddingBottom: 'calc(0.75rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))' }}
        >
          {/* the site's one blue, from its tokens, so the pressed shade matches too */}
          <a
            href="/mini/start"
            onClick={haptics.tap}
            className={`flex min-h-13 w-full items-center justify-center rounded-[14px] bg-action px-6 text-[1.0625rem] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-action-2 active:scale-[0.98] active:bg-action-3 motion-reduce:active:scale-100 ${RING}`}
          >
            Оставить заявку
          </a>
          <p className="mt-2 text-center text-[13px] leading-snug text-bone-2 text-balance">{PROMISE.full}</p>
        </div>
      </main>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useHaptics, useTelegram } from '@/components/mini/telegram';
import { Logo } from '@/components/ui/Logo';
import { site } from '@/lib/content/site';

/*
 * What a visitor sees when they press the blue button in the chat: the site's
 * first screen, folded to the size of a phone. Black, like the site's hero —
 * the headline with its blue-to-violet words, then the work itself on a
 * computer and a phone, both screens scrolling the same page, changing project
 * every few seconds. Three numbers that answer "how fast and how safe", and
 * the two things people come here to do, pinned under the thumb.
 *
 * Project status is not on this screen: the bot answers it, from a button
 * under /start or from plain words.
 */

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
      <div className="overflow-hidden rounded-[12px] bg-[#1d1d1f] shadow-[0_30px_70px_-25px_rgb(41_151_255/0.35)] ring-1 ring-white/10">
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
            sizes="90vw"
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
            sizes="30vw"
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

export function Welcome({ from, works }: { from: string | null; works: MiniWork[] }) {
  const haptics = useHaptics();
  const open = useOpeners();
  const reduce = useReducedMotion();
  const [at, setAt] = useState(0);
  const dm = `https://t.me/${site.contact.telegram}`;
  const work = works[at];

  // The projects take turns on the stage; a tap on a dot picks one and restarts the clock.
  useEffect(() => {
    if (works.length < 2) return;
    const timer = window.setTimeout(() => setAt((i) => (i + 1) % works.length), TURN_MS);
    return () => window.clearTimeout(timer);
  }, [at, works.length]);

  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay } };

  const facts = [
    { value: site.stats[0].value, label: 'проектов' },
    { value: '1–3 дня', label: 'до первого наброска' },
    { value: '50%', label: 'оплаты после наброска' },
  ];

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
      <header className="flex items-center justify-between px-5">
        <Logo className="h-6 w-auto invert" priority />
        <span className="text-[13px] text-bone-3">Душанбе · RU · EN · TJ</span>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="px-5 pt-9 text-center">
          <motion.p {...rise(0)} className="text-[15px] font-medium text-bone-2">
            Алишер Гафуров · веб-разработчик
          </motion.p>
          <motion.h1
            {...rise(0.08)}
            className="mt-3 font-display text-[clamp(2.4rem,11vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance"
          >
            Сайты, которые{' '}
            <span className="bg-gradient-to-r from-[#2997ff] to-[#a78bfa] bg-clip-text text-transparent">работают на&nbsp;бизнес.</span>
          </motion.h1>
          <motion.p {...rise(0.16)} className="mx-auto mt-4 max-w-[19rem] text-[1.0625rem] leading-relaxed text-bone-2 text-pretty">
            Дизайн, код и запуск. Один человек — от первого сообщения до результата.
          </motion.p>
        </section>

        {/* the proof: his sites, one at a time, on a computer and a phone */}
        <motion.section {...rise(0.26)} aria-label="Работы" className="mt-10 px-5">
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

          <div className="mt-5 flex items-center justify-between gap-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={work.title}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="min-w-0 truncate text-[15px]"
              >
                <span className="font-semibold">{work.title}</span>
                <span className="text-bone-3"> · {work.kind}</span>
              </motion.p>
            </AnimatePresence>
            <div className="flex shrink-0 gap-1.5" role="tablist" aria-label="Проекты">
              {works.map((w, i) => (
                <button
                  key={w.title}
                  type="button"
                  role="tab"
                  aria-selected={i === at}
                  aria-label={w.title}
                  onClick={() => {
                    haptics.tap();
                    setAt(i);
                  }}
                  className="grid h-8 place-items-center px-0.5"
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === at ? 'w-5 bg-bone' : 'w-1.5 bg-white/30'}`} />
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* how fast, how safe: the three questions every client asks first */}
        <motion.dl {...rise(0.36)} className="mx-5 mt-9 grid grid-cols-3 gap-px overflow-hidden rounded-[18px] bg-white/10">
          {facts.map((f) => (
            <div key={f.label} className="bg-[#111112] px-3 py-4">
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="block font-display text-[1.375rem] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap">{f.value}</span>
                <span className="mt-1.5 block text-[12px] leading-snug text-bone-3">{f.label}</span>
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.nav {...rise(0.44)} className="mx-5 mt-4 overflow-hidden rounded-[18px] bg-[#111112]">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={open.web(site.url)}
            className="flex min-h-13 items-center justify-between px-4 py-2 text-base active:bg-white/5"
          >
            <span>
              Все работы и цены
              {from && <span className="block text-[13px] text-bone-3">цены {from.toLowerCase()}</span>}
            </span>
            <Chevron />
          </a>
          <span aria-hidden className="ml-4 block h-px bg-white/10" />
          <a href={dm} target="_blank" rel="noopener noreferrer" onClick={open.chat(dm)} className="flex min-h-13 items-center justify-between px-4 text-base active:bg-white/5">
            Написать Алишеру
            <Chevron />
          </a>
        </motion.nav>

        <div className="min-h-6 flex-1" />

        {/* the two things people come for, under the thumb */}
        <div
          className="sticky bottom-0 z-10 mt-6 border-t border-white/10 bg-black/75 px-5 pt-3 backdrop-blur-xl"
          style={{ paddingBottom: 'calc(0.75rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))' }}
        >
          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <a
              href="/mini/start"
              onClick={haptics.tap}
              className="inline-flex min-h-13 items-center justify-center rounded-[14px] bg-[#0071e3] px-6 text-[1.0625rem] font-semibold text-white transition-transform active:scale-[0.98]"
            >
              Оставить заявку
            </a>
            <a
              href="/mini/review"
              onClick={haptics.tap}
              className="inline-flex min-h-13 items-center justify-center rounded-[14px] bg-white/10 px-5 text-[1.0625rem] font-semibold text-white transition-transform active:scale-[0.98]"
            >
              Отзыв
            </a>
          </div>
          <p className="mt-2 text-center text-[12px] text-bone-3">Пара минут · отвечаю {site.responseTime.toLowerCase()}</p>
        </div>
      </main>
    </div>
  );
}

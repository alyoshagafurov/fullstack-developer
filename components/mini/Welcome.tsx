'use client';

import Image from 'next/image';
import { primary } from '@/components/mini/MiniStage';
import { useHaptics, useTelegram } from '@/components/mini/telegram';
import { Logo } from '@/components/ui/Logo';
import { site } from '@/lib/content/site';

/*
 * What a visitor sees when they press the blue button in the chat — the site's
 * first screen, folded to the size of a phone: who and what in one large line,
 * the proof right under it (three real projects you can swipe), and the two
 * things people come here to do as two clear buttons. Everything else is one
 * tap away on the site, listed the way iOS lists settings.
 *
 * Project status is not on this screen: the bot answers it, from a button
 * under /start or from plain words.
 */

const WORKS = [
  { title: 'ArusDomod', kind: 'Магазин свадебных нарядов', image: '/cases/arusdomod-desktop.webp' },
  { title: 'AutoShine', kind: 'Магазин автокосметики', image: '/cases/autoshine-store-desktop.webp' },
  { title: 'mimi', kind: 'Маркетинговое агентство', image: '/cases/mimi-desktop.webp' },
];

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

const secondary =
  'inline-flex min-h-13 w-full items-center justify-center rounded-[14px] bg-wall-2 px-7 text-[1.0625rem] font-semibold text-[#0071e3] transition-[background-color,transform] active:scale-[0.98] active:bg-wall-3';

function Chevron() {
  return (
    <svg viewBox="0 0 10 16" className="h-3.5 w-2 text-bone-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2.5 2.5 8 8l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Welcome({ from }: { from: string | null }) {
  const haptics = useHaptics();
  const open = useOpeners();
  const dm = `https://t.me/${site.contact.telegram}`;
  const facts = [`${site.stats[0].value} проектов`, from ? `цены ${from.toLowerCase()}` : null].filter(Boolean);

  return (
    <div
      data-mini="client"
      className="flex flex-col bg-wall text-bone"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop: 'calc(1.25rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
        paddingBottom: 'calc(1.25rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))',
      }}
    >
      <header className="flex items-center justify-between px-5">
        <Logo className="h-6 w-auto" priority />
        <span className="text-sm text-bone-3">Душанбе · RU · EN · TJ</span>
      </header>

      <main className="flex flex-1 flex-col px-5 pt-10">
        <h1 className="font-display text-[clamp(2.25rem,10vw,3rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
          Сайты, которые работают на бизнес.
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-bone-2">Дизайн, код и запуск. Один человек — от первого сообщения до результата.</p>
        <p className="mt-3 text-sm font-medium text-bone-3">{facts.join(' · ')}</p>

        {/* the proof: three real projects, swiped sideways */}
        <div className="-mx-5 mt-7 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {WORKS.map((w) => (
            <figure key={w.title} className="w-[78%] shrink-0 snap-start">
              <div className="overflow-hidden rounded-[14px] bg-wall-2 ring-1 ring-black/5">
                <div className="flex h-6 items-center gap-1.5 bg-[#f6f6f8] px-3">
                  <span className="size-2 rounded-full bg-[#ff5f57]" />
                  <span className="size-2 rounded-full bg-[#febc2e]" />
                  <span className="size-2 rounded-full bg-[#28c840]" />
                </div>
                <div className="relative aspect-[16/10]">
                  <Image src={w.image} alt={w.title} fill sizes="80vw" className="object-cover object-top" />
                </div>
              </div>
              <figcaption className="mt-2 text-sm">
                <span className="font-semibold">{w.title}</span>
                <span className="text-bone-3"> · {w.kind}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-auto space-y-2.5 pt-8">
          <a href="/mini/start" onClick={haptics.tap} className={primary}>
            Оставить заявку
          </a>
          <a href="/mini/review" onClick={haptics.tap} className={secondary}>
            Оставить отзыв
          </a>
          <p className="pt-1 text-center text-sm text-bone-3">Заявка — пара минут · отвечаю {site.responseTime.toLowerCase()}</p>
        </div>

        <nav className="mt-6 overflow-hidden rounded-[14px] bg-wall-2">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={open.web(site.url)}
            className="flex min-h-13 items-center justify-between px-4 text-base active:bg-wall-3"
          >
            Проекты и отзывы на сайте
            <Chevron />
          </a>
          <span aria-hidden className="ml-4 block h-px bg-seam" />
          <a href={dm} target="_blank" rel="noopener noreferrer" onClick={open.chat(dm)} className="flex min-h-13 items-center justify-between px-4 text-base active:bg-wall-3">
            Написать Алишеру
            <Chevron />
          </a>
        </nav>
      </main>
    </div>
  );
}

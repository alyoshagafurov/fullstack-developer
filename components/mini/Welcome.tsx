'use client';

import { useEffect, useState } from 'react';
import { Sculpture } from '@/components/three/Sculpture';
import { primary, quiet } from '@/components/mini/MiniStage';
import { useHaptics, useTelegram } from '@/components/mini/telegram';
import { site } from '@/lib/content/site';

/*
 * What a visitor sees when they press the blue button.
 *
 * It used to be a heading — «Чем помочь?» — over three tiles with an emoji on
 * each. The owner called it unprofessional, and his own design notes name the
 * exact fault: pictograms used as navigation. A list of tiles is how a settings
 * screen looks, and this is the first screen of a portfolio.
 *
 * So it is set as a magazine cover, the one form his site already speaks: one
 * enormous line, one object, a strip of small facts, and one thing to press.
 * Everything on it is his. The headline is the opening of his own statement in
 * site.ts, «не сайты, а впечатления»; the subhead is his stated difference; the
 * count and the city are his; the price is the lowest one on his own list.
 *
 * The cloud is the same one every page of the site ends on, and it arrives the
 * way it arrives there — dust gathering into a form — once, as the screen
 * opens. Pressing «Оставить заявку» opens the brief on the same black with the
 * same kind of cloud, so the cover and the form read as one continuous thing.
 *
 * The owner never lands here from his own button: his opens the panel.
 */

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
    chat: (url: string, thenClose = false) =>
      via(
        inside && app
          ? () => {
              app.openTelegramLink(url);
              if (thenClose) app.close();
            }
          : undefined,
      ),
  };
}

export function Welcome({ from }: { from: string | null }) {
  const haptics = useHaptics();
  const open = useOpeners();

  /*
   * The cloud starts as dust and gathers once. It never scatters again: this is
   * an arrival, not a loop, and a cover that keeps moving under its headline
   * makes the headline harder to read.
   */
  const [gathered, setGathered] = useState(0.62);
  useEffect(() => {
    const timer = window.setTimeout(() => setGathered(1), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const facts = [`${site.stats[0].value} проектов`, from ? `цены ${from.toLowerCase()}` : 'цены'];
  const prices = `${site.url}/prices`;
  const work = `${site.url}/work`;
  const dm = `https://t.me/${site.contact.telegram}`;
  const status = `https://t.me/${site.contact.bot}?start=status`;

  return (
    <div
      data-mini
      className="relative isolate flex flex-col overflow-hidden bg-void text-paper"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop:
          'calc(1.25rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
        paddingBottom:
          'calc(1rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))',
      }}
    >
      {/* The object. Upper part of the frame only, so it never sits behind a word. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%]">
        <Sculpture shape="stone" progress={gathered} eager className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0) 40%, rgba(5,5,5,0.88) 82%, #050505 100%)',
          }}
        />
      </div>

      {/* Masthead: the brand, a hairline, and where he is. */}
      <header className="flex shrink-0 items-center gap-3 px-5">
        <span className="text-[0.9375rem] font-bold tracking-[-0.02em]">{site.brand}</span>
        <span aria-hidden className="h-px flex-1 bg-white/20" />
        <span className="text-[0.6875rem] tracking-[0.18em] whitespace-nowrap text-paper/45 uppercase">
          Душанбе · RU · TJ · EN
        </span>
      </header>

      {/* The cover line sits low, under the object, the way a cover sets it. */}
      <main className="flex flex-1 flex-col justify-end px-5">
        <p className="text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">
          Сайты · магазины · боты
        </p>

        <h1 className="mt-3 text-[clamp(2.5rem,11.5vw,3.25rem)] leading-[0.95] font-bold tracking-[-0.04em]">
          Не сайты,
          <br />а впечатления.
        </h1>

        <p className="mt-4 max-w-[30ch] text-[0.9375rem] leading-[1.45] text-paper/60">
          От идеи и дизайна до сервера и запуска — без посредников.
        </p>

        {/* The fact strip is the price link: one row doing two jobs. */}
        <a
          href={prices}
          target="_blank"
          rel="noopener noreferrer"
          onClick={open.web(prices)}
          className="tabular mt-5 flex min-h-11 items-center justify-between border-t border-white/15 text-[0.6875rem] tracking-[0.16em] text-paper/50 uppercase transition-colors active:text-paper"
        >
          <span>{facts.join(' · ')}</span>
          <span aria-hidden className="text-paper/35">
            ↗
          </span>
        </a>

        <a href="/mini/start" onClick={haptics.tap} className={`${primary} mt-4 active:scale-[0.98]`}>
          Оставить заявку
          <span aria-hidden>→</span>
        </a>
        <p className="mt-2 text-center text-xs text-paper/45">
          Пара минут · отвечаю {site.responseTime.toLowerCase()}
        </p>

        <nav className="mt-3 flex justify-between">
          <a href={work} target="_blank" rel="noopener noreferrer" onClick={open.web(work)} className={quiet}>
            Работы ↗
          </a>
          <a href={dm} target="_blank" rel="noopener noreferrer" onClick={open.chat(dm)} className={quiet}>
            Написать Алишеру ↗
          </a>
        </nav>

        {/* The quietest line: for people who are already clients. */}
        <p className="mt-1 text-center text-[0.8125rem]">
          <span className="text-paper/35">Уже работаем? </span>
          <a href={status} onClick={open.chat(status, true)} className={quiet}>
            Статус проекта
          </a>
          <span className="text-paper/35"> · </span>
          <a href="/mini/review" onClick={haptics.tap} className={quiet}>
            Отзыв
          </a>
        </p>
      </main>
    </div>
  );
}

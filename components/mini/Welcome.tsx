'use client';

import { useEffect, useState } from 'react';
import { Sculpture } from '@/components/three/Sculpture';
import { primary } from '@/components/mini/MiniStage';
import { useHaptics, useTelegram } from '@/components/mini/telegram';
import { site } from '@/lib/content/site';

/*
 * What a visitor sees when they press the blue button.
 *
 * Set as a magazine cover, the one form the owner's site already speaks: one
 * enormous line, one object, a strip of small facts. Everything on it is his.
 * The headline is the opening of his own statement in site.ts, «не сайты, а
 * впечатления»; the subhead is his stated difference; the count and the city
 * are his; the price is the lowest one on his own list.
 *
 * Below the cover, the things to press — and every one of them looks like
 * something to press. The first version set the secondary actions as quiet
 * text with an arrow, which reads as tidy to a designer and as decoration to a
 * client: the owner looked at it and said, rightly, that a visitor would not
 * know where to tap. So:
 *
 *   Two full-size buttons, because two kinds of people arrive here — someone
 *   who wants something built, and a client who wants to say how it went. Same
 *   size, so neither is hidden; one filled and one outlined, so the eye still
 *   knows which comes first.
 *
 *   Two smaller ones under them, shaped as buttons rather than links. Anything
 *   a visitor might want to look at — his projects, the reviews, the prices —
 *   is on the website, so one button takes them there instead of four
 *   half-hidden links each doing a part of it.
 *
 * Project status is not on this screen. It belongs to a client who already has
 * a number and a code, and the bot itself answers it — there is a «Статус
 * проекта» button under /start, and the bot recognises «какой статус моей
 * заявки» in plain words.
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
    chat: (url: string) => via(inside && app ? () => app.openTelegramLink(url) : undefined),
  };
}

/* The second full-size button: as large as the first, drawn rather than filled. */
const outline =
  'inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full border border-white/50 px-7 text-[0.9375rem] font-semibold tracking-[0.02em] text-paper transition-colors active:scale-[0.98] active:bg-white/10';

/*
 * The two smaller ones: unmistakably buttons, quieter than the two above.
 *
 * Never wrapped inside the pill — a label broken over two lines turns a button
 * into a box with words in it. On a phone wide enough they sit side by side;
 * on a narrow one each takes its own row rather than being squeezed, which is
 * what the 9.5rem basis decides.
 */
const small =
  'inline-flex min-h-11 flex-[1_1_9.5rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.08] px-3 text-sm whitespace-nowrap text-paper transition-colors active:bg-white/15';

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

  const facts = [`${site.stats[0].value} проектов`, from ? `цены ${from.toLowerCase()}` : null].filter(Boolean);
  const dm = `https://t.me/${site.contact.telegram}`;

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
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[52%]">
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

        <h1 className="mt-3 text-[clamp(2.25rem,10.5vw,3rem)] leading-[0.95] font-bold tracking-[-0.04em]">
          Не сайты,
          <br />а впечатления.
        </h1>

        <p className="mt-3 max-w-[30ch] text-[0.9375rem] leading-[1.45] text-paper/60">
          От идеи и дизайна до сервера и запуска — без посредников.
        </p>

        {/* Facts, and only facts: nothing on this line pretends to be a link. */}
        <p className="tabular mt-4 border-t border-white/15 pt-3 text-[0.6875rem] tracking-[0.16em] text-paper/50 uppercase">
          {facts.join(' · ')}
        </p>

        <div className="mt-5 space-y-2.5">
          <a href="/mini/start" onClick={haptics.tap} className={`${primary} active:scale-[0.98]`}>
            Оставить заявку
            <span aria-hidden>→</span>
          </a>
          <a href="/mini/review" onClick={haptics.tap} className={outline}>
            Оставить отзыв
          </a>
        </div>

        <p className="mt-2 text-center text-xs text-paper/45">
          Заявка — пара минут · отвечаю {site.responseTime.toLowerCase()}
        </p>

        <nav className="mt-4 flex flex-wrap gap-2.5">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={open.web(site.url)}
            className={small}
          >
            Проекты и отзывы
          </a>
          <a href={dm} target="_blank" rel="noopener noreferrer" onClick={open.chat(dm)} className={small}>
            Написать Алишеру
          </a>
        </nav>
      </main>
    </div>
  );
}

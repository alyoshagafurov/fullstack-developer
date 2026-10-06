'use client';

import { useEffect, useState } from 'react';
import { site } from '@/lib/content/site';
import { useHaptics } from '@/components/mini/telegram';

/*
 * What the blue button in the chat opens.
 *
 * Telegram gives a bot exactly one menu button per chat — `setChatMenuButton`
 * takes a single `menu_button`, not a list — so "one button for the app and
 * another for the admin" cannot be two blue buttons side by side. It can be one
 * blue button onto a screen where both are a tap away, which is what this is.
 *
 * It costs a visitor nothing: they press Open and land on the two things they
 * might actually want, instead of on a list of slash commands.
 *
 * The owner's button carries `?admin=1`, and that flag only decides whether the
 * panel tile is drawn. It is trivial to type by hand and it is meant to be
 * harmless: the panel itself is guarded by the signature Telegram puts on the
 * launch, checked on the server for every single request. A stranger who
 * guesses the flag gets a tile that refuses them.
 */

const tile =
  'flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-4 text-left transition-colors hover:border-paper';

export default function MiniHubPage() {
  const haptics = useHaptics();
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    setOwner(new URLSearchParams(window.location.search).get('admin') === '1');
  }, []);

  return (
    <div
      data-mini
      className="flex flex-col justify-center bg-void text-paper"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100svh)',
        paddingTop:
          'calc(1.5rem + var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
        paddingBottom:
          'calc(1.5rem + var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="w-full px-5">
        <p className="text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase">{site.brand}</p>
        <h1 className="mt-2 text-[clamp(1.75rem,8vw,2.5rem)] leading-[1.05] font-bold tracking-[-0.035em]">
          {owner ? 'Что открыть?' : 'Чем помочь?'}
        </h1>

        <nav className="mt-8 space-y-3">
          {owner && (
            <Tile
              href="/mini/admin"
              icon="⚙️"
              title="Админка"
              note="Заявки, деньги, сайт, бот"
              onPress={haptics.tap}
            />
          )}

          <Tile
            href="/mini/start"
            icon="📝"
            title="Оставить заявку"
            note={owner ? 'То, что видят клиенты' : 'Тринадцать вопросов, пара минут'}
            onPress={haptics.tap}
          />

          <Tile
            href="/mini/review"
            icon="⭐"
            title="Оставить отзыв"
            note={owner ? 'То, что видят клиенты' : 'Пять вопросов о работе'}
            onPress={haptics.tap}
          />
        </nav>

        <p className="mt-8 text-center text-xs text-paper/35">{site.url.replace('https://', '')}</p>
      </div>
    </div>
  );
}

function Tile({
  href,
  icon,
  title,
  note,
  onPress,
}: {
  href: string;
  icon: string;
  title: string;
  note: string;
  onPress: () => void;
}) {
  return (
    /*
     * A plain link. These addresses are the same Mini App, so Telegram keeps the
     * window open and the launch signature it was handed stays valid — there is
     * nothing to carry across.
     */
    <a href={href} onClick={onPress} className={tile}>
      <span aria-hidden className="text-2xl">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-paper/55">{note}</span>
      </span>
      <span aria-hidden className="ml-auto text-paper/35">
        →
      </span>
    </a>
  );
}

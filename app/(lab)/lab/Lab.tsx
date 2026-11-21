'use client';

import { useEffect, useState } from 'react';
import type { LabData } from './data';
import { Quiet } from './concepts/Quiet';
import { Motion } from './concepts/Motion';
import { Air } from './concepts/Air';
import { Spotlight } from './concepts/Spotlight';
import { Bento } from './concepts/Bento';

/*
 * The switcher: five concepts, one at a time, full screen. A pill at the
 * bottom picks one; the arrow keys step through them.
 */

const CONCEPTS = [
  { key: 'quiet', letter: 'A', name: 'Тишина', note: 'журнал: белый лист, тонкий крупный шрифт, работы списком, фото всплывает за курсором', View: Quiet },
  { key: 'motion', letter: 'B', name: 'Движение', note: 'крупная типографика, буквы собираются, работы-карточки наслаиваются при прокрутке', View: Motion },
  { key: 'air', letter: 'C', name: 'Воздух', note: 'мягкие цветные облака, стеклянные карточки, ты в центре, всё плавает', View: Air },
  { key: 'spot', letter: 'D', name: 'Прожектор', note: 'чёрно-белое, круг-курсор открывает цветное фото, работы листаются', View: Spotlight },
  { key: 'bento', letter: 'E', name: 'Бенто', note: 'сетка аккуратных плиток, в каждой своя маленькая анимация', View: Bento },
] as const;

export function Lab({ data }: { data: LabData }) {
  const [index, setIndex] = useState(0);
  const concept = CONCEPTS[index]!;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % CONCEPTS.length);
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + CONCEPTS.length) % CONCEPTS.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const View = concept.View;

  return (
    <>
      <View data={data} />

      <div className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-3">
        <div className="flex max-w-full flex-col items-center gap-2 rounded-[22px] bg-black/85 p-2 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex gap-1">
            {CONCEPTS.map((c, i) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm transition-colors ${
                  i === index ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <b>{c.letter}</b>
                <span className="hidden sm:inline">{c.name}</span>
              </button>
            ))}
          </div>
          <p className="px-3 pb-1 text-center text-xs text-white/60">
            <b className="text-white">{concept.letter}. {concept.name}</b> — {concept.note}
          </p>
        </div>
      </div>
    </>
  );
}

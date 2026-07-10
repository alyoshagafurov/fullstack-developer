'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useReveal } from './useReveal';
import SplitText from './SplitText';

const FACTS = [
  { k: 'Роль', v: 'Full-Stack разработчик' },
  { k: 'Город', v: 'Душанбе, Таджикистан' },
  { k: 'Фокус', v: 'Веб-приложения · Интерфейсы · Скорость' },
  { k: 'Языки', v: 'Русский · English · Тоҷикӣ' },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section id="about" ref={ref} className="relative py-28 md:py-44">
      <div className="mx-auto max-w-wide px-6 md:px-10">
        <div className="label mb-14 md:mb-20" data-reveal="0">О себе</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div data-reveal="1" className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-[440px] mx-auto lg:mx-0 overflow-hidden rounded-3xl border border-line">
              <Image
                src="/hero-face.jpg"
                alt="Алишер Гафуров"
                fill
                data-parallax="0.04"
                data-pscale="1.12"
                className="object-cover object-top grayscale will-change-transform"
                sizes="(max-width:1024px) 90vw, 440px"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(7,7,7,0.85) 100%)' }} />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between label text-[10px] text-ink/80">
                <span>Алишер Гафуров</span><span>2026</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <SplitText as="h2" className="display text-ink text-[8vw] md:text-[3.4rem] max-w-2xl mb-10">
              Разработчик, который доводит до результата
            </SplitText>

            <div className="space-y-6 max-w-2xl text-ink-2 text-lg leading-relaxed">
              <p data-reveal="2">
                Я — Алишер Гафуров, Full-Stack веб-разработчик. Создаю современные,
                быстрые и функциональные сайты, которые помогают бизнесу и личным
                брендам выделяться в цифровом пространстве.
              </p>
              <p data-reveal="3">
                Для меня разработка — это не просто код, а создание сильного
                цифрового продукта: он выглядит профессионально, работает быстро и
                приносит клиенту заявки. Веду проект от идеи до запуска и остаюсь на
                связи после сдачи.
              </p>
              <p data-reveal="3" className="text-ink-2/80">
                Вне работы занимаюсь спортом — он приучил к дисциплине и спокойствию
                под давлением. Те же качества приношу в каждый проект.
              </p>
            </div>

            <dl data-reveal="4" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 max-w-2xl">
              {FACTS.map((f) => (
                <div key={f.k} className="flex flex-col gap-1 border-t border-line pt-4">
                  <dt className="label text-[10px]">{f.k}</dt>
                  <dd className="text-ink text-[15px] md:text-base">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '@/components/museum/Icons';

export type Room = {
  key: string;
  word: string;
  script: string;
  price: string | null;
  href: string;
  cool?: boolean;
};

/*
 * Choosing a direction is switching on a room. Four slatted wall panels stand
 * side by side in the dark; the one you point at widens and its cove light
 * comes on behind the battens, and its name, price and door appear. On a phone
 * the panels stack, and the one in the middle of the screen is the lit one.
 */
export function Rooms({
  title,
  note,
  fromLabel,
  rooms,
}: {
  title: string;
  note: string;
  fromLabel: string;
  rooms: Room[];
}) {
  const [active, setActive] = useState(rooms[0]?.key ?? '');
  const list = useRef<HTMLUListElement>(null);

  // Phones: the panel crossing the middle of the screen is the lit one.
  useEffect(() => {
    if (matchMedia('(min-width: 1024px)').matches || !list.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.room ?? '');
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    list.current.querySelectorAll('[data-room]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-wall py-28 md:py-40" aria-labelledby="rooms-title">
      <div className="hall flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="rooms-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{title}</span>
          </span>
        </h2>
        <p className="wall-note md:mb-3 md:text-right">{note}</p>
      </div>

      <ul ref={list} className="hall mt-14 flex flex-col gap-3 md:mt-20 lg:h-[72svh] lg:flex-row">
        {rooms.map((room) => {
          const on = room.key === active;
          return (
            <li
              key={room.key}
              data-room={room.key}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setActive(room.key);
              }}
              className={`relative overflow-hidden transition-[flex-grow] duration-700 ease-[var(--ease-gallery)] lg:min-w-0 ${
                on ? 'lg:grow-[2.4]' : 'lg:grow'
              } lg:basis-0`}
            >
              <Link
                href={room.href}
                onFocus={() => setActive(room.key)}
                className="slats group relative flex h-[42svh] flex-col justify-end overflow-hidden p-6 md:p-8 lg:h-full"
              >
                {/* The cove light behind the battens. */}
                <span
                  aria-hidden
                  className={`absolute inset-0 transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-0'} ${
                    room.cool
                      ? 'bg-[linear-gradient(to_top,rgb(45_77_255/0.55),rgb(45_77_255/0.12)_45%,transparent_80%)]'
                      : 'bg-[linear-gradient(to_top,rgb(255_190_120/0.45),rgb(255_190_120/0.1)_45%,transparent_80%)]'
                  }`}
                />
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-[2px] transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-0'} ${
                    room.cool ? 'led-cobalt' : 'led'
                  }`}
                />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.75),transparent_55%)]" />

                {/* A closed room shows its name up the wall, like a sign on a door. */}
                <span
                  aria-hidden
                  className={`font-display absolute bottom-8 left-6 hidden text-[clamp(2rem,3.2vw,3.25rem)] leading-none font-black whitespace-nowrap text-bone/40 transition-opacity duration-500 [font-synthesis:none] [writing-mode:vertical-rl] rotate-180 md:left-8 lg:block ${
                    on ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {room.word}
                </span>

                <span className={`relative transition-opacity duration-500 ${on ? '' : 'lg:opacity-0'}`}>
                  <span className="font-display block text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9] font-black whitespace-nowrap text-bone [font-synthesis:none]">
                    {room.word}
                  </span>
                  <span
                    className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
                  >
                    <span>
                      <span className="script block text-[clamp(1.25rem,1.8vw,1.75rem)]">{room.script}</span>
                      {room.price && (
                        <span className="mt-2 block text-sm text-bone-2">
                          {fromLabel} {room.price.replace(/^(от|from)\s+/i, '')}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-seam-2 text-bone transition-colors duration-500 group-hover:border-brass group-hover:bg-brass group-hover:text-wall">
                      <ArrowIcon className="size-5" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

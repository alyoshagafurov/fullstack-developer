'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowIcon } from '@/components/museum/Icons';

export type Work = { slug: string; href: string; title: string; caption: string; image: string };

/*
 * The work (concepts B + D): on black, one large card per project, each
 * sticking a little lower than the one before so they pile up as you scroll.
 * A screenshot waits in grey and comes into colour when its card reaches the
 * top of the pile (or under the pointer).
 */
export function StackedWorks({
  title,
  note,
  works,
  allHref,
  allLabel,
  openLabel,
}: {
  title: string;
  note: string;
  works: Work[];
  allHref: string;
  allLabel: string;
  openLabel: string;
}) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!list.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle('is-on', entry.isIntersecting);
      },
      { rootMargin: '-25% 0px -45% 0px' },
    );
    list.current.querySelectorAll('[data-colour]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (works.length === 0) return null;

  return (
    <section id="work" data-tone="dark" className="bg-wall py-24 md:py-32" aria-labelledby="works-title">
      <div className="hall flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="works-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{title}</span>
          </span>
        </h2>
        <div className="md:max-w-sm md:text-right">
          <p className="lead-line">{note}</p>
          <Link href={allHref} className="link-more mt-4">
            {allLabel} <ArrowIcon />
          </Link>
        </div>
      </div>

      <ul ref={list} className="hall-wide mt-14 md:mt-20">
        {works.map((work, index) => (
          <li
            key={work.slug}
            className="sticky mb-6 md:mb-10"
            style={{ top: `calc(4.5rem + ${index * 18}px)` }}
          >
            <Link
              href={work.href}
              data-colour
              className="group block overflow-hidden rounded-[32px] bg-wall-2 p-4 shadow-[0_-30px_60px_-30px_rgb(0_0_0/0.9)] md:p-6"
            >
              <div className="flex items-center justify-between gap-4 px-2 pb-4 md:pb-6">
                <span className="room-title">{work.title}</span>
                <span className="flex items-center gap-4 text-sm text-bone-2">
                  <span className="hidden sm:inline">{work.caption}</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-bone">
                    {openLabel}
                    <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] md:aspect-[16/8]">
                <Image
                  src={work.image}
                  alt={work.title}
                  fill
                  sizes="(min-width: 1440px) 1400px, 96vw"
                  className="object-cover object-top group-hover:scale-[1.02]"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

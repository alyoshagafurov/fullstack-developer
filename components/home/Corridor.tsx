'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowIcon } from '@/components/museum/Icons';

gsap.registerPlugin(ScrollTrigger);

export type Work = { slug: string; href: string; title: string; caption: string; image: string };

/*
 * The corridor. A long dark hall drawn only by its light lines — floor
 * strips, ceiling edges, a warm doorway at the end — and the works hang in it
 * one behind another. Scrolling walks you forward: each work comes out of the
 * dark, is lit as you reach it, and passes beside you.
 *
 * Without the script, or with reduced motion, the works are a plain column;
 * the corridor is only switched on once it can actually move.
 */

const GAP = 1150;

export function Corridor({
  title,
  script,
  note,
  hint,
  works,
  allHref,
  allLabel,
  openLabel,
}: {
  title: string;
  script: string;
  note: string;
  hint: string;
  works: Work[];
  allHref: string;
  allLabel: string;
  openLabel: string;
}) {
  const root = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setDeep(true);
  }, []);

  useEffect(() => {
    if (!deep || !root.current) return;
    const section = root.current;
    const items = Array.from(section.querySelectorAll<HTMLElement>('[data-depth-item]'));
    const walk = items.length * GAP;

    const place = (camera: number) => {
      const spread = window.innerWidth >= 1024 ? window.innerWidth * 0.17 : 0;
      items.forEach((el, i) => {
        const z = -(i + 1) * GAP + camera;
        const x = (i % 2 === 0 ? -1 : 1) * spread;
        const far = z < -3600 ? 0 : z < -2600 ? (z + 3600) / 1000 : 1;
        const near = z > 260 ? Math.max(0, 1 - (z - 260) / 260) : 1;
        el.style.transform = `translate3d(calc(-50% + ${x}px), -50%, ${z}px)`;
        el.style.opacity = String(Math.min(far, near));
        el.style.pointerEvents = z > -900 && z < 300 ? 'auto' : 'none';
        el.classList.toggle('is-lit', z > -1250 && z < 320);
      });
      if (head.current) head.current.style.opacity = String(Math.max(0.12, 1 - camera / 900));
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${walk * 0.85}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => place(self.progress * (walk + 150)),
    });
    place(0);
    const onResize = () => place(trigger.progress * (walk + 150));
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      trigger.kill();
    };
  }, [deep]);

  if (works.length === 0) return null;

  return (
    <section
      ref={root}
      id="work"
      aria-labelledby="work-title"
      className={`relative overflow-hidden bg-wall ${deep ? 'h-[100svh]' : 'py-28'}`}
    >
      {deep && (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full [filter:drop-shadow(0_0_4px_rgb(255_214_160/0.9))_drop-shadow(0_0_18px_rgb(255_170_100/0.4))]"
        >
          {/* Floor strips and ceiling edges, all running to the far door. */}
          <g stroke="#ffe2b8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" fill="none">
            <line x1="-5" y1="100" x2="43" y2="58" vectorEffect="non-scaling-stroke" />
            <line x1="105" y1="100" x2="57" y2="58" vectorEffect="non-scaling-stroke" />
            <line x1="-5" y1="0" x2="43" y2="40" vectorEffect="non-scaling-stroke" opacity="0.35" />
            <line x1="105" y1="0" x2="57" y2="40" vectorEffect="non-scaling-stroke" opacity="0.35" />
          </g>
        </svg>
      )}
      {deep && (
        <div aria-hidden className="pointer-events-none absolute top-[40%] left-[43%] h-[18%] w-[14%]">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(255_200_140/0.05),rgb(255_200_140/0.28))]" />
          <div className="absolute -inset-[60%] bg-[radial-gradient(ellipse_at_50%_80%,rgb(255_190_120/0.18),transparent_60%)]" />
        </div>
      )}

      <div ref={head} className={`hall ${deep ? 'pointer-events-none absolute inset-x-0 top-24 z-10 md:top-28' : ''}`}>
        <div className="flex items-start justify-between gap-8">
          <div>
            <h2 id="work-title" className="hall-title text-[clamp(3rem,8vw,8.5rem)]">
              {title}
            </h2>
            <p className="script mt-2 ml-1 -rotate-[3deg] text-[clamp(1.375rem,2.4vw,2.25rem)]">{script}</p>
          </div>
          <p className="wall-note mt-3 hidden text-right md:block">{note}</p>
        </div>
      </div>

      <ul
        className={
          deep
            ? 'absolute inset-0 [perspective:900px] [transform-style:preserve-3d]'
            : 'hall mt-16 grid gap-20 md:grid-cols-2'
        }
      >
        {works.map((work) => (
          <li
            key={work.slug}
            data-depth-item
            data-lamp
            className={deep ? 'absolute top-[56%] left-1/2 w-[80vw] will-change-transform md:w-[46vw] lg:w-[min(42vw,58svh*1.6)]' : ''}
          >
            <Link href={work.href} className="group block">
              <div className="relative">
                <div className="lamp pointer-events-none absolute -inset-x-[8%] -top-[30%] bottom-[30%] bg-[radial-gradient(ellipse_40%_70%_at_50%_0%,rgb(255_214_160/0.3),transparent_72%)]" />
                <div className="exhibit aspect-[16/10] overflow-hidden">
                  <Image
                    src={work.image}
                    alt={work.title}
                    fill
                    sizes="(min-width: 1024px) 42vw, 80vw"
                    className="lit-image object-cover object-top"
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-6">
                <span className="font-display text-[clamp(1.375rem,2.2vw,2.25rem)] leading-none font-black [font-synthesis:none]">
                  {work.title}
                  <span className="wall-label ml-3 align-middle">{work.caption}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-bone-2 transition-colors group-hover:text-brass">
                  {openLabel}
                  <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className={`hall flex items-end justify-between gap-6 ${deep ? 'absolute inset-x-0 bottom-28 z-10 md:bottom-8' : 'mt-16'}`}>
        {deep && <p className="wall-label">{hint}</p>}
        <Link href={allHref} className="link-quiet text-sm">
          {allLabel}
        </Link>
      </div>
    </section>
  );
}

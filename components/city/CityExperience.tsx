'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { scrollPageTo } from '@/components/museum/GalleryMotion';
import type { CityEngine, TowerSpec } from '@/components/city/engine';

export type CityWork = {
  slug: string;
  title: string;
  kind: string;
  line: string;
  meta: string;
  liveUrl: string | null;
  href: string;
  desktop: TowerSpec;
  phone: TowerSpec | null;
};

type Copy = {
  name: string;
  role: string;
  title: string[];
  sub: string;
  cta: string;
  scrollCue: string;
  skip: string;
  loading: string;
  districtTitle: string;
  districtNote: string;
  screenHint: string;
  openSite: string;
  howMade: string;
  finalTitle: string[];
  finalNote: string;
  finalForm: string;
  whatsapp: string;
  chapters: { arrival: string; contact: string };
};

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * The home as a night city you fly through. The page is a tall section; a
 * full-screen canvas stays pinned while the scroll moves the camera along its
 * path. Above the canvas, ordinary HTML tells the story — readable at once,
 * before a single building has loaded, and by search engines.
 *
 * What the visitor must take away, in order: who this is and what he does
 * (first screen, with his face and the number of projects); that the work is
 * real (each tower shows a live site, scrolling); that working with him is
 * safe (first draft before paying more than half); and one obvious way to
 * start (the same button everywhere).
 */
export function CityExperience({
  copy,
  works,
  ctaHref,
  whatsappHref,
  avatar,
}: {
  copy: Copy;
  works: CityWork[];
  ctaHref: string;
  whatsappHref: string;
  avatar: string;
}) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<CityEngine | null>(null);
  const [progress, setProgress] = useState(0);
  const [holds, setHolds] = useState<{ from: number; to: number }[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  /* Boot the city once, in the browser only. */
  useEffect(() => {
    let alive = true;
    const el = canvas.current;
    if (!el) return;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const test = document.createElement('canvas').getContext('webgl2');
    if (!test) {
      setFailed(true);
      return;
    }
    import('@/components/city/engine').then(({ CityEngine }) => {
      if (!alive) return;
      const towers = works.map((w) => (mobile && w.phone ? w.phone : w.desktop));
      let loaded = 0;
      const city = new CityEngine(el, {
        towers,
        logo: '/city/logo-white.png',
        mobile,
        onReady: () => {
          loaded += 1;
          if (loaded >= 1) setReady(true);
        },
      });
      engine.current = city;
      setHolds(city.holds());
      // never keep the poster up for long, even if a texture is slow
      setTimeout(() => alive && setReady(true), 2500);
    });
    const onResize = () => engine.current?.resize();
    const onPointer = (e: PointerEvent) =>
      engine.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer);
    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [works]);

  /* The scroll drives the flight. */
  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const span = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -top / Math.max(1, span)));
      engine.current?.setProgress(p);
      setProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (p: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollPageTo(top + p * (el.offsetHeight - window.innerHeight));
  };

  const active = holds.findIndex((h) => progress >= h.from - 0.03 && progress <= h.to + 0.02);
  const showHero = progress < 0.07;
  const showDistrict = holds.length > 0 && progress > 0.08 && progress < holds[0].from - 0.035;
  const showFinal = progress > 0.88;

  const chapters = [
    { label: copy.chapters.arrival, at: 0 },
    ...holds.map((h, i) => ({ label: works[i]?.title ?? '', at: (h.from + h.to) / 2 })),
    { label: copy.chapters.contact, at: 0.97 },
  ];
  const current = showFinal ? chapters.length - 1 : active >= 0 ? active + 1 : progress < 0.1 ? 0 : -1;

  return (
    <section ref={section} data-tone="dark" data-doors aria-label={copy.districtTitle} className="relative h-[760svh] bg-[#070a1a] text-white">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* the Blender render: what shows before the city loads, and instead of it without WebGL */}
        <Image
          src="/city/poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1600ms] ${ready && !failed ? 'opacity-0' : 'opacity-100'}`}
        />
        <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden />
        {/* a vignette that keeps the text readable over any part of the city */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_45%,transparent_40%,rgb(3_4_12/0.75)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#05060f]/80 to-transparent" />

        {!ready && !failed && (
          <div className="absolute inset-x-0 top-24 flex justify-center">
            <span className="flex items-center gap-3 rounded-full bg-white/8 px-4 py-2 text-xs font-light tracking-wide text-white/80 backdrop-blur-md">
              <span className="size-1.5 animate-pulse rounded-full bg-[#ffb36b]" />
              {copy.loading}
            </span>
          </div>
        )}

        {/* --- arrival --- */}
        <AnimatePresence>
          {showHero && (
            <motion.div
              key="hero"
              className="absolute inset-x-0 bottom-0 pb-10 md:pb-14"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div className="hall">
                <div className="flex items-center gap-3">
                  <span className="relative size-11 overflow-hidden rounded-full ring-2 ring-white/20">
                    <Image src={avatar} alt="" fill sizes="44px" className="object-cover object-[60%_35%]" />
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block font-semibold">{copy.name}</span>
                    <span className="block font-light text-white/65">{copy.role}</span>
                  </span>
                </div>
                <h1 className="stage-title mt-6 text-[clamp(2.75rem,7vw,7rem)] [text-shadow:0_4px_40px_rgb(0_0_0/0.5)]">
                  {copy.title.map((line, i) => (
                    <span key={i} className="block overflow-hidden pb-[0.06em]">
                      <motion.span
                        className="block"
                        initial={{ y: '105%' }}
                        animate={{ y: '0%' }}
                        transition={{ duration: 1.2, ease: EASE, delay: 0.2 + i * 0.1 }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <p className="max-w-md text-[1.0625rem] leading-relaxed font-light text-white/75">{copy.sub}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={ctaHref} className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 font-semibold text-[#0b0b10] transition-transform hover:-translate-y-0.5">
                      {copy.cta}
                      <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
                    </Link>
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center gap-2.5 rounded-full border border-white/25 px-6 font-medium backdrop-blur-sm transition-colors hover:border-white">
                      <WhatsAppIcon className="size-[1.1rem]" />
                      {copy.whatsapp}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goTo(holds[0]?.from ?? 0.2)}
                  className="mx-auto mt-10 flex items-center gap-2 text-xs font-light tracking-wide text-white/60 transition-colors hover:text-white"
                >
                  <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
                    <ArrowIcon className="size-3.5 rotate-90" />
                  </motion.span>
                  {copy.scrollCue}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- entering the district --- */}
        <AnimatePresence>
          {showDistrict && (
            <motion.div
              key="district"
              className="absolute inset-0 grid place-items-center px-6 text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div>
                <p className="hand text-2xl text-[#ffb36b]">01</p>
                <h2 className="stage-title mt-2 text-[clamp(2.5rem,6vw,5.5rem)] [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]">{copy.districtTitle}</h2>
                <p className="mx-auto mt-5 max-w-md font-light text-white/75">{copy.districtNote}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* a dark veil on the left while a project is told, so the text reads over lit windows */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05060f]/90 via-[#05060f]/45 to-transparent transition-opacity duration-700 md:to-50% ${active >= 0 ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* --- one project, while its tower is in front of the camera --- */}
        <AnimatePresence mode="wait">
          {active >= 0 && works[active] && (
            <motion.div
              key={works[active].slug}
              className="absolute inset-x-0 bottom-0 px-5 pb-24 md:inset-y-0 md:right-auto md:flex md:w-[38%] md:items-center md:px-0 md:pb-0 md:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="rounded-[22px] bg-[#070a1a]/55 p-6 ring-1 ring-white/10 backdrop-blur-xl md:bg-transparent md:p-0 md:ring-0 md:backdrop-blur-none">
                <p className="flex items-center gap-3 text-xs font-light tracking-wide text-white/60">
                  <span className="tabular-nums">
                    {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
                  </span>
                  <span className="h-px w-8 bg-white/30" />
                  {works[active].kind}
                </p>
                <h3 className="stage-title mt-3 text-[clamp(2.25rem,4.6vw,4.5rem)] [overflow-wrap:anywhere] [text-shadow:0_4px_30px_rgb(0_0_0/0.6)]">
                  {works[active].title}
                </h3>
                <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed font-light text-white/75">{works[active].line}</p>
                <p className="mt-2 text-xs font-light text-white/45">{works[active].meta}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {works[active].liveUrl && (
                    <a href={works[active].liveUrl!} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-[#0b0b10]">
                      {copy.openSite}
                      <ArrowIcon className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                    </a>
                  )}
                  <Link href={works[active].href} className="text-sm font-medium text-white underline decoration-white/40 underline-offset-[0.35em] hover:decoration-white">
                    {copy.howMade}
                  </Link>
                </div>
                <p className="mt-6 hidden items-center gap-2 text-xs font-light text-white/45 md:flex">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#7fe0a3]" />
                  {copy.screenHint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* a dark pool behind the centred chapters (district, final) */}
        <div
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,rgb(4_5_14/0.82),rgb(4_5_14/0.35)_70%,transparent)] transition-opacity duration-700 ${showFinal || showDistrict ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* --- the end of the flight --- */}
        <AnimatePresence>
          {showFinal && (
            <motion.div
              key="final"
              className="absolute inset-0 grid place-items-center px-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div>
                <h2 className="stage-title text-[clamp(2.5rem,6.6vw,6.5rem)] [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]">
                  {copy.finalTitle.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                <p className="mx-auto mt-6 max-w-md text-[1.0625rem] font-light text-white/75">{copy.finalNote}</p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-[#25d366] px-7 font-semibold text-[#06140b] transition-transform hover:-translate-y-0.5">
                    <WhatsAppIcon className="size-5" />
                    {copy.whatsapp}
                  </a>
                  <Link href={ctaHref} className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 font-semibold text-[#0b0b10] transition-transform hover:-translate-y-0.5">
                    {copy.finalForm}
                    <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- where am I: the chapters, clickable --- */}
        <nav aria-label={copy.districtTitle} className="absolute top-1/2 right-4 hidden -translate-y-1/2 md:block lg:right-8">
          <ol className="flex flex-col items-end gap-3.5">
            {chapters.map((c, i) => (
              <li key={`${c.label}-${i}`}>
                <button type="button" onClick={() => goTo(c.at)} className="group flex items-center gap-3" aria-current={current === i ? 'step' : undefined}>
                  <span className={`text-xs font-light transition-all duration-500 ${current === i ? 'text-white opacity-100' : 'translate-x-1 text-white/0 group-hover:translate-x-0 group-hover:text-white/70'}`}>
                    {c.label}
                  </span>
                  <span className={`block rounded-full transition-all duration-500 ${current === i ? 'h-6 w-1.5 bg-white' : 'size-1.5 bg-white/40 group-hover:bg-white/80'}`} />
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* --- impatience is allowed --- */}
        {!showFinal && !showHero && (
          <button
            type="button"
            onClick={() => goTo(0.97)}
            className="absolute top-20 right-5 text-xs font-light text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white md:top-24 lg:right-8"
          >
            {copy.skip}
          </button>
        )}

        {/* --- the flight so far --- */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/8">
          <div className="h-full origin-left bg-gradient-to-r from-[#ffb36b] to-[#ff5fa2]" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </section>
  );
}

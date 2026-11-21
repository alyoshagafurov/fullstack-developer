import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import { localePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The quieter rooms of the house, each lit its own way:
 *   Portrait  — him in black and white under a picture light, a floor strip
 *               running along the base of the wall.
 *   Draft     — one line of light drawn across the dark as the page scrolls:
 *               the time from first message to first draft.
 *   Doorway   — him again, in a suit, in profile, turned to a cold doorway;
 *               the two doors out of the house beside him.
 */

export function Portrait({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.home;
  return (
    <section className="relative isolate overflow-hidden bg-wall-2" aria-labelledby="portrait-title">
      <div className="hall grid min-h-[100svh] items-end gap-10 pt-28 lg:grid-cols-12 lg:pt-0">
        <div className="pb-6 lg:col-span-7 lg:self-center lg:pb-0">
          <h2 id="portrait-title" data-rise className="hall-title text-[clamp(3rem,8.6vw,9rem)]">
            <Lines lines={h.personTitle} />
          </h2>
          <p className="script mt-5 ml-1 -rotate-[5deg] text-[clamp(2.25rem,4vw,4rem)]">{h.personScript}</p>
          <div className="mt-12 flex flex-col gap-5 md:flex-row md:items-end md:gap-10">
            <p className="wall-note">{h.personNote}</p>
            <Link href={localePath(lang, '/about')} className="link-quiet shrink-0 text-sm">
              {h.personMore}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-[78svh] w-full max-w-[34rem] lg:col-span-5 lg:h-[92svh]">
          {/* The picture light and the cone it throws. */}
          <div aria-hidden className="led absolute top-[2%] left-1/2 h-[3px] w-[46%] -translate-x-1/2 rounded-full" />
          <div
            aria-hidden
            className="absolute top-[2%] left-1/2 h-[70%] w-[110%] -translate-x-1/2 bg-[radial-gradient(ellipse_42%_80%_at_50%_0%,rgb(255_214_160/0.22),transparent_75%)]"
          />
          <div data-parallax="6" className="absolute inset-x-0 top-[7%] bottom-0">
            <Image
              src="/photo/cut/stand.png"
              alt={h.personAlt}
              fill
              sizes="(min-width: 1024px) 34rem, 80vw"
              className="object-contain object-bottom [filter:drop-shadow(0_0_30px_rgb(255_214_160/0.12))]"
            />
          </div>
        </div>
      </div>
      {/* The floor strip along the base of the wall. */}
      <div aria-hidden className="led absolute inset-x-0 bottom-0 h-[2px]" />
      <div
        aria-hidden
        className="absolute inset-x-0 -bottom-10 h-24 bg-[radial-gradient(ellipse_60%_100%_at_70%_0%,rgb(255_190_120/0.2),transparent_70%)]"
      />
    </section>
  );
}

export function Draft({ t }: { t: Dictionary }) {
  const h = t.home;
  return (
    <section id="process" className="relative isolate overflow-hidden py-32 md:py-48" aria-labelledby="draft-title">
      <div className="hall">
        <h2 id="draft-title" data-rise className="hall-title text-[clamp(3rem,10vw,11rem)]">
          <Lines lines={h.draftTitle} />
        </h2>
      </div>

      {/* One strip of light, drawn as the room scrolls by. */}
      <div className="relative mt-16 md:mt-24">
        <svg
          aria-hidden
          viewBox="0 0 1000 10"
          preserveAspectRatio="none"
          className="h-3 w-full [filter:drop-shadow(0_0_5px_rgb(255_214_160/0.95))_drop-shadow(0_0_22px_rgb(255_170_100/0.5))]"
        >
          <path data-draw d="M0 5 H1000" stroke="#ffe2b8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div
          aria-hidden
          className="absolute inset-x-0 top-2 h-40 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgb(255_190_120/0.14),transparent_70%)]"
        />
      </div>

      <div className="hall mt-12 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <p className="wall-note">{h.draftNote}</p>
        <p className="script -rotate-[3deg] text-[clamp(1.75rem,3vw,3rem)] md:text-right">{h.draftScript}</p>
      </div>
    </section>
  );
}

export function Doorway({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.home;
  return (
    <section data-doors className="relative isolate overflow-hidden bg-wall" aria-labelledby="door-title">
      {/* The cold doorway behind him. */}
      <div aria-hidden className="absolute inset-y-0 right-[8%] -z-10 w-[38%] lg:right-[10%] lg:w-[24%]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(45_77_255/0.04),rgb(45_77_255/0.42))]" />
        <div className="led-cobalt absolute inset-y-[10%] left-0 w-px opacity-80" />
        <div className="led-cobalt absolute inset-y-[10%] right-0 w-px opacity-80" />
        <div className="absolute -inset-x-[60%] bottom-0 h-[40%] bg-[radial-gradient(ellipse_at_50%_100%,rgb(45_77_255/0.3),transparent_70%)]" />
      </div>

      <div className="hall grid min-h-[100svh] items-end gap-12 pt-32 lg:grid-cols-12">
        <div className="pb-16 lg:col-span-7 lg:self-center lg:pb-0">
          <h2 id="door-title" data-rise className="hall-title text-[clamp(3.25rem,9.6vw,10rem)]">
            <Lines lines={h.closeTitle} />
          </h2>
          <div className="mt-12 flex flex-wrap gap-3">
            <a
              href={whatsappHref(t)}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="btn-bone min-h-16 px-9 text-base"
            >
              <WhatsAppIcon className="size-5" />
              {t.common.whatsapp}
            </a>
            <Link href={startHref(lang)} data-magnetic className="btn-line group min-h-16 px-9 text-base">
              {t.common.getQuote}
              <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="wall-note mt-12">{h.closeNote}</p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href={`https://t.me/${site.contact.telegram}`} target="_blank" rel="noopener noreferrer" className="link-quiet">
              Telegram @{site.contact.telegram}
            </a>
            <a href={`mailto:${site.contact.email}`} className="link-quiet">
              {site.contact.email}
            </a>
          </p>
        </div>

        <div className="relative mx-auto h-[72svh] w-full max-w-[30rem] lg:col-span-5 lg:h-[88svh]">
          <Image
            src="/photo/cut/doorway.png"
            alt={t.person.photoAlt}
            fill
            sizes="(min-width: 1024px) 30rem, 80vw"
            className="object-contain object-bottom [filter:drop-shadow(10px_0_30px_rgb(45_77_255/0.45))]"
          />
        </div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </section>
  );
}

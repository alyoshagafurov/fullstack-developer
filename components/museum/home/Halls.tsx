import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import { localePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The quieter halls of the home page: the person, the first draft, and the
 * way out. Each is one headline and one corner label; none of them lists
 * anything.
 */

/** The portrait hall: him, lit, and the one promise that sets him apart. */
export function PersonHall({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.home;
  return (
    <section className="relative overflow-hidden py-28 md:py-44" aria-labelledby="person-title">
      <div className="hall grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div data-fade className="relative lg:col-span-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[15%] -top-[20%] bottom-[40%] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgb(255_236_204/0.16),transparent_70%)]"
          />
          <div className="exhibit relative aspect-[4/5] overflow-hidden">
            <div data-parallax="12" className="absolute -inset-y-[8%] inset-x-0">
              <Image
                src="/photo/about.webp"
                alt={h.personAlt}
                fill
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="object-cover object-[55%_35%] grayscale-[0.25]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 id="person-title" data-rise className="hall-title text-[clamp(3rem,8.4vw,8.5rem)]">
            <Lines lines={h.personTitle} />
          </h2>
          <p className="script mt-4 ml-1 -rotate-[5deg] text-[clamp(2.25rem,4vw,4rem)]">{h.personScript}</p>

          <div className="mt-14 flex flex-col gap-5 md:mt-20 md:flex-row md:items-end md:justify-between">
            <p className="wall-note">{h.personNote}</p>
            <Link href={localePath(lang, '/about')} className="link-quiet shrink-0 text-sm">
              {h.personMore}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** How a job goes, said once: the first draft is quick, the money follows the draft. */
export function DraftHall({ t }: { t: Dictionary }) {
  const h = t.home;
  return (
    <section id="process" className="relative overflow-hidden bg-wall-2 py-28 md:py-44" aria-labelledby="draft-title">
      <div className="hall">
        <h2 id="draft-title" data-rise className="hall-title text-[clamp(3rem,9.5vw,10rem)]">
          <Lines lines={h.draftTitle} />
        </h2>

        {/* The curator's underline, drawn as the hall scrolls by. */}
        <svg
          viewBox="0 0 1200 120"
          className="mt-4 h-auto w-full max-w-[64rem] text-brass"
          fill="none"
          aria-hidden
          preserveAspectRatio="none"
        >
          <path
            data-draw
            d="M6 74 C 180 40, 330 96, 520 66 S 860 26, 1010 58 S 1150 88, 1194 50"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <p className="script -rotate-[3deg] text-[clamp(1.75rem,3vw,3rem)]">{h.draftScript}</p>
          <p className="wall-note md:text-right">{h.draftNote}</p>
        </div>
      </div>
    </section>
  );
}

/** The way out: the invitation, the two doors, and how to reach him otherwise. */
export function ClosingHall({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.home;
  return (
    <section
      data-lit
      data-doors
      className="relative isolate overflow-hidden py-32 md:py-48"
      style={{ '--lx': '30', '--ly': '40' } as React.CSSProperties}
      aria-labelledby="close-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at calc(var(--lx) * 1%) calc(var(--ly) * 1%), rgb(255 236 204 / 0.12), transparent 50%)',
        }}
      />
      <div className="hall">
        <h2 id="close-title" data-rise className="hall-title text-[clamp(3.25rem,11vw,11.5rem)]">
          <Lines lines={h.closeTitle} />
        </h2>

        <div className="mt-14 flex flex-col gap-12 md:mt-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link href={startHref(lang)} data-magnetic className="btn-bone group min-h-16 px-9 text-base">
              {t.common.getQuote}
              <ArrowIcon className="size-4 transition-transform duration-500 ease-[var(--ease-gallery)] group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappHref(t)}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="btn-line min-h-16 px-9 text-base"
            >
              <WhatsAppIcon className="size-5" />
              {t.common.whatsapp}
            </a>
          </div>

          <div className="lg:text-right">
            <p className="wall-note lg:ml-auto">{h.closeNote}</p>
            <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm lg:justify-end">
              <a href={`https://t.me/${site.contact.telegram}`} target="_blank" rel="noopener noreferrer" className="link-quiet">
                Telegram @{site.contact.telegram}
              </a>
              <a href={`mailto:${site.contact.email}`} className="link-quiet">
                {site.contact.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

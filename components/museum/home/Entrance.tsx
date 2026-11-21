import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { startHref, whatsappHref } from '@/components/museum/links';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

export type Exhibit = {
  slug: string;
  href: string;
  title: string;
  caption: string;
  image: string;
};

/*
 * The entrance hall. One work hangs lit on the dark wall, the headline stands
 * at the foot of it, and the label in the corner says the rest. Everything is
 * in the first paint: the light moves, nothing waits for it.
 */
export function Entrance({ lang, t, exhibit }: { lang: Locale; t: Dictionary; exhibit: Exhibit | null }) {
  const h = t.home;

  return (
    <section
      data-lit
      data-doors
      className="relative isolate overflow-hidden"
      style={{ '--lx': '68', '--ly': '30' } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at calc(var(--lx) * 1%) calc(var(--ly) * 1%), rgb(255 236 204 / 0.15), rgb(255 236 204 / 0.05) 24%, transparent 55%)',
        }}
      />

      <div className="hall flex min-h-[100svh] flex-col pt-24 pb-10 md:pt-28 md:pb-14 lg:grid lg:grid-cols-12 lg:gap-x-10">
        {exhibit && (
          <figure className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:mt-[4vh]">
            <Link href={exhibit.href} className="group block" aria-label={`${exhibit.title} — ${h.workOpen}`}>
              <div className="relative">
                {/* The lamp above the frame. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-[12%] -top-[38%] bottom-[30%] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgb(255_236_204/0.2),transparent_70%)] opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                />
                <div className="exhibit aspect-[16/10] overflow-hidden">
                  <Image
                    src={exhibit.image}
                    alt={exhibit.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    className="object-cover object-top transition-transform duration-[1.6s] ease-[var(--ease-gallery)] group-hover:scale-[1.035]"
                  />
                </div>
              </div>
              <figcaption className="mt-6 flex items-baseline justify-between gap-6">
                <span className="wall-label">{h.heroLit}</span>
                <span className="text-right">
                  <span className="block text-sm font-normal text-bone">{exhibit.title}</span>
                  <span className="wall-label mt-1 block tracking-[0.1em]">{exhibit.caption}</span>
                </span>
              </figcaption>
            </Link>
          </figure>
        )}

        <div className="mt-12 flex flex-1 flex-col justify-end lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:mt-0">
          <h1 className="hall-title text-[clamp(3.75rem,13vw,12.5rem)]">
            <Lines lines={h.heroTitle} />
          </h1>
          <p className="script mt-2 ml-1 -rotate-[4deg] text-[clamp(1.75rem,3.6vw,3.5rem)] md:mt-1">
            {h.heroScript}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 md:mt-12">
            <Link href={startHref(lang)} data-magnetic className="btn-bone group">
              {t.common.getQuote}
              <ArrowIcon className="size-4 transition-transform duration-500 ease-[var(--ease-gallery)] group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappHref(t)}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="btn-line"
            >
              <WhatsAppIcon className="size-[1.1rem]" />
              {t.common.whatsapp}
            </a>
          </div>
        </div>

        <p className="wall-note mt-12 lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:mt-0 lg:self-end lg:text-right lg:justify-self-end">
          {h.heroNote}
        </p>
      </div>
    </section>
  );
}

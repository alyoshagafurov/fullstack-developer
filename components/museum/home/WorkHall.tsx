import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon } from '@/components/museum/Icons';
import type { Exhibit } from '@/components/museum/home/Entrance';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The work hall. The works hang in one row along a long wall, each under its
 * own lamp. On a wide screen the hall holds still while the page scrolls and
 * the wall walks past; on a phone it is a plain sideways swipe.
 */
export function WorkHall({ t, works, allHref }: { t: Dictionary; works: Exhibit[]; allHref: string }) {
  const h = t.home;
  if (works.length === 0) return null;

  return (
    <section data-gallery id="work" className="relative overflow-hidden bg-wall-2" aria-labelledby="work-title">
      <div className="flex min-h-[100svh] flex-col justify-center pt-24 pb-16 lg:pt-28 lg:pb-10">
        <div className="hall flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="work-title" data-rise className="hall-title lg:text-[clamp(4rem,7.4vw,8rem)]">
              <Lines lines={[h.workTitle]} />
            </h2>
            <p className="script mt-1 ml-1 -rotate-[3deg] text-[clamp(1.5rem,2.8vw,2.5rem)]">{h.workScript}</p>
          </div>
          <div className="md:max-w-[22rem] md:pb-3 md:text-right">
            <p className="wall-note md:ml-auto">{h.workNote}</p>
            <Link href={allHref} className="link-quiet mt-4 inline-flex text-sm">
              {h.workAll}
            </Link>
          </div>
        </div>

        <ul
          data-gallery-track
          className="mt-12 flex scroll-px-5 gap-6 px-5 pb-4 md:scroll-px-10 md:gap-[8vw] lg:gap-[14vw] md:px-10 lg:mt-8 xl:px-[4.5rem]"
          aria-label={h.workTitle}
        >
          {works.map((work) => (
            <li key={work.slug} data-lamp className="w-[84vw] shrink-0 sm:w-[62vw] lg:w-[min(46vw,62svh*1.6)]">
              <Link href={work.href} className="group block">
                <div className="relative pt-10">
                  <div
                    aria-hidden
                    className="lamp pointer-events-none absolute -inset-x-[4%] top-0 bottom-[30%] bg-[radial-gradient(ellipse_34%_75%_at_50%_0%,rgb(255_236_204/0.24),transparent_72%)]"
                  />
                  <div className="exhibit aspect-[16/10] overflow-hidden">
                    <Image
                      src={work.image}
                      alt={work.title}
                      fill
                      sizes="(min-width: 1024px) 44vw, 84vw"
                      className="lit-image object-cover object-top transition-transform duration-[1.4s] ease-[var(--ease-gallery)] group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
                <div className="mt-7 flex items-start justify-between gap-6">
                  <div>
                    <p className="font-display text-[clamp(1.5rem,2.2vw,2.125rem)] leading-none font-black [font-synthesis:none]">
                      {work.title}
                    </p>
                    <p className="wall-label mt-3">{work.caption}</p>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-2 text-sm text-bone-2 transition-colors group-hover:text-brass">
                    {h.workOpen}
                    <ArrowIcon className="size-4 transition-transform duration-500 ease-[var(--ease-gallery)] group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}

          <li className="flex w-[60vw] shrink-0 items-center sm:w-[40vw] lg:w-[26vw]">
            <Link href={allHref} className="group block">
              <span className="script block text-[clamp(2rem,3.4vw,3.25rem)] transition-transform duration-700 ease-[var(--ease-gallery)] group-hover:-translate-y-1">
                {h.workAll}
              </span>
              <span className="mt-4 inline-flex size-14 items-center justify-center rounded-full border border-seam-2 text-bone transition-colors group-hover:border-brass group-hover:text-brass">
                <ArrowIcon className="size-5" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

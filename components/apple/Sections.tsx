import Image from 'next/image';
import Link from 'next/link';
import { ChevronIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { startHref, whatsappHref } from '@/components/museum/links';
import { site } from '@/lib/content/site';
import { localePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';

/*
 * The home page's screens, in the manner of apple.com: one headline, one
 * quiet line, at most two buttons, and the picture. Light and dark come from
 * the theme; a screen marked data-tone="dark" is dark in both, which gives the
 * page its black-and-white rhythm.
 */

export type Work = {
  slug: string;
  href: string;
  title: string;
  caption: string;
  image: string;
  live: string | null;
};

function Actions({ lang, t, centered = true }: { lang: Locale; t: Dictionary; centered?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${centered ? 'justify-center' : ''}`}>
      <Link href={startHref(lang)} className="btn-bone">
        {t.common.getQuote}
      </Link>
      <a href={whatsappHref(t)} target="_blank" rel="noopener noreferrer" className="btn-line">
        <WhatsAppIcon className="size-[1.05rem]" />
        {t.common.whatsapp}
      </a>
    </div>
  );
}

/** The first screen: who he is, what he does, the two doors, and him. */
export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.home;
  return (
    <section data-doors className="overflow-hidden bg-wall-2 pt-24 md:pt-28 dark:bg-wall">
      <div className="hall text-center">
        <h1 className="hall-title">{t.person.name}</h1>
        <p className="lead-line mx-auto mt-3 max-w-2xl">
          {h.heroOffer} {h.heroScript}.
        </p>
        <div className="mt-7">
          <Actions lang={lang} t={t} />
        </div>
      </div>

      <div className="hall mt-12 md:mt-16">
        {/* Light: the photograph as taken, a white wall behind him. */}
        <div className="only-light relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-t-[32px] md:aspect-[16/10]">
          <Image
            src="/photo/about.webp"
            alt={t.person.photoAlt}
            fill
            priority
            sizes="(min-width: 1100px) 900px, 100vw"
            className="object-cover object-[55%_40%]"
          />
        </div>
        {/* Dark: the same moment, lifted out of the wall and set on black. */}
        <div className="only-dark relative mx-auto max-w-4xl">
          <Image
            src="/photo/cut/hero.png"
            alt={t.person.photoAlt}
            width={1025}
            height={851}
            priority
            sizes="(min-width: 1100px) 900px, 100vw"
            className="mx-auto h-auto w-[92%]"
          />
        </div>
      </div>
    </section>
  );
}

/** One work, given the whole screen; it grows to full width as it scrolls in. */
export function Feature({ work, t }: { work: Work; t: Dictionary }) {
  return (
    <section data-tone="dark" className="overflow-hidden bg-wall py-24 md:py-32" aria-labelledby="feature-title">
      <div className="hall text-center">
        <h2 id="feature-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{work.title}</span>
          </span>
        </h2>
        <p className="lead-line mx-auto mt-3 max-w-2xl text-bone-2">{t.home.workScript}</p>
        <div className="mt-6 flex justify-center gap-6">
          <Link href={work.href} className="link-more">
            {t.home.workOpen} <ChevronIcon />
          </Link>
          {work.live && (
            <a href={work.live} target="_blank" rel="noopener noreferrer" className="link-more">
              {t.work.open} <ChevronIcon />
            </a>
          )}
        </div>
      </div>
      <div className="mt-14 md:mt-20">
        <div data-zoom className="relative mx-auto aspect-[16/9] w-full max-w-[1440px] overflow-hidden">
          <Image src={work.image} alt={work.title} fill sizes="100vw" className="object-cover object-top" />
        </div>
      </div>
    </section>
  );
}

/** Every work as a tile, two to a row, the way apple.com lays out its home page. */
export function Tiles({ works, t, allHref }: { works: Work[]; t: Dictionary; allHref: string }) {
  if (works.length === 0) return null;
  return (
    <section className="bg-wall py-20 md:py-28" aria-labelledby="tiles-title">
      <div className="hall flex flex-col items-center text-center">
        <h2 id="tiles-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{t.home.workTitle}</span>
          </span>
        </h2>
        <p className="lead-line mt-3 text-bone-2">{t.home.workNote}</p>
        <Link href={allHref} className="link-more mt-5">
          {t.home.workAll} <ChevronIcon />
        </Link>
      </div>

      <ul className="hall-wide mt-14 grid gap-3 md:grid-cols-2">
        {works.map((work, index) => (
          <li key={work.slug} data-fade data-tone={index % 4 === 1 || index % 4 === 2 ? 'dark' : undefined}>
            <Link href={work.href} className="tile group flex h-full flex-col items-center pt-12 text-center">
              <h3 className="room-title px-6">{work.title}</h3>
              <p className="mt-2 px-6 text-base text-bone-2">{work.caption}</p>
              <span className="link-more mt-3">
                {t.home.workOpen} <ChevronIcon />
              </span>
              <div className="mt-10 w-[86%] flex-1">
                <div className="exhibit aspect-[16/10] rounded-b-none transition-transform duration-700 ease-[var(--ease-gallery)] group-hover:-translate-y-1.5">
                  <Image
                    src={work.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 46vw, 90vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type Choice = { key: string; word: string; line: string; price: string | null; href: string };

/** The four directions side by side, like the row of models on an Apple product page. */
export function Choices({ t, choices }: { t: Dictionary; choices: Choice[] }) {
  return (
    <section className="bg-wall-2 py-20 md:py-28" aria-labelledby="choices-title">
      <div className="hall text-center">
        <h2 id="choices-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{t.home.directionsTitle}</span>
          </span>
        </h2>
        <p className="lead-line mx-auto mt-3 max-w-2xl text-bone-2">{t.home.directionsNote}</p>
      </div>

      <ul className="hall mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {choices.map((choice) => (
          <li key={choice.key} data-fade className="tile flex flex-col bg-wall p-7 text-center">
            <h3 className="room-title">{choice.word}</h3>
            <p className="mt-2 text-base text-bone-2">{choice.line}</p>
            {choice.price && (
              <p className="mt-6 text-sm text-bone">
                {t.home.directionsFrom} {choice.price.replace(/^(от|from)\s+/i, '')}
              </p>
            )}
            <Link href={choice.href} className="link-more mt-auto justify-center pt-6">
              {t.common.getQuote} <ChevronIcon />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Who does the work: one statement, his photo, his signature. */
export function Person({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.home;
  return (
    <section className="overflow-hidden bg-wall pt-20 md:pt-28" aria-labelledby="person-title">
      <div className="hall text-center">
        <h2 id="person-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{h.personTitle.join(' ')}</span>
          </span>
        </h2>
        <p className="lead-line mx-auto mt-3 max-w-2xl text-bone-2">{t.about.difference}</p>
        <Link href={localePath(lang, '/about')} className="link-more mt-5">
          {h.personMore} <ChevronIcon />
        </Link>
      </div>
      <div className="hall mt-14">
        <div className="only-light relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-t-[32px] md:max-w-lg">
          <Image
            src="/gallery/work-phone.webp"
            alt={h.personAlt}
            fill
            sizes="(min-width: 768px) 32rem, 90vw"
            className="object-cover"
          />
        </div>
        <div className="only-dark relative mx-auto h-[70svh] max-w-md">
          <Image
            src="/photo/cut/stand.png"
            alt={h.personAlt}
            fill
            sizes="(min-width: 768px) 28rem, 80vw"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}

/** How a job starts, said once. */
export function Draft({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="bg-wall-2 py-24 md:py-36" aria-labelledby="draft-title">
      <div className="hall text-center">
        <h2 id="draft-title" data-rise className="hall-title text-[clamp(2.75rem,8vw,7rem)]">
          <span className="line-mask">
            <span>{t.home.draftTitle.join(' ')}.</span>
          </span>
        </h2>
        <p className="lead-line mx-auto mt-5 max-w-2xl text-bone-2">{t.home.draftNote}</p>
      </div>
    </section>
  );
}

/** The way out: the question, the two doors, and the small print. */
export function Closing({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section data-doors data-tone="dark" className="bg-wall py-24 md:py-36" aria-labelledby="close-title">
      <div className="hall text-center">
        <h2 id="close-title" data-rise className="hall-title">
          <span className="line-mask">
            <span>{t.home.closeTitle.join(' ')}</span>
          </span>
        </h2>
        <p className="lead-line mx-auto mt-3 max-w-xl text-bone-2">{t.home.closeNote}</p>
        <div className="mt-8">
          <Actions lang={lang} t={t} />
        </div>
        <p className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <a href={`https://t.me/${site.contact.telegram}`} target="_blank" rel="noopener noreferrer" className="link-quiet">
            Telegram @{site.contact.telegram}
          </a>
          <a href={`mailto:${site.contact.email}`} className="link-quiet">
            {site.contact.email}
          </a>
        </p>
        <p className="script mt-12 text-[2rem]">{t.home.personScript}</p>
      </div>
    </section>
  );
}

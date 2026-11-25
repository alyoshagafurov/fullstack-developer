import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { ArrowIcon, ChevronIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { CheckIcon, PlusIcon, TelegramIcon, display, primary, secondary, textLink } from './ui';

/*
 * The local page, /dushanbe, in the home's voice: black and graphite bands
 * taking turns, one large headline per band with a short line in its corner,
 * and the blue button only where a project starts.
 *
 * Server components throughout. The first screen is in the HTML as it will be
 * seen — nothing waits for a script to fade it in — and the bands below the
 * fold settle into place through `data-fade`, which the site's motion script
 * only ever applies to what starts out of view.
 */

const arrow = <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-0.5" />;
const chevron = <ChevronIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />;

/* ================================================================== hero */

export function LocalHero({
  crumbs,
  eyebrow,
  title,
  sub,
  cta,
  ctaHref,
  promise,
  photo,
}: {
  crumbs: { label: string; home: string; homeHref: string; here: string };
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  ctaHref: string;
  /** The promise beside the button: the draft, then the payment. */
  promise: readonly string[];
  photo: { src: string; alt: string };
}) {
  return (
    <section data-tone="dark" data-doors aria-labelledby="local-title" className="overflow-hidden bg-black text-bone">
      <div className="hall grid items-center gap-14 pt-28 pb-20 md:pt-36 md:pb-28 lg:min-h-[min(100svh,60rem)] lg:grid-cols-12 lg:gap-10 lg:pt-32">
        <div className="lg:col-span-7">
          <nav aria-label={crumbs.label} className="mb-8 text-[0.875rem] text-bone-3">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={crumbs.homeHref} className="link-quiet inline-flex min-h-11 items-center">
                  {crumbs.home}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-bone-2">
                {crumbs.here}
              </li>
            </ol>
          </nav>
          <p className="text-[0.9375rem] font-medium text-bone-2 md:text-[1.0625rem]">{eyebrow}</p>
          <h1 id="local-title" className={`${display} mt-4 text-[clamp(2.75rem,7vw,6rem)] leading-[0.98]`}>
            {title}
          </h1>
          <p className="mt-6 max-w-[34rem] text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-relaxed text-bone-2">{sub}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-4">
            <Link href={ctaHref} className={primary()}>
              {cta}
              {arrow}
            </Link>
            <ul className="flex flex-col gap-1.5 text-[0.9375rem] leading-snug text-bone-2 max-sm:self-center">
              {promise.map((note) => (
                <li key={note} className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0 text-bone" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] overflow-hidden rounded-[22px] bg-wall-3 md:rounded-[28px]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              preload
              sizes="(min-width: 1024px) 36vw, (min-width: 640px) 30rem, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 58%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================== who */

/*
 * Who does the work, in his own words, continuing the hero's black band the
 * way the home's figures continue its own. The figures themselves are not
 * repeated here: this paragraph already says them.
 */
export function LocalWho({ title, body, more, moreHref }: { title: string; body: readonly string[]; more: string; moreHref: string }) {
  return (
    <section data-tone="dark" aria-labelledby="who-title" className="bg-black pb-24 text-bone md:pb-36">
      <div className="hall">
        <div className="grid gap-10 border-t border-seam pt-16 md:grid-cols-12 md:gap-12 md:pt-24">
          <h2 id="who-title" data-fade className={`${display} text-[clamp(2.5rem,5.4vw,5rem)] leading-[1.02] md:col-span-7`}>
            {title}
          </h2>
          <div data-fade className="md:col-span-5 md:pt-3">
            {body.map((line) => (
              <p key={line} className="text-[1.0625rem] leading-relaxed text-bone-2 [&+&]:mt-5">
                {line}
              </p>
            ))}
            <Link href={moreHref} className={`${textLink()} mt-4`}>
              {more}
              {chevron}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== services */

export type LocalServiceRow = {
  slug: string;
  title: string;
  tagline: string;
  term: string | null;
  price: string;
  href: string;
};

export function LocalServices({
  title,
  note,
  rows,
  termLabel,
  moreLabel,
  more,
  all,
  allHref,
  prices,
  pricesHref,
}: {
  title: string;
  note: string;
  rows: LocalServiceRow[];
  termLabel: string;
  moreLabel: string;
  more: { label: string; href: string }[];
  all: string;
  allHref: string;
  prices: string;
  pricesHref: string;
}) {
  return (
    <section id="services" data-tone="dark" aria-labelledby="services-title" className="scroll-mt-16 bg-wall-2 py-24 text-bone md:py-36">
      <div className="hall grid gap-10 md:grid-cols-12 md:gap-12">
        <div data-fade className="md:col-span-4">
          <h2 id="services-title" className={`${display} text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]`}>
            {title}
          </h2>
          <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-bone-2">{note}</p>
          <div className="mt-6 flex flex-col items-start">
            <Link href={allHref} className={textLink()}>
              {all}
              {chevron}
            </Link>
            <Link href={pricesHref} className={textLink()}>
              {prices}
              {chevron}
            </Link>
          </div>
        </div>

        <div data-fade className="md:col-span-8">
          <ul className="border-t border-seam">
            {rows.map((row) => (
              // the name is the link — its words are what the service page is about — and it covers the whole row
              <li key={row.slug} className="group relative border-b border-seam">
                <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1.5 py-6 md:py-7">
                  <h3 className="font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-semibold tracking-[-0.02em]">
                    <Link
                      href={row.href}
                      className="decoration-1 underline-offset-[0.2em] group-hover:underline after:absolute after:inset-0 after:content-['']"
                    >
                      {row.title}
                    </Link>
                  </h3>
                  <span className="text-right text-[1.0625rem] text-bone tabular-nums md:text-lg">{row.price}</span>
                  <p className="col-span-2 max-w-[48ch] text-[0.9375rem] leading-snug text-bone-2">{row.tagline}</p>
                  {row.term && (
                    <p className="col-span-2 text-[0.875rem] text-bone-3">
                      {termLabel}: {row.term}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {more.length > 0 && (
            <p className="mt-8 max-w-[52ch] text-[1rem] leading-relaxed text-bone-2">
              {moreLabel}{' '}
              {more.map((item, i) => (
                <Fragment key={item.href}>
                  {i > 0 && ', '}
                  <Link href={item.href} className="text-bone underline decoration-seam-2 underline-offset-[0.25em] transition-colors hover:decoration-bone">
                    {item.label}
                  </Link>
                </Fragment>
              ))}
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== work */

export type LocalWorkItem = {
  slug: string;
  title: string;
  kind: string;
  href: string;
  /** True when the link leaves for the client's live site. */
  external: boolean;
  action: string;
};

export function LocalWork({
  title,
  note,
  items,
  all,
  allHref,
  home,
  homeHref,
}: {
  title: string;
  note: string;
  items: LocalWorkItem[];
  all: string;
  allHref: string;
  home: string;
  homeHref: string;
}) {
  return (
    <section data-tone="dark" aria-labelledby="local-work-title" className="bg-black py-24 text-bone md:py-36">
      <div className="hall">
        <div data-fade className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="local-work-title" className={`${display} text-[clamp(2.5rem,5.4vw,5rem)] leading-none`}>
            {title}
          </h2>
          <p className="max-w-sm text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug text-bone-2 md:text-right">{note}</p>
        </div>

        <ul className="mt-14 border-t border-seam md:mt-20">
          {items.map((item) => (
            <li key={item.slug} data-fade className="group relative border-b border-seam">
              <div className="grid gap-x-8 gap-y-2 py-8 md:grid-cols-12 md:items-baseline md:py-10">
                <h3 className={`${display} text-[clamp(2rem,4vw,3.5rem)] leading-none [overflow-wrap:anywhere] md:col-span-5`}>
                  <Link
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="decoration-2 underline-offset-[0.15em] group-hover:underline after:absolute after:inset-0 after:content-['']"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="text-[1.0625rem] text-bone-2 md:col-span-5">{item.kind}</p>
                <p aria-hidden className="inline-flex items-center gap-1.5 text-[0.9375rem] text-bone md:col-span-2 md:justify-end">
                  {item.action}
                  {item.external ? <ArrowIcon className="size-3.5 -rotate-45" /> : <ChevronIcon className="size-3" />}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div data-fade className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Link href={allHref} className={secondary()}>
            {all}
            {chevron}
          </Link>
          <Link href={homeHref} className={textLink()}>
            {home}
            {chevron}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =================================================================== faq */

/*
 * Questions as rows that open in place. The answers are in the HTML whether a
 * row is open or not, and they are the very strings the FAQPage markup carries.
 */
export function LocalFaq({ title, note, faq }: { title: string; note: string; faq: readonly { q: string; a: string }[] }) {
  return (
    <section data-tone="dark" aria-labelledby="faq-title" className="bg-wall-2 py-24 text-bone md:py-36">
      <div className="hall grid gap-10 md:grid-cols-12 md:gap-12">
        <div data-fade className="md:col-span-4">
          <h2 id="faq-title" className={`${display} text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]`}>
            {title}
          </h2>
          <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-bone-2">{note}</p>
        </div>
        <div data-fade className="border-t border-seam md:col-span-8">
          {faq.map((item, i) => (
            <details key={item.q} open={i === 0} className="group border-b border-seam">
              <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-6 md:py-7 [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-[clamp(1.1875rem,1.9vw,1.5rem)] leading-snug font-semibold tracking-[-0.02em]">{item.q}</h3>
                <PlusIcon className="mt-1.5 size-4 shrink-0 text-bone-2 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pb-7 text-[1.0625rem] leading-relaxed text-bone-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================== closing */

/*
 * The last screen: one blue button to the request, WhatsApp and Telegram
 * beside it as quiet outlines, and the phone for anyone who would rather call.
 */
export function LocalClosing({
  title,
  sub,
  cta,
  ctaHref,
  or,
  whatsapp,
  whatsappHref,
  telegramHref,
  links,
  avatar,
}: {
  title: string;
  sub: string;
  cta: string;
  ctaHref: string;
  or: string;
  whatsapp: string;
  whatsappHref: string;
  telegramHref: string;
  links: { label: string; href: string }[];
  avatar: { src: string; alt: string };
}) {
  return (
    <section data-tone="dark" data-doors aria-labelledby="local-final-title" className="bg-black py-28 text-center text-bone md:py-44">
      <div className="hall">
        <div data-fade>
          <Image
            src={avatar.src}
            alt={avatar.alt}
            width={480}
            height={480}
            sizes="96px"
            className="mx-auto mb-8 size-20 rounded-full object-cover ring-1 ring-white/15 md:size-24"
          />
          <h2 id="local-final-title" className={`${display} mx-auto max-w-[17ch] text-[clamp(2.25rem,5.6vw,5.5rem)] leading-[1.02]`}>
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-bone-2">{sub}</p>
        </div>
        <div data-fade className="mt-10 flex justify-center">
          <Link href={ctaHref} className={`${primary('lg')} max-sm:w-full`}>
            {cta}
            <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
        <div data-fade className="mx-auto mt-14 max-w-xl border-t border-seam pt-10">
          <p className="text-[0.9375rem] text-bone-2">{or}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={secondary()}>
              <WhatsAppIcon className="size-[1.125rem]" />
              {whatsapp}
            </a>
            <a href={telegramHref} target="_blank" rel="noopener noreferrer" className={secondary()}>
              <TelegramIcon className="size-[1.125rem]" />
              Telegram
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-1 text-[0.9375rem] text-bone-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-11 items-center underline-offset-[0.3em] transition-colors hover:text-bone hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

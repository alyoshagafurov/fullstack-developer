import Image from 'next/image';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';
import { about } from '@/lib/content/about';
import { process, terms } from '@/lib/content/process';
import { StudioObject } from '@/components/ui/StudioObject';
import { Sculpture } from '@/components/three/Sculpture';
import type { CaseRow } from '@/lib/cases';

/*
 * The bands of the landing page.
 *
 * They live in one module because they are views of the same content and none
 * is reused elsewhere. What matters more than the split is the sequence: every
 * band changes both the ground colour and the type scale, so scrolling feels
 * like turning pages rather than sliding down a template.
 */

/**
 * A line that runs.
 *
 * Two identical halves, so the loop has no visible seam. Decorative only: it
 * repeats what the page already says in full, and reduced motion stops it.
 */
export function Marquee() {
  const words = [site.shortStatement, 'от идеи до сервера', 'без посредников', 'Душанбе'];
  const strip = [...words, ...words, ...words];

  return (
    <div className="overflow-hidden border-y border-white/10 bg-void py-5 select-none">
      <div className="marquee" aria-hidden>
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {strip.map((word, index) => (
              <span
                key={`${half}-${index}`}
                className="flex items-center px-6 text-[0.75rem] tracking-[0.2em] whitespace-nowrap text-paper uppercase"
              >
                {word}
                <span className="ml-6 block size-1 rounded-full bg-paper/40" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only">{words.join('. ')}.</p>
    </div>
  );
}

/**
 * The statement, then the three real numbers.
 *
 * The numbers are set larger than the sentence on purpose: they are the part a
 * visitor checks, and burying them in a row of equal tiles would say they are
 * decoration.
 */
export function Manifesto() {
  return (
    <Band tone="paper" innerClassName="py-28 md:py-40">
      <p data-reveal className="label mb-12">
        Позиция
      </p>
      <p data-reveal className="display-3 max-w-5xl">
        {site.statement}
      </p>

      <div
        data-reveal="group"
        className="mt-24 grid gap-x-10 gap-y-14 border-t border-line pt-14 md:grid-cols-3"
      >
        {site.stats.map((stat, index) => (
          <div key={stat.label} className={index === 0 ? 'md:col-span-1' : ''}>
            <p data-count className="display-2 tabular">
              {stat.value}
            </p>
            <p className="mt-4 text-sm text-ink-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}

/**
 * Who he is, on the landing page — strictly the working half.
 *
 * His biography mentions the delivery job, teaching English and four years of
 * MMA. All of it is true and all of it belongs on /about, where a visitor has
 * already decided he is interested. Here a visitor is still deciding whether
 * this person can build the thing, so this band answers only that.
 */
export function AboutSpread() {
  return (
    /*
     * The same held frame /about uses, mirrored: there the picture is on the
     * left of the text, here it is on the right.
     *
     * It used to run off the top, bottom and right edge of the screen. Full
     * bleed suits a photograph with a subject large in the frame; this one is
     * a person at a desk seen whole, and a column tall enough to reach both
     * edges of a long text cropped him down to the top of his head.
     */
    <Band tone="paper" id="studio" innerClassName="py-24 md:py-32">
      <div className="grid gap-14 md:grid-cols-2 md:items-start md:gap-20">
        <div data-reveal="group" className="md:order-1">
          <p className="label mb-8">Обо мне</p>
          <p className="display-2 uppercase">{site.name}</p>
          <p className="lede mt-8">{site.difference}</p>
          <p className="mt-6 text-base leading-relaxed text-ink-2">{site.why[1]}</p>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="label mb-3">{fact.label}</dt>
                <dd className="text-sm leading-snug">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <CTA href="/about" className="mt-12">
            Подробнее обо мне
          </CTA>
        </div>

        <div
          data-reveal="image"
          className="group relative aspect-3/2 w-full overflow-hidden bg-ground md:order-2 md:aspect-4/5"
        >
          <Image
            src="/photo/about.webp"
            alt={`${site.name} за работой`}
            fill
            sizes="(min-width: 768px) 46vw, 92vw"
            className="object-cover object-[55%_35%] transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.04]"
          />
        </div>
      </div>
    </Band>
  );
}

/**
 * The process as one track.
 *
 * Each stage takes the share of the line its real duration deserves, so four
 * weeks of development read as four weeks and the one-day launch reads as a
 * day. Equal cards would flatten the honest shape of the work.
 */
export function ProcessTrack() {
  const total = process.reduce((sum, stage) => sum + stage.weight, 0);

  return (
    <Band tone="paper" id="process" innerClassName="py-28 md:py-40">
      <h2 data-reveal className="display-2 mb-16 max-w-2xl uppercase">
        Как идёт работа
      </h2>

      {/* Stage widths are their real share of the timeline. It draws itself
          left to right as it comes into view: a timeline that is drawn reads
          as time passing, a line that is simply there reads as a border. */}
      <div data-draw className="mb-14 hidden h-px w-full bg-line-2 md:flex" aria-hidden>
        {process.map((stage) => (
          <div
            key={stage.num}
            style={{ flexGrow: stage.weight }}
            className="h-px border-l border-ink first:border-l-0"
          />
        ))}
      </div>

      <ol data-reveal="group" className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {process.map((stage) => (
          <li key={stage.num} className="group">
            <p className="display-3 text-ink-3 tabular transition-colors duration-500 group-hover:text-ink">
              {stage.num}
            </p>
            <h3 className="mt-4 text-lg leading-snug tracking-[-0.02em]">{stage.title}</h3>
            <p className="mt-1 text-sm text-ink-3">{stage.duration}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">{stage.body}</p>
            <p className="sr-only">
              Доля этапа в общем сроке: {Math.round((stage.weight / total) * 100)} процентов.
            </p>
          </li>
        ))}
      </ol>

      <dl data-reveal="group" className="mt-20 grid gap-10 border-t border-line-2 pt-10 md:grid-cols-3">
        {terms.map((term) => (
          <div key={term.label}>
            <dt className="label mb-3">{term.label}</dt>
            <dd className="text-sm leading-relaxed text-ink-2">{term.value}</dd>
          </div>
        ))}
      </dl>
    </Band>
  );
}

/**
 * Published cases, on white, straight after the testimonials.
 *
 * Renders nothing until the owner publishes one from the admin — the same rule
 * the testimonials follow. Rows alternate the side the object sits on, so the
 * band reads as a walk past a display rather than a grid of equal tiles.
 */
export function CasesBand({ items, total }: { items: CaseRow[]; total: number }) {
  if (items.length === 0) return null;

  return (
    <Band tone="paper" id="work" innerClassName="py-28 md:py-40">
      <div data-reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display-2 uppercase">Кейсы</h2>
        {total > items.length && (
          <Link
            href="/work"
            className="text-[0.6875rem] tracking-[0.18em] uppercase transition-opacity hover:opacity-60"
          >
            Все {total}
          </Link>
        )}
      </div>

      <ol data-reveal="group" className="divide-y divide-line border-t border-line">
        {items.map((row, index) => {
          // The register's row, in miniature: mark, words, object when there is
          // a client mark; the alternating pair when there is not.
          const logo = row.logoUrl;
          const flip = !logo && index % 2 === 1;
          return (
            <li key={row.id}>
              <Link
                href={`/work/${row.slug}`}
                className={`group grid items-center gap-8 py-12 md:py-16 ${
                  logo
                    ? 'md:grid-cols-[13rem_1fr_13rem] md:gap-12'
                    : flip
                      ? 'md:grid-cols-[1fr_16rem]'
                      : 'md:grid-cols-[16rem_1fr]'
                }`}
              >
                {logo && (
                  <div className="relative h-14 w-40 md:h-24 md:w-full">
                    <Image
                      src={logo}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 13rem, 10rem"
                      className="object-contain object-left transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-1 md:object-center"
                    />
                  </div>
                )}

                <div className={`min-w-0 ${logo ? '' : flip ? 'md:order-1' : 'md:order-2'}`}>
                  <p className="label mb-4">{[row.client, row.year].filter(Boolean).join(' · ')}</p>
                  <h3 className="text-[clamp(1.75rem,4vw,3rem)] leading-tight tracking-[-0.03em]">
                    {row.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
                    {row.task}
                  </p>
                  {row.technologies.length > 0 && (
                    <p className="mt-5 text-xs tracking-[0.06em] text-ink-3">
                      {row.technologies.join(' · ')}
                    </p>
                  )}
                </div>

                <div
                  className={`relative aspect-square w-36 md:w-full ${
                    logo ? '' : `max-md:order-first ${flip ? 'md:order-2' : 'md:order-1'}`
                  }`}
                >
                  <StudioObject
                    src={row.objectImage}
                    alt=""
                    sizes="(min-width: 768px) 16rem, 9rem"
                    className="transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-2"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </Band>
  );
}

/** The closing. One sentence of his, centred, the size of a poster. */
export function StartBand() {
  const { contact } = site;

  return (
    <Band tone="void" id="start" innerClassName="py-28 text-center md:py-44">
      {/* The stone, the size of a mark, above the label. */}
      <div data-reveal className="mx-auto mb-8 size-20 md:size-24">
        <Sculpture shape="knot" className="size-full" />
      </div>

      <p data-reveal className="text-[0.6875rem] tracking-[0.18em] text-paper/55 uppercase">
        Заявка
      </p>

      <p data-reveal className="display-1 mx-auto mt-12 max-w-6xl text-paper uppercase">
        {site.contactInvite}
      </p>

      <div data-reveal="group" className="mt-14 flex flex-col items-center">
        <CTA href="/start" tone="dark" size="lg">
          {site.heroCta}
        </CTA>
        <p className="mt-5 text-xs text-paper/60">
          Пара минут, никаких обязательств. Отвечаю {site.responseTime.toLowerCase()}.
        </p>
      </div>

      <dl
        data-reveal="group"
        className="mx-auto mt-24 grid max-w-3xl gap-10 border-t border-white/12 pt-10 text-sm sm:grid-cols-3"
      >
        <div>
          <dt className="label mb-3 text-paper/55">Ответ</dt>
          <dd className="text-paper/70">{site.responseTime}</dd>
        </div>
        <div>
          <dt className="label mb-3 text-paper/55">Почта</dt>
          <dd>
            <a
              href={`mailto:${contact.email}`}
              className="text-paper transition-opacity hover:opacity-60"
            >
              {contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="label mb-3 text-paper/55">Telegram</dt>
          <dd>
            <a
              href={`https://t.me/${contact.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper transition-opacity hover:opacity-60"
            >
              @{contact.telegram}
            </a>
          </dd>
        </div>
      </dl>
    </Band>
  );
}

import Image from 'next/image';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';
import { about } from '@/lib/content/about';
import { process, terms } from '@/lib/content/process';

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
 * How the work goes, read one stage at a time over him actually working.
 *
 * The band pins and holds the screen; behind the words his own footage runs,
 * dimmed almost to a texture, and the six stages pass through the frame one
 * after another as the reader scrolls. A process described in six equal cards
 * is a diagram; described one stage at a time over the room it happens in, it
 * is the thing itself.
 *
 * The terms fall out of the pinned band into their own strip underneath: they
 * are the small print of the arrangement, not part of its story.
 */

/*
 * Where each stage stands in the frame. A column of six blocks all pinned to
 * the same left edge reads as a list scrolling past; moved around the frame,
 * each arrival is somewhere new and the reader keeps looking.
 */
const PLACES = [
  'items-start text-left',
  'items-end text-right',
  'items-center text-center',
  'items-start text-left md:pl-[14%]',
  'items-end text-right md:pr-[12%]',
  'items-center text-center',
];

export function ProcessTrack() {
  const total = process.reduce((sum, stage) => sum + stage.weight, 0);

  return (
    <>
      <section data-reel data-tone="dark" id="process" className="relative w-full bg-void text-paper">
        <div
          data-reel-stage
          className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
        >
          {/* His own room, behind the words. Decorative: the stages say it all. */}
          <video
            data-video
            src="/gallery/room.mp4"
            poster="/gallery/room-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-70"
          />
          {/* Enough to hold white type, not so much that the room disappears. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/35 to-void/80"
          />

          <div className="shell relative w-full py-16 md:py-20">
            <h2 className="display-3 uppercase [text-shadow:0_2px_28px_rgb(5_5_5_/_0.6)]">
              Как идёт работа
            </h2>

            {/* A fixed frame the stages pass through, so the heading above it
                and the ground behind it never move. */}
            <div className="relative mt-10 h-[48svh] md:mt-14">
              <ol>
                {process.map((stage, index) => (
                  <li
                    key={stage.num}
                    data-reel-slide
                    className={`flex size-full flex-col justify-center ${PLACES[index % PLACES.length]}`}
                  >
                    <div className="max-w-2xl">
                      <p className="tabular text-[clamp(3rem,9vw,7rem)] leading-[0.85] font-extrabold tracking-[-0.05em] text-paper/35">
                        {stage.num}
                      </p>
                      <h3 className="mt-5 text-[clamp(1.5rem,3.6vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em] [text-shadow:0_1px_24px_rgb(5_5_5_/_0.55)]">
                        {stage.title}
                      </h3>
                      <p className="mt-3 text-sm tracking-[0.06em] text-paper/70">{stage.duration}</p>
                      <p className="mt-6 text-[clamp(0.9375rem,1.5vw,1.125rem)] leading-relaxed text-paper/85 [text-shadow:0_1px_18px_rgb(5_5_5_/_0.6)]">
                        {stage.body}
                      </p>
                      <p className="sr-only">
                        Доля этапа в общем сроке: {Math.round((stage.weight / total) * 100)} процентов.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <Band tone="shelf" innerClassName="py-20 md:py-28">
        <dl data-reveal="group" className="grid gap-10 md:grid-cols-3">
          {terms.map((term) => (
            <div key={term.label}>
              <dt className="label mb-3">{term.label}</dt>
              <dd className="text-sm leading-relaxed text-ink-2">{term.value}</dd>
            </div>
          ))}
        </dl>
      </Band>
    </>
  );
}

/** The closing. One sentence of his, centred, the size of a poster. */
export function StartBand() {
  const { contact } = site;

  return (
    <Band tone="void" id="start" innerClassName="py-28 text-center md:py-44">
      <p data-reveal className="text-[0.6875rem] tracking-[0.18em] text-paper/55 uppercase">
        Заявка
      </p>

      <p data-reveal className="display-1 mx-auto mt-12 max-w-6xl leading-[0.94] text-paper uppercase">
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

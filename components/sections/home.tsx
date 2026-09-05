import Image from 'next/image';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';
import { about } from '@/lib/content/about';
import { process, terms } from '@/lib/content/process';
import type { TestimonialRow } from '@/lib/cases';

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
      <p className="label mb-12">Позиция</p>
      <p className="display-3 max-w-5xl">{site.statement}</p>

      <div className="mt-24 grid gap-x-10 gap-y-14 border-t border-line pt-14 md:grid-cols-3">
        {site.stats.map((stat, index) => (
          <div key={stat.label} className={index === 0 ? 'md:col-span-1' : ''}>
            <p className="display-2 tabular">{stat.value}</p>
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
     * Built without the shared Band so the photograph can reach three edges of
     * the screen. A picture with a margin around it reads as an illustration
     * inside an article; one that runs off the top, bottom and right reads as
     * part of the page itself.
     */
    /*
     * A two-column spread rather than a picture pinned into the margin.
     *
     * The earlier version floated the photograph at the right edge with air
     * above and below it, which read as a rectangle that had drifted there by
     * accident. Filling its own column top to bottom makes it part of the page
     * instead: the section's height comes from the text, and the picture simply
     * occupies whatever that turns out to be.
     */
    <section
      data-tone="light"
      id="studio"
      className="relative w-full bg-paper text-ink lg:grid lg:grid-cols-[1.5fr_1fr]"
    >
      <div className="px-5 py-24 md:px-10 lg:py-32 lg:pr-20 lg:pl-[max(2.5rem,calc((100vw-1440px)/2+4rem))]">
        <p className="label mb-8">Обо мне</p>
        <p className="display-2 uppercase">{site.name}</p>
        <p className="lede mt-8 max-w-xl">{site.difference}</p>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2">{site.why[1]}</p>

        <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
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

      {/* Its own column, flush to the top, bottom and right of the section. */}
      <div className="relative h-80 w-full sm:h-[28rem] lg:h-auto">
        <Image
          src="/photo/portrait-work.webp"
          alt={`${site.name} за работой`}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
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
    <Band tone="shelf" id="process" innerClassName="py-28 md:py-40">
      <h2 className="display-2 mb-16 max-w-2xl uppercase">Как идёт работа</h2>

      {/* Stage widths are their real share of the timeline. */}
      <div className="mb-14 hidden h-px w-full bg-line-2 md:flex" aria-hidden>
        {process.map((stage) => (
          <div
            key={stage.num}
            style={{ flexGrow: stage.weight }}
            className="h-px border-l border-ink first:border-l-0"
          />
        ))}
      </div>

      <ol className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {process.map((stage) => (
          <li key={stage.num}>
            <p className="display-3 text-ink-3 tabular">{stage.num}</p>
            <h3 className="mt-4 text-lg leading-snug tracking-[-0.02em]">{stage.title}</h3>
            <p className="mt-1 text-sm text-ink-3">{stage.duration}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">{stage.body}</p>
            <p className="sr-only">
              Доля этапа в общем сроке: {Math.round((stage.weight / total) * 100)} процентов.
            </p>
          </li>
        ))}
      </ol>

      <dl className="mt-20 grid gap-10 border-t border-line-2 pt-10 md:grid-cols-3">
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
 * Testimonials.
 *
 * Renders nothing at all until the owner publishes a real one from the admin.
 * An empty band is honest; a placeholder quote is not.
 */
export function Voices({ items, total }: { items: TestimonialRow[]; total: number }) {
  if (items.length === 0) return null;

  return (
    <Band tone="paper" innerClassName="py-28 md:py-40">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display-2 uppercase">Отзывы</h2>
        {total > items.length && (
          <Link
            href="/reviews"
            className="text-[0.6875rem] tracking-[0.18em] uppercase transition-opacity hover:opacity-60"
          >
            Все {total}
          </Link>
        )}
      </div>

      <div className="grid gap-14 md:grid-cols-3">
        {items.map((voice) => (
          <div key={voice.id} className="border-t border-line pt-8">
            <blockquote className="text-lg leading-relaxed tracking-[-0.01em]">
              {voice.text}
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <Avatar name={voice.name} src={voice.avatarUrl} />
              <div className="min-w-0">
                <p className="text-sm">{voice.name}</p>
                {(voice.role || voice.company) && (
                  <p className="text-xs text-ink-3">
                    {[voice.role, voice.company].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
            {voice.caseSlug && (
              <Link
                href={`/work/${voice.caseSlug}`}
                className="label mt-6 inline-flex min-h-11 items-center transition-colors hover:text-ink"
              >
                Смотреть кейс
              </Link>
            )}
          </div>
        ))}
      </div>
    </Band>
  );
}

/**
 * A drawn monogram stands in when a client has not supplied a photo.
 * A generated face beside a real endorsement would invent a person.
 */
function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-shelf text-xs tracking-[0.06em] text-ink-2"
    >
      {initials}
    </span>
  );
}

/** The closing. One sentence of his, centred, the size of a poster. */
export function StartBand() {
  const { contact } = site;

  return (
    <Band tone="void" id="start" innerClassName="py-28 text-center md:py-44">
      <p className="text-[0.6875rem] tracking-[0.18em] text-paper/40 uppercase">Заявка</p>

      <p className="display-1 mx-auto mt-12 max-w-6xl text-paper uppercase">
        {site.contactInvite}
      </p>

      <div className="mt-14 flex flex-col items-center">
        <CTA href="/start" tone="dark" size="lg">
          {site.heroCta}
        </CTA>
        <p className="mt-5 text-xs text-paper/45">
          Пара минут, никаких обязательств. Отвечаю {site.responseTime.toLowerCase()}.
        </p>
      </div>

      <dl className="mx-auto mt-24 grid max-w-3xl gap-10 border-t border-white/12 pt-10 text-sm sm:grid-cols-3">
        <div>
          <dt className="label mb-3 text-paper/40">Ответ</dt>
          <dd className="text-paper/70">{site.responseTime}</dd>
        </div>
        <div>
          <dt className="label mb-3 text-paper/40">Почта</dt>
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
          <dt className="label mb-3 text-paper/40">Telegram</dt>
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

import Image from 'next/image';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';
import { about } from '@/lib/content/about';
import { process, terms } from '@/lib/content/process';
import { services } from '@/lib/content/services';
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
 * Services as an index, not a grid of cards.
 *
 * Fourteen rows of type on black. Hovering a row brings its one-liner in from
 * the right and lifts its object — so the detail is there when it is wanted and
 * invisible when it is not. Fourteen equal tiles would read as a price list,
 * which is exactly what the owner said he did not want.
 */
export function ServicesIndex() {
  return (
    <Band tone="void" id="services" innerClassName="py-28 md:py-40">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
        <h2 className="display-2 max-w-2xl uppercase">Что я делаю</h2>
        <Link
          href="/services"
          className="text-[0.6875rem] tracking-[0.18em] text-paper/60 uppercase transition-colors hover:text-paper"
        >
          Все {services.length} услуг
        </Link>
      </div>

      <ol>
        {services.map((service) => (
          <li key={service.slug} className="border-t border-white/12 last:border-b">
            <Link
              href={`/services/${service.slug}`}
              className="group grid grid-cols-[3rem_1fr] items-center gap-4 py-6 md:grid-cols-[4rem_1fr_auto] md:gap-8 md:py-8"
            >
              <span className="tabular text-[0.6875rem] tracking-[0.18em] text-paper/35">
                {service.num}
              </span>

              <span className="min-w-0">
                <span className="display-3 block text-paper transition-transform duration-400 ease-[var(--ease-studio)] group-hover:translate-x-3">
                  {service.title}
                </span>
                <span className="mt-2 block max-w-xl text-sm leading-relaxed text-paper/50 opacity-0 transition-opacity duration-400 group-hover:opacity-100 md:hidden">
                  {service.tagline}
                </span>
              </span>

              <span className="hidden max-w-md items-center gap-8 md:flex">
                <span className="text-sm leading-relaxed text-paper/50 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                  {service.tagline}
                </span>
                {/*
                  Always on screen, not only on hover. The device is what tells
                  a scanner what kind of thing this service produces, and at the
                  old sixty-four pixels it was a smudge nobody could identify.
                */}
                <span className="block w-36 shrink-0 opacity-45 transition-opacity duration-400 group-hover:opacity-100 lg:w-44">
                  {/* The object is a photograph on a near-white sweep, so it is
                      inverted here to sit on black instead of glowing on it. */}
                  <Image
                    src={service.object}
                    alt=""
                    width={400}
                    height={400}
                    sizes="176px"
                    className="h-auto w-full invert"
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
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
    <section data-tone="light" id="studio" className="relative w-full bg-paper text-ink">
      {/*
       * The text holds the shell and the photograph is pinned to the right edge
       * of the screen, not to a column. It is deliberately modest: a third of
       * the width and nothing like the full height. The words are what a
       * visitor is here to read; the picture is there to say who is saying them.
       */}
      <div className="shell py-24 md:py-32 lg:pr-[26rem] xl:pr-[30rem]">
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

      {/* Pinned to the viewport's right edge on wide screens. */}
      <div className="absolute top-1/2 right-0 hidden h-[24rem] w-[22rem] -translate-y-1/2 overflow-hidden lg:block xl:h-[28rem] xl:w-[26rem]">
        <Image
          src="/photo/portrait-work.webp"
          alt={`${site.name} за работой`}
          fill
          sizes="(min-width: 1280px) 26rem, 22rem"
          className="object-cover object-center"
        />
      </div>

      {/* Below the text on narrow screens, still edge to edge. */}
      <div className="relative h-72 w-full sm:h-96 lg:hidden">
        <Image
          src="/photo/portrait-work.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}

/**
 * Contacts.
 *
 * The closing band asks for a brief; this one is for the people who would
 * rather just write. Every channel he listed, each a real link, on the same
 * black ground as the rest of the loud parts of the page.
 */
export function Contacts() {
  const { contact } = site;

  const channels = [
    { label: 'Telegram', value: `@${contact.telegram}`, href: `https://t.me/${contact.telegram}` },
    { label: 'Почта', value: contact.email, href: `mailto:${contact.email}` },
    { label: 'WhatsApp', value: contact.phone, href: `https://wa.me/${contact.phoneHref.replace(/\D/g, '')}` },
    { label: 'Телефон', value: contact.phone, href: `tel:${contact.phoneHref}` },
    {
      label: 'Instagram',
      value: `@${contact.instagram}`,
      href: `https://instagram.com/${contact.instagram}`,
    },
    { label: 'GitHub', value: 'alyoshagafurov', href: contact.github },
  ];

  return (
    <Band tone="void" id="contacts" innerClassName="py-28 md:py-40">
      <p className="text-[0.6875rem] tracking-[0.18em] text-paper/40 uppercase">Контакты</p>
      <h2 className="display-2 mt-10 max-w-3xl text-paper uppercase">Напишите напрямую</h2>
      <p className="mt-8 max-w-lg text-base leading-relaxed text-paper/55">
        Если заполнять форму не хочется — просто напишите. Отвечаю{' '}
        {site.responseTime.toLowerCase()}. {site.hours}
      </p>

      <ul className="mt-16 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <li key={channel.label} className="border-t border-white/12">
            <a
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex min-h-20 items-center justify-between gap-6 py-6"
            >
              <span className="min-w-0">
                <span className="label mb-2 block text-paper/40">{channel.label}</span>
                <span className="block truncate text-lg text-paper transition-opacity group-hover:opacity-70">
                  {channel.value}
                </span>
              </span>
              <span
                aria-hidden
                className="shrink-0 text-paper/40 transition-transform duration-300 ease-[var(--ease-studio)] group-hover:translate-x-1 group-hover:text-paper"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
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

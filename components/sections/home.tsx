import Image from 'next/image';
import Link from 'next/link';
import { Band, Rule } from '@/components/ui/Band';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { site } from '@/lib/content/site';
import { about } from '@/lib/content/about';
import { process, terms } from '@/lib/content/process';
import { featuredServices, services } from '@/lib/content/services';
import type { TestimonialRow } from '@/lib/cases';

/*
 * The bands of the landing page, in the order a visitor meets them.
 *
 * They live in one module on purpose: they are six views of the same content,
 * none is reused anywhere else, and splitting them into six files would buy
 * nothing but six more imports.
 */

/** The statement, set large on white. The one moment of pure typography. */
export function Manifesto() {
  return (
    <Band tone="paper" innerClassName="py-24 md:py-36">
      <p className="label mb-10">Позиция</p>
      {/*
        The page's h1. The vitrine above is the loudest thing on screen but its
        heading changes as objects rotate, so the statement is what the document
        is actually about — and a landing page with no h1 at all is both an
        accessibility defect and a search one.
      */}
      <h1 className="max-w-5xl text-[clamp(1.5rem,3.6vw,2.75rem)] leading-[1.25] font-normal tracking-[-0.025em]">
        {site.statement}
      </h1>
      <div className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
        {site.stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none tracking-[-0.04em]">
              {stat.value}
            </p>
            <p className="mt-3 text-sm text-ink-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}

/**
 * Services as objects on a shelf.
 *
 * The three the owner named as his main ones get a photographed object each and
 * a full row; the remaining eleven are a quiet list underneath. A grid of
 * fourteen identical cards would read as a price list, which is exactly what he
 * said he did not want.
 */
export function ServicesShelf() {
  const rest = services.filter((service) => !service.featured);

  return (
    <Band tone="ground" id="services" innerClassName="py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4">Услуги</p>
          <h2 className="max-w-2xl text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.03em]">
            {site.shortStatement}
          </h2>
        </div>
        <PillLink href="/services" variant="outline" size="sm">
          Все услуги, {services.length}
        </PillLink>
      </div>

      <div className="mt-16 space-y-4 md:space-y-6">
        {featuredServices.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group grid items-center gap-6 border-t border-line pt-8 transition-colors hover:border-ink md:grid-cols-[8rem_1fr_14rem] md:gap-10"
          >
            <div className="relative aspect-square w-28 md:w-32">
              <StudioObject
                src={service.object}
                alt=""
                sizes="128px"
                className="transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-1.5"
              />
            </div>
            <div className="min-w-0">
              <p className="label mb-3">{service.num}</p>
              <h3 className="text-[clamp(1.375rem,2.6vw,2rem)] leading-tight tracking-[-0.025em]">
                {service.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">{service.tagline}</p>
            </div>
            <div className="md:text-right">
              {service.duration && <p className="text-sm text-ink-2">{service.duration}</p>}
              {service.budget && <p className="mt-1 text-sm text-ink-3">{service.budget}</p>}
              <span className="label mt-4 inline-block transition-colors group-hover:text-ink">
                Подробнее
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-8">
        <p className="label mb-6">Ещё {rest.length}</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-3">
          {rest.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-ink-2 transition-colors hover:border-ink hover:text-ink"
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

/** The one light panel with a person on it. */
export function AboutStudio() {
  return (
    <Band tone="paper" id="studio" innerClassName="py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className="order-2 md:order-1">
          <p className="label mb-8">Обо мне</p>
          <p className="text-[clamp(1.25rem,2.4vw,1.875rem)] leading-[1.35] tracking-[-0.02em]">
            {site.difference}
          </p>
          <p className="mt-8 max-w-prose text-base leading-relaxed text-ink-2">{about.bio}</p>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="label mb-2">{fact.label}</dt>
                <dd className="text-sm leading-snug">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <PillLink href="/about" variant="outline" size="sm" className="mt-10">
            Подробнее обо мне
          </PillLink>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-ground">
            <Image
              src="/photo/portrait-hero.webp"
              alt={`${site.name}, ${site.role}`}
              fill
              sizes="(min-width: 768px) 45vw, 92vw"
              className="object-cover object-top"
            />
          </div>
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
    <Band tone="shelf" id="process" innerClassName="py-24 md:py-32">
      <p className="label mb-4">Процесс</p>
      <h2 className="max-w-2xl text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.03em]">
        Как идёт работа
      </h2>

      {/* The track: each stage is as wide as its real share of the timeline. */}
      <div className="mt-14 hidden h-px w-full bg-line-2 md:flex" aria-hidden>
        {process.map((stage) => (
          <div
            key={stage.num}
            style={{ flexGrow: stage.weight }}
            className="h-px border-l border-ink first:border-l-0"
          />
        ))}
      </div>

      <ol className="mt-10 grid gap-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        {process.map((stage) => (
          <li key={stage.num}>
            <p className="label mb-3">{stage.num}</p>
            <h3 className="text-base leading-snug tracking-[-0.01em]">{stage.title}</h3>
            <p className="mt-1 text-sm text-ink-3">{stage.duration}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">{stage.body}</p>
            <p className="sr-only">
              Доля этапа в общем сроке: {Math.round((stage.weight / total) * 100)} процентов.
            </p>
          </li>
        ))}
      </ol>

      <dl className="mt-16 grid gap-8 border-t border-line-2 pt-8 md:grid-cols-3">
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
    <Band tone="paper" innerClassName="py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4">Отзывы</p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.03em]">
            Что говорят клиенты
          </h2>
        </div>
        {total > items.length && (
          <PillLink href="/reviews" variant="outline" size="sm">
            Посмотреть все, {total}
          </PillLink>
        )}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {items.map((voice) => (
          <div key={voice.id} className="border-t border-line pt-8">
            <blockquote className="text-base leading-relaxed">{voice.text}</blockquote>
            <div className="mt-6 flex items-center gap-3">
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
                className="label mt-5 inline-flex min-h-11 items-center transition-colors hover:text-ink"
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

/** The closing invitation. One line of his, one black pill. */
export function StartBand() {
  const { contact } = site;

  return (
    <Band tone="ground" id="start" innerClassName="py-24 md:py-36">
      <Rule className="mb-16" />
      <div className="grid gap-12 md:grid-cols-[1.5fr_1fr] md:items-end">
        <div>
          <p className="label mb-6">Заявка</p>
          <p className="max-w-3xl text-[clamp(1.75rem,4.4vw,3.25rem)] leading-[1.12] tracking-[-0.035em]">
            {site.contactInvite}
          </p>
          <PillLink href="/start" variant="solid" className="mt-10">
            {site.heroCta}
          </PillLink>
        </div>

        <dl className="space-y-6 text-sm md:justify-self-end md:text-right">
          <div>
            <dt className="label mb-2">Ответ</dt>
            <dd className="text-ink-2">{site.responseTime}</dd>
          </div>
          <div>
            <dt className="label mb-2">Почта</dt>
            <dd>
              <a href={`mailto:${contact.email}`} className="transition-opacity hover:opacity-60">
                {contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label mb-2">Telegram</dt>
            <dd>
              <a
                href={`https://t.me/${contact.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-60"
              >
                @{contact.telegram}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </Band>
  );
}

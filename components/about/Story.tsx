import type { ReactNode } from 'react';
import Image from 'next/image';
import { about } from '@/lib/content/about';
import { site } from '@/lib/content/site';

/*
 * Everything else about him, told as photographs with the text beside them.
 *
 * It used to be three bands of prose and then a wall of pictures at the end:
 * a page of reading, then a page of looking, and a visitor did one or the
 * other. Paired, each picture gives its paragraph a place and each paragraph
 * gives its picture a reason, and the page is walked rather than read.
 *
 * The sides alternate so the eye crosses the page instead of running down one
 * column. Each text is kept short on purpose — this is a caption's worth of
 * prose next to a picture, not an essay with an illustration.
 *
 * Every label carries the number, what is in the frame, and the month the
 * file was made, read out of the photograph itself. Nothing is claimed that
 * the picture does not show.
 */

type Spread = {
  src: string;
  title: string;
  when?: string;
  alt: string;
  width: number;
  height: number;
  /** Absent on the one picture that hangs alone, at the end. */
  body?: ReactNode;
};

const label = 'label mb-4';
const prose = 'text-[0.9375rem] leading-relaxed text-ink-2';

const spreads: Spread[] = [
  {
    src: '/gallery/work-desk.webp',
    title: 'За ноутбуком',
    when: 'Август 2026',
    alt: 'Алишер Гафуров работает за ноутбуком на диване',
    width: 1200,
    height: 1600,
    body: (
      <dl className="grid grid-cols-2 gap-x-8 gap-y-7">
        {about.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="label mb-2">{fact.label}</dt>
            <dd className="text-sm leading-snug">{fact.value}</dd>
          </div>
        ))}
      </dl>
    ),
  },
  {
    src: '/gallery/mma.webp',
    title: 'Зал единоборств',
    when: 'Апрель 2026',
    alt: 'В зале единоборств у клетки',
    width: 1200,
    height: 1600,
    body: (
      <>
        <h2 className={label}>Чему учился</h2>
        <ul className="space-y-4">
          {about.education.map((item) => (
            <li key={item} className={prose}>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    src: '/gallery/terrace.webp',
    title: 'Костюм и город',
    when: 'Апрель 2026',
    alt: 'В костюме на террасе над городом',
    width: 1200,
    height: 1600,
    body: (
      <>
        <h2 className={label}>Языки</h2>
        <ul className="divide-y divide-line border-y border-line">
          {about.languages.map((language) => (
            <li key={language.name} className="flex items-baseline justify-between py-3 text-sm">
              <span>{language.name}</span>
              <span className="text-ink-3">{language.level}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    src: '/gallery/gym.webp',
    title: 'Мешок и зеркало',
    when: 'Июнь 2026',
    alt: 'В тренажёрном зале, отражение в зеркале у боксёрского мешка',
    width: 900,
    height: 1600,
    body: (
      <>
        <h2 className={label}>Почему ко мне</h2>
        <p className={prose}>{site.why[0]}</p>
      </>
    ),
  },
  {
    src: '/gallery/work-phone.webp',
    title: 'Ноутбук и телефон',
    when: 'Август 2026',
    alt: 'За ноутбуком с телефоном в руке',
    width: 1200,
    height: 1600,
    body: <p className={prose}>{site.why[1]}</p>,
  },
  {
    src: '/gallery/park.webp',
    title: 'Парк, флагшток',
    when: 'Май 2026',
    alt: 'В парке у флагштока',
    width: 1200,
    height: 1600,
    body: (
      <>
        <h2 className={label}>За что не берусь</h2>
        <div className="space-y-5">
          {site.refuse.map((paragraph) => (
            <p key={paragraph} className={prose}>
              {paragraph}
            </p>
          ))}
        </div>
      </>
    ),
  },
  {
    src: '/gallery/hall.webp',
    title: 'Холл',
    when: 'Октябрь 2025',
    alt: 'В костюме в холле',
    width: 1200,
    height: 1600,
    body: (
      <>
        <h2 className={label}>Что говорят клиенты</h2>
        <ul className="space-y-4">
          {about.clientsSay.map((line) => (
            <li key={line} className={prose}>
              {line}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    src: '/gallery/mountains.webp',
    title: 'Горы',
    alt: 'В горах над зелёной долиной',
    width: 960,
    height: 1280,
    body: (
      <p className="text-[clamp(1.0625rem,1.8vw,1.375rem)] leading-relaxed tracking-[-0.015em]">
        {about.principle}
      </p>
    ),
  },
  {
    src: '/gallery/mirror.webp',
    title: 'Отражение',
    when: 'Май 2026',
    alt: 'Отражение в зеркале',
    width: 900,
    height: 1600,
  },
];

function Frame({ spread, index }: { spread: Spread; index: number }) {
  return (
    <figure className="group">
      <div className="overflow-hidden bg-ground">
        <Image
          src={spread.src}
          alt={spread.alt}
          width={spread.width}
          height={spread.height}
          sizes="(min-width: 768px) 46vw, 92vw"
          className="h-auto w-full transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.03]"
        />
      </div>

      <figcaption className="mt-4 flex items-baseline gap-4 border-t border-line pt-3">
        <span className="tabular text-[0.625rem] tracking-[0.22em] text-ink-3">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-[0.9375rem] leading-snug">{spread.title}</span>
        {spread.when && (
          <span className="ml-auto text-[0.6875rem] tracking-[0.08em] whitespace-nowrap text-ink-3">
            {spread.when}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function Story() {
  return (
    <div className="space-y-24 md:space-y-36">
      {/* The wall text at the entrance to the room: his own line, set large. */}
      <blockquote
        data-reveal
        className="mx-auto max-w-4xl text-center text-[clamp(1.375rem,3.2vw,2.5rem)] leading-[1.25] tracking-[-0.03em] text-balance"
      >
        «{about.offDuty}»
      </blockquote>

      {spreads.map((spread, index) => {
        // The one picture with nothing to say hangs alone, and closes the room.
        if (!spread.body) {
          return (
            <div key={spread.src} data-reveal="image" className="mx-auto max-w-lg">
              <Frame spread={spread} index={index} />
            </div>
          );
        }

        const flip = index % 2 === 1;
        return (
          <article
            key={spread.src}
            className="grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24"
          >
            <div data-reveal="image" className={flip ? 'md:order-2' : ''}>
              <Frame spread={spread} index={index} />
            </div>
            <div
              data-reveal="group"
              className={`max-w-md ${flip ? 'md:order-1 md:ml-auto' : ''}`}
            >
              {spread.body}
            </div>
          </article>
        );
      })}
    </div>
  );
}

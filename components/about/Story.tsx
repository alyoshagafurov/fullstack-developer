import type { ReactNode } from 'react';
import Image from 'next/image';
import { getDictionary } from '@/lib/i18n/server';

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
 * the picture does not show. The words come from the dictionary, matched to
 * the pictures by position.
 */

type Spread = {
  src: string;
  width: number;
  height: number;
  /** Absent on the one picture that hangs alone, at the end. */
  body?: ReactNode;
};

type Caption = { title: string; when: string; alt: string };

const label = 'label mb-4';
const prose = 'text-[0.9375rem] leading-relaxed text-ink-2';

function Frame({ spread, caption, index }: { spread: Spread; caption: Caption; index: number }) {
  return (
    <figure className="group">
      <div className="overflow-hidden bg-ground">
        <Image
          src={spread.src}
          alt={caption.alt}
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
        <span className="text-[0.9375rem] leading-snug">{caption.title}</span>
        {caption.when && (
          <span className="ml-auto text-[0.6875rem] tracking-[0.08em] whitespace-nowrap text-ink-3">
            {caption.when}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export async function Story() {
  const { lang, t } = await getDictionary();
  const about = t.about;
  const labels = about.storyLabels;
  const [open, close] = lang === 'ru' ? ['«', '»'] : ['“', '”'];

  const spreads: Spread[] = [
    {
      src: '/gallery/work-desk.webp',
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
      width: 1200,
      height: 1600,
      body: (
        <>
          <h2 className={label}>{labels.learned}</h2>
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
      width: 1200,
      height: 1600,
      body: (
        <>
          <h2 className={label}>{labels.languages}</h2>
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
      width: 900,
      height: 1600,
      body: (
        <>
          <h2 className={label}>{labels.why}</h2>
          <p className={prose}>{about.why[0]}</p>
        </>
      ),
    },
    {
      src: '/gallery/work-phone.webp',
      width: 1200,
      height: 1600,
      body: <p className={prose}>{about.why[1]}</p>,
    },
    {
      src: '/gallery/park.webp',
      width: 1200,
      height: 1600,
      body: (
        <>
          <h2 className={label}>{labels.refuse}</h2>
          <div className="space-y-5">
            {about.refuse.map((paragraph) => (
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
      width: 1200,
      height: 1600,
      body: (
        <>
          <h2 className={label}>{labels.clients}</h2>
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
      width: 960,
      height: 1280,
      body: (
        <p className="text-[clamp(1.0625rem,1.8vw,1.375rem)] leading-relaxed tracking-[-0.015em]">
          {about.principle}
        </p>
      ),
    },
    { src: '/gallery/mirror.webp', width: 900, height: 1600 },
  ];

  return (
    <div className="space-y-24 md:space-y-36">
      {/* The wall text at the entrance to the room: his own line, set large. */}
      <blockquote
        data-reveal
        className="mx-auto max-w-4xl text-center text-[clamp(1.375rem,3.2vw,2.5rem)] leading-[1.25] tracking-[-0.03em] text-balance"
      >
        {open}
        {about.offDuty}
        {close}
      </blockquote>

      {spreads.map((spread, index) => {
        const caption = about.spreads[index] ?? { title: '', when: '', alt: '' };

        // The one picture with nothing to say hangs alone, and closes the room.
        if (!spread.body) {
          return (
            <div key={spread.src} data-reveal="image" className="mx-auto max-w-lg">
              <Frame spread={spread} caption={caption} index={index} />
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
              <Frame spread={spread} caption={caption} index={index} />
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

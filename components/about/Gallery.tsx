import Image from 'next/image';
import { about } from '@/lib/content/about';

/*
 * The wall on /about.
 *
 * Hung, not tiled. Every frame here is a phone photograph in portrait, so a
 * grid of equal cells would line them up like passport pictures; instead each
 * takes its own width and hangs at its own height, the way pictures are hung
 * on a wall with the space between them doing as much work as the pictures.
 *
 * Every piece carries a label — a number, what is in the frame, and the month
 * it was taken, read out of the file. Nothing is claimed that the photograph
 * does not show and nothing is invented: a picture with a label is a work, a
 * picture without one is a snapshot, and the difference is the whole point of
 * the section.
 *
 * Nothing is cropped to a shape it was not shot in and nothing is filtered.
 * These are the owner's own pictures as they came off his phone.
 */

type Piece = {
  src: string;
  /** What is in the frame. Descriptive, never a claim. */
  title: string;
  /** The month the file was made. Absent where the file carries no date. */
  when?: string;
  alt: string;
  width: number;
  height: number;
  /** Where it hangs on a wide screen. */
  place: string;
};

const pieces: Piece[] = [
  {
    src: '/gallery/work-desk.webp',
    title: 'За ноутбуком',
    when: 'Август 2026',
    alt: 'Алишер Гафуров работает за ноутбуком на диване',
    width: 1200,
    height: 1600,
    place: 'md:col-start-1 md:col-span-5',
  },
  {
    src: '/gallery/mma.webp',
    title: 'Зал единоборств',
    when: 'Апрель 2026',
    alt: 'В зале единоборств у клетки',
    width: 1200,
    height: 1600,
    place: 'md:col-start-7 md:col-span-4 md:mt-24',
  },
  {
    src: '/gallery/terrace.webp',
    title: 'Костюм и город',
    when: 'Апрель 2026',
    alt: 'В костюме на террасе над городом',
    width: 1200,
    height: 1600,
    place: 'md:col-start-2 md:col-span-4 md:mt-28',
  },
  {
    src: '/gallery/gym.webp',
    title: 'Мешок и зеркало',
    when: 'Июнь 2026',
    alt: 'В тренажёрном зале, отражение в зеркале у боксёрского мешка',
    width: 900,
    height: 1600,
    place: 'md:col-start-7 md:col-span-5 md:mt-10',
  },
  {
    src: '/gallery/work-phone.webp',
    title: 'Ноутбук и телефон',
    when: 'Август 2026',
    alt: 'За ноутбуком с телефоном в руке',
    width: 1200,
    height: 1600,
    place: 'md:col-start-1 md:col-span-4 md:mt-20',
  },
  {
    src: '/gallery/park.webp',
    title: 'Парк, флагшток',
    when: 'Май 2026',
    alt: 'В парке у флагштока',
    width: 1200,
    height: 1600,
    place: 'md:col-start-6 md:col-span-5 md:mt-32',
  },
  {
    src: '/gallery/hall.webp',
    title: 'Холл',
    when: 'Октябрь 2025',
    alt: 'В костюме в холле',
    width: 1200,
    height: 1600,
    place: 'md:col-start-2 md:col-span-4 md:mt-16',
  },
  {
    src: '/gallery/mountains.webp',
    title: 'Горы',
    alt: 'В горах над зелёной долиной',
    width: 960,
    height: 1280,
    place: 'md:col-start-7 md:col-span-4 md:mt-28',
  },
  {
    src: '/gallery/mirror.webp',
    title: 'Отражение',
    when: 'Май 2026',
    alt: 'Отражение в зеркале',
    width: 900,
    height: 1600,
    place: 'md:col-start-3 md:col-span-5 md:mt-20',
  },
];

export function Gallery() {
  return (
    <>
      {/*
        The epigraph. His own line about what he does when he is not working,
        set the size of a wall text at the entrance to a room.
      */}
      <figure className="mx-auto mb-20 max-w-4xl text-center md:mb-28">
        <blockquote
          data-reveal
          className="text-[clamp(1.375rem,3.2vw,2.5rem)] leading-[1.25] tracking-[-0.03em] text-balance"
        >
          «{about.offDuty}»
        </blockquote>
      </figure>

      <div className="grid gap-y-14 md:grid-cols-12 md:gap-x-10 md:gap-y-4">
        {pieces.map((piece, index) => (
          <figure
            key={piece.src}
            data-reveal="image"
            className={`group w-[88%] even:ml-auto md:w-full md:even:ml-0 ${piece.place}`}
          >
            <div className="overflow-hidden bg-ground">
              <Image
                src={piece.src}
                alt={piece.alt}
                width={piece.width}
                height={piece.height}
                sizes="(min-width: 768px) 38vw, 88vw"
                className="h-auto w-full transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.03]"
              />
            </div>

            <figcaption className="mt-4 flex items-baseline gap-4 border-t border-line pt-3">
              <span className="tabular text-[0.625rem] tracking-[0.22em] text-ink-3">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-[0.9375rem] leading-snug">{piece.title}</span>
              {piece.when && (
                <span className="ml-auto text-[0.6875rem] tracking-[0.08em] whitespace-nowrap text-ink-3">
                  {piece.when}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

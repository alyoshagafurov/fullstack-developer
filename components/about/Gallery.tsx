import Image from 'next/image';

/*
 * The gallery on /about: him at work, in the hall, and away from both.
 *
 * Hung rather than tiled. Every frame here is a phone photograph in portrait,
 * so a grid of equal cells would line them up like passport pictures; the
 * columns let each keep its own height and the wall falls into its own rhythm.
 * Nothing is cropped to a shape it was not shot in, and nothing is filtered:
 * these are the owner's own pictures, as they came off his phone.
 *
 * The two videos carry `data-video`. They start on their own, muted and
 * looping, and the motion layer pauses them the moment they leave the screen
 * so a page nobody is looking at is not decoding video.
 */

type Piece = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Present on the two moving frames; the still ones have none. */
  poster?: string;
};

const pieces: Piece[] = [
  { src: '/gallery/work-desk.webp', alt: 'За ноутбуком на диване', width: 1200, height: 1600 },
  { src: '/gallery/desk.mp4', poster: '/gallery/desk-poster.webp', alt: 'Надевает наушники и садится работать', width: 720, height: 1280 },
  { src: '/gallery/mma.webp', alt: 'В зале единоборств у клетки', width: 1200, height: 1600 },
  { src: '/gallery/terrace.webp', alt: 'В костюме на террасе над Душанбе', width: 1200, height: 1600 },
  { src: '/gallery/gym.webp', alt: 'В тренажёрном зале у мешка', width: 900, height: 1600 },
  { src: '/gallery/room.mp4', poster: '/gallery/room-poster.webp', alt: 'Работает за ноутбуком в общей комнате', width: 720, height: 1280 },
  { src: '/gallery/work-phone.webp', alt: 'За ноутбуком с телефоном в руке', width: 1200, height: 1600 },
  { src: '/gallery/park.webp', alt: 'В парке у флагштока в Душанбе', width: 1200, height: 1600 },
  { src: '/gallery/hall.webp', alt: 'В костюме в холле', width: 1200, height: 1600 },
  { src: '/gallery/mountains.webp', alt: 'В горах над зелёной долиной', width: 960, height: 1280 },
  { src: '/gallery/mirror.webp', alt: 'Отражение в зеркале', width: 900, height: 1600 },
];

export function Gallery() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
      {pieces.map((piece) => (
        <figure
          key={piece.src}
          data-reveal="image"
          className="group mb-4 break-inside-avoid overflow-hidden bg-ground lg:mb-6"
        >
          {piece.poster ? (
            <video
              data-video
              src={piece.src}
              poster={piece.poster}
              width={piece.width}
              height={piece.height}
              aria-label={piece.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-auto w-full transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src={piece.src}
              alt={piece.alt}
              width={piece.width}
              height={piece.height}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
              className="h-auto w-full transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.03]"
            />
          )}
        </figure>
      ))}
    </div>
  );
}

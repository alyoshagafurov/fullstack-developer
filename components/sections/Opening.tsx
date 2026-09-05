import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the set extended, rather than the photograph stretched.
 *
 * Every earlier version covered the screen with the picture and then fought
 * the consequences: a wide window cropped the top of his head, a phone cropped
 * everything but his face, and the words had to hunt for a patch of wall that
 * kept moving. He asked, reasonably, not to be that close.
 *
 * So the photograph is never scaled past its own framing. It stands at the
 * bottom right at a height set off the window — around three quarters of it on
 * a desk screen, half on a phone — and the section around it continues the two
 * planes the picture is made of: the pale wall above the desk line, the dark
 * desk below it. The photograph's top and left edges are feathered into those
 * planes so there is no rectangle, just a room that carries on past the frame.
 *
 * That gives the words a permanent home. The statement stands on the wall at
 * the top left, black, as large as the window allows; the paragraph on the
 * wall at the top right; the button on the desk, centred, white. None of it
 * ever overlaps him and none of it needs a scrim or a media-query gate.
 *
 * The left 20% of the frame — the plant — is cropped away. Its leaves and pot
 * cannot feather into a flat plane the way empty wall and desk do.
 *
 * Colours are sampled from the file, not chosen: wall #d6d0ca→#bdb7b2 across,
 * desk #5a5652→#121212 down, desk line at 78.7% of the frame height.
 */
export function Opening() {
  /*
   * One word per line, the last two kept together — his statement, only
   * re-broken. "Цифровые / продукты, / с характером".
   */
  const words = site.shortStatement.split(' ');
  const lines = [words[0], words[1], words.slice(2).join(' ')].filter(Boolean);

  return (
    <section
      data-tone="light"
      /* `--ph` is the photograph's height; everything else is derived from it. */
      className="relative h-[100svh] w-full overflow-hidden [--ph:min(52svh,140vw)] md:[--ph:min(76svh,58vw)]"
      style={{
        background: 'linear-gradient(96deg, #e3ddd7 0%, #d5cfc9 42%, #bdb7b2 100%)',
      }}
    >
      {/* The desk, continued across the whole width. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[calc(var(--ph)*0.213)]"
        style={{
          background:
            'linear-gradient(180deg, #5a5652 0%, #4d4946 45%, #3e3c3a 88%, #141414 100%)',
        }}
      />

      {/*
       * The photograph, at its own framing. Centred on a phone, where it is
       * wider than the screen; flush right on a desk screen, where it is not.
       * Feathered on the top and the left so its edges never read as edges.
       */}
      {/*
       * The box is the frame with its left 20% cut off, which is exactly the
       * plant. The left feather is kept to 6% so it ends before the mug: a
       * feathered black mug against the pale wall read as a grey ghost.
       */}
      <div
        className="absolute bottom-0 left-1/2 aspect-[1338/941] h-[var(--ph)] -translate-x-1/2 md:right-0 md:left-auto md:translate-x-0"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, #000 15%), linear-gradient(to right, transparent, #000 9%)',
          maskComposite: 'intersect',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 15%), linear-gradient(to right, transparent, #000 9%)',
          WebkitMaskComposite: 'source-in',
        }}
      >
        <Image
          src="/photo/hero.webp"
          alt={`${site.name}, ${site.role}`}
          fill
          priority
          sizes="(min-width: 768px) 105vw, 200vw"
          /* The box is 17% narrower than the frame; anchoring right is what
             drops the plant and nothing else. */
          className="object-cover object-right"
        />
      </div>

      {/* The words, on the wall. */}
      <div className="absolute inset-x-0 top-0 px-5 pt-24 md:px-10 md:pt-28">
        <div className="mx-auto w-full max-w-[1440px] md:flex md:items-start md:justify-between md:gap-16">
          <div className="min-w-0 md:w-[58%]">
            <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink uppercase">
              <span aria-hidden className="block h-px w-10 bg-ink/50" />
              {site.role}
            </p>

            <h1 className="mt-4 text-[clamp(2.5rem,5.2vw,6rem)] leading-[0.95] tracking-[-0.045em] text-ink uppercase md:mt-5">
              {lines.map((line, index) => (
                <span
                  key={line}
                  className={`block ${index === lines.length - 1 ? 'font-light' : 'font-extrabold'}`}
                >
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink md:mt-1 md:text-[0.9375rem]">
            {site.difference}
          </p>
        </div>
      </div>

      {/* The button, centred on the desk. */}
      <div className="absolute inset-x-0 bottom-[calc(var(--ph)*0.1065)] flex translate-y-1/2 justify-center px-5">
        <CTA href="/start" tone="dark" size="lg">
          {site.heroCta}
        </CTA>
      </div>
    </section>
  );
}

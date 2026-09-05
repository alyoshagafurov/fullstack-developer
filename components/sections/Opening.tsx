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
 * bottom of the screen at a height set off the window — nine tenths of it on a
 * desk screen, just over half on a phone — and the section around it continues
 * the two planes the picture is made of: the white wall above the desk line,
 * the grey desk below it. The photograph's top and right edges are feathered
 * into those planes so there is no rectangle, just a room that carries on past
 * the frame. On a desk screen it sits flush left, so the plant stays in.
 *
 * That gives the words a permanent home. The statement stands on the wall at
 * the top left, black, above the plant; the paragraph on the wall at the top
 * right; the button on the desk, centred, white. None of it ever overlaps him
 * and none of it needs a scrim or a media-query gate.
 *
 * Measured off the file, not chosen: wall #ebe9e7→#e5e3e3 across, desk #787373,
 * desk line at 85.9% of the frame height, plant no higher than 37% of it, his
 * head no higher than 30%.
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
      className="relative h-[100svh] w-full overflow-hidden [--ph:min(58svh,150vw)] md:[--ph:min(90svh,56vw)]"
      style={{
        background: 'linear-gradient(96deg, #f4f2f0 0%, #ecebe9 55%, #e5e3e2 100%)',
      }}
    >
      {/* The desk, continued across the whole width. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[calc(var(--ph)*0.141)]"
        style={{ background: 'linear-gradient(180deg, #7b7776 0%, #767271 60%, #6e6a69 100%)' }}
      />

      {/*
       * The photograph, whole, at its own framing. Flush left on a desk screen,
       * where it is narrower than the window; on a phone it is wider than the
       * screen and is shifted so that he, not the frame's centre, is centred.
       */}
      <div
        className="absolute bottom-0 left-1/2 aspect-[1672/941] h-[var(--ph)] -translate-x-[62%] md:left-0 md:translate-x-0"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to left, transparent, #000 8%)',
          maskComposite: 'intersect',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to left, transparent, #000 8%)',
          WebkitMaskComposite: 'source-in',
        }}
      >
        {/* A new name, not a new version of the old one: the optimiser and the
            CDN cache by URL, and this file has already been replaced twice. */}
        <Image
          src="/photo/hero-wide.webp"
          alt={`${site.name}, ${site.role}`}
          fill
          priority
          sizes="(min-width: 768px) 100vw, 220vw"
          className="object-cover object-center"
        />
      </div>

      {/*
       * The words, on the wall. On a desk screen the statement stands on the
       * right, ranged right so it hugs the edge and never reaches his head,
       * and the paragraph takes the left; on a phone they stack in reading
       * order, statement first.
       */}
      <div className="absolute inset-x-0 top-0 px-5 pt-24 md:px-10 md:pt-32">
        <div className="mx-auto w-full max-w-[1440px] md:flex md:flex-row-reverse md:items-start md:justify-between md:gap-16">
          <div className="min-w-0 md:w-1/2 md:text-right">
            <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink uppercase md:flex-row-reverse">
              <span aria-hidden className="block h-px w-10 bg-ink/50" />
              {site.role}
            </p>

            <h1 className="mt-3 text-[clamp(2.25rem,4.4vw,5.25rem)] leading-[0.95] tracking-[-0.045em] text-ink uppercase md:mt-4">
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

      {/* The button, centred on the desk, lifted a little off its edge. */}
      <div className="absolute inset-x-0 bottom-[calc(var(--ph)*0.0705+20px)] flex translate-y-1/2 justify-center px-5">
        <CTA href="/start" tone="dark" size="lg">
          {site.heroCta}
        </CTA>
      </div>
    </section>
  );
}

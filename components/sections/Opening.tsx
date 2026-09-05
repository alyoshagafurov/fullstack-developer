import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the photograph fills the screen and the statement is black on
 * the wall behind him.
 *
 * Which piece of wall depends on how the window crops the frame, and there are
 * two, both defined as variants in globals.css:
 *
 *   wall  — a wide window keeps the strip left of his shoulder, clear from the
 *           top down past the plant. Statement there, paragraph top right.
 *   crown — a phone crops that strip away but keeps 150–200px of wall directly
 *           above his head. Label and statement there, across the full width;
 *           paragraph and button stay down on the desk.
 *
 * Both are measured against the photograph rather than guessed — 476 window
 * sizes for the first, 817 for the second, no clipping in either and never
 * worse than 9:1 anywhere. Neither reaches the picture: no darkening at all
 * under `wall`, and under `crown` only the short falloff the desk needs to
 * carry the paragraph.
 *
 * A window too short for even the crown — an old phone, or something flatter
 * than 2.6:1 — puts everything back on the desk in white. There is no third
 * piece of wall to use.
 */
export function Opening() {
  /*
   * One word per line, the last two kept together — his statement, only
   * re-broken. "Цифровые / продукты, / с характером".
   */
  const words = site.shortStatement.split(' ');
  const lines = [words[0], words[1], words.slice(2).join(' ')].filter(Boolean);

  return (
    <section data-tone="light" className="relative h-[100svh] w-full overflow-hidden bg-ground">
      <Image
        src="/photo/hero.webp"
        alt={`${site.name}, ${site.role}`}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_45%]"
      />

      {/* Carries the paragraph on the desk. Gone entirely on a wide window. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/90 via-black/55 to-transparent wall:hidden"
      />

      <div className="absolute inset-0 flex flex-col px-5 pt-24 pb-10 md:px-10 crown:pt-15 wall:pt-18 wall:pb-14">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end wall:justify-start">
          {/*
           * One wrapper, three shapes. As a plain block it stacks the two at
           * the bottom; `crown` makes it fill the screen so the statement is
           * held at the top and the paragraph falls to the desk; `wall` makes
           * it a row so they sit side by side across the top.
           */}
          <div className="crown:flex crown:flex-1 crown:flex-col crown:justify-between wall:flex wall:items-start wall:justify-between wall:gap-16">
            {/* Held to 34% of the window: past that the column runs into his
                shoulder and the wall behind it stops being empty. */}
            <div className="min-w-0 wall:w-[34%]">
              {/*
               * Full-strength ink, not the muted grey the rest of the site
               * uses for labels. That grey is chosen against white; against a
               * wall that measures 203–210 it drops to 3.3:1, under the floor
               * for eleven-pixel type.
               */}
              <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-paper uppercase crown:text-ink wall:text-ink">
                <span
                  aria-hidden
                  className="block h-px w-10 bg-paper/70 crown:bg-ink-2 wall:bg-ink-2"
                />
                {site.role}
              </p>

              {/*
               * Sized off whichever axis runs out first, so the statement
               * shrinks with the wall it stands on rather than running onto the
               * plant or into his hair.
               */}
              <h1 className="mt-6 text-[clamp(2rem,4vw,4.5rem)] leading-[1.02] tracking-[-0.04em] text-paper uppercase crown:mt-2 crown:text-[min(5.6vw,2.6svh)] crown:text-ink wall:mt-3 wall:text-[min(3vw,5svh,4rem)] wall:text-ink">
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

            {/* Ink rather than the muted grey, for the same reason as the
                label: the wall under this corner measures as low as 173. */}
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/70 crown:mt-0 wall:mt-1 wall:text-ink">
              {site.difference}
            </p>
          </div>

          {/* Centred at the bottom on every size — a white pill on the desk. */}
          <div className="mt-10 flex justify-center crown:mt-6 wall:mt-auto">
            <CTA href="/start" tone="dark" size="lg">
              {site.heroCta}
            </CTA>
          </div>
        </div>
      </div>
    </section>
  );
}

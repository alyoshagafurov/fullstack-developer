import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the photograph fills the screen and the words use the wall.
 *
 * The frame has two usable areas and they want opposite treatments. The upper
 * half is a pale wall, so type there must be black; the desk across the bottom
 * is nearly black, so type there must be white. Given the room, the statement
 * belongs high on the wall — nothing darkening the picture, nothing on top of
 * him.
 *
 * Whether there is room is a question about the window's shape rather than its
 * size, because the frame is 16:9: a window near that ratio shows nearly all of
 * it, a squarer or a wider one crops until his head or the plant reaches the
 * top. That is what the `wall` variant in globals.css tests, and its bounds
 * come from sweeping the photograph itself across 214 window sizes.
 *
 * Outside those bounds the words go back down onto the desk in white over a
 * short falloff — which is what the desk looks like anyway.
 *
 * The headline is sized off the shorter of the two axes (`min(3.4vw, 5.4svh)`)
 * so that it shrinks with the wall it stands on instead of running into the
 * plant when the window gets short.
 *
 * The button is centred at the bottom either way: the strip it sits in never
 * measured above 60 average luminance on any window tested, so a white pill
 * holds there with no help.
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
        /*
         * Biased past centre so that on a window wider than the frame the crop
         * eats the empty wall at the top and keeps the desk.
         */
        className="object-cover object-[50%_45%]"
      />

      {/* Only on the windows too small for the wall. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/90 via-black/55 to-transparent wall:hidden"
      />

      <div className="absolute inset-0 flex flex-col px-5 pt-24 pb-10 md:px-10 wall:pt-22 wall:pb-14">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end wall:justify-start">
          <div className="wall:flex wall:items-start wall:justify-between wall:gap-16">
            {/* Held to 38% of the window: past that the column runs into his
                shoulder and the wall behind it stops being empty. */}
            <div className="min-w-0 wall:w-[38%]">
              <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-paper uppercase wall:text-ink-2">
                <span aria-hidden className="block h-px w-10 bg-paper/70 wall:bg-ink-3" />
                {site.role}
              </p>

              <h1 className="mt-6 text-[clamp(2rem,min(3.4vw,5.4svh),4.5rem)] leading-[1.02] tracking-[-0.04em] text-paper uppercase wall:text-ink">
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

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/70 wall:mt-2 wall:text-ink-2">
              {site.difference}
            </p>
          </div>

          <div className="mt-10 flex justify-center wall:mt-auto">
            <CTA href="/start" tone="dark" size="lg">
              {site.heroCta}
            </CTA>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the photograph fills the screen, and the words sit on the desk.
 *
 * Every earlier version fought the same battle — type over his chest, where the
 * statement is black and his shirt is black too, so the second line vanished.
 * This photograph solves it by having a place for words in it: the desk across
 * the bottom is almost black and completely empty, and he is above it with
 * nothing on him. So the type goes there in white, he stays uncovered, and the
 * top two thirds are left as air.
 *
 * Big line left, the short one right, the button centred underneath — the
 * arrangement the owner asked for.
 *
 * `data-tone="light"` because the header sits over the top of the picture,
 * which is a pale wall; the dark half is at the other end of the screen.
 */
export function Opening() {
  // "Цифровые продукты, с характером" — split so the second half can take a
  // lighter weight and the line reads as one sentence rather than two shouts.
  const [head, tail] = site.shortStatement.split(', ');

  return (
    <section data-tone="light" className="relative h-[100svh] w-full overflow-hidden bg-ground">
      <Image
        src="/photo/hero.webp"
        alt={`${site.name}, ${site.role}`}
        fill
        priority
        sizes="100vw"
        /*
         * Vertically biased past centre so that on a screen wider than the
         * frame the crop eats the empty wall at the top and keeps the desk.
         */
        className="object-cover object-[50%_45%]"
      />

      {/*
       * The falloff the type sits on.
       *
       * Measured, not guessed. The words land partly on the desk and partly on
       * the pale wall behind it, and white on that wall came out at 3.3:1 —
       * unreadable. These stops hold every line above 6:1 on the worst pixel
       * behind it, on a phone as well as a desk, while reaching zero at 76% of
       * the height: his face loses about a sixth of its brightness and the top
       * of the frame is untouched. What it looks like is light falling off
       * towards the foreground, which is what the photograph already does.
       */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.93)_0%,rgba(0,0,0,0.84)_25%,rgba(0,0,0,0.52)_52%,rgba(0,0,0,0)_76%)]"
      />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-16">
            <div className="min-w-0">
              {/* Full strength, not the usual 60%: this line sits highest of
                  the four, where the falloff is weakest, and at 60% the
                  worst-case pixel behind it fell under 3:1. */}
              <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-paper uppercase">
                <span aria-hidden className="block h-px w-10 bg-paper/70" />
                {site.role}
              </p>

              <h1 className="mt-6 text-[clamp(2.125rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-paper uppercase">
                <span className="block font-extrabold">{head},</span>
                {tail && <span className="block font-light">{tail}</span>}
              </h1>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-paper/70 md:pb-3">
              {site.difference}
            </p>
          </div>

          <div className="mt-10 flex justify-center md:mt-12">
            <CTA href="/start" tone="dark" size="lg">
              {site.heroCta}
            </CTA>
          </div>
        </div>
      </div>
    </section>
  );
}

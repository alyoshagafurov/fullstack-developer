import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening.
 *
 * The composition follows a reference the owner pinned: the statement set heavy
 * and left, a short line of small caps opposite it on the right, micro-captions
 * in the corners, and the photograph filling the screen behind all of it. Only
 * the typography and the placement were taken from that reference — every word
 * here is his own, from his answers, and the button stays centred at the foot
 * of the screen because he asked for it there.
 *
 * The scrims are legibility, not decoration. His photograph has a plant in the
 * left third and the type is ink, so the left is lifted enough to hold letters
 * and no further: the leaves, the shadows on the wall and the desk all survive.
 *
 * `data-tone="light"` tells the header to go black here.
 */
export function Opening() {
  // "Цифровые продукты, с характером" — his line, split so the second half can
  // carry a lighter weight, as in the reference.
  const [head, tail] = site.shortStatement.split(', ');

  return (
    <section
      data-tone="light"
      className="relative flex h-[100svh] w-full flex-col overflow-hidden bg-ground"
    >
      <Image
        src="/photo/hero.webp"
        alt={`${site.name}, ${site.role}`}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_30%]"
      />

      {/*
        One scrim, and only where it is needed: the plant sits in the left
        third and the statement is ink. It stops before the middle so his face,
        the shadows on the wall and the desk keep their contrast — an earlier
        pair of gradients covered the whole frame and left the photograph hazy.
        The small line on the right needs none: that part of the wall is already
        the lightest thing in the picture.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-white/75 from-0% via-white/15 via-30% to-transparent to-45%"
      />

      <div className="shell relative flex flex-1 flex-col justify-center pt-24 pb-32 md:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink-2 uppercase">
              <span aria-hidden className="block h-px w-10 bg-ink-3" />
              {site.role}
            </p>

            <h1 className="mt-8 text-[clamp(2rem,6.6vw,5.5rem)] leading-[0.92] tracking-[-0.04em] uppercase">
              <span className="block font-extrabold">{head},</span>
              {tail && <span className="block font-light">{tail}</span>}
            </h1>

            <p className="mt-10 text-[0.6875rem] leading-[2] tracking-[0.22em] text-ink-2 uppercase">
              {site.name}
            </p>
          </div>

          {/* His own sentence, set small and opposite the statement. */}
          <div className="hidden lg:block lg:justify-self-end lg:text-right">
            <p className="max-w-xs text-sm leading-[2] tracking-[0.04em] text-ink-2">
              {site.difference}
            </p>
            <span aria-hidden className="mt-8 ml-auto block h-px w-14 bg-ink-3" />
          </div>
        </div>
      </div>

      {/* The button, centred at the foot, exactly where he asked for it. */}
      <div className="relative shrink-0 pb-20 text-center md:pb-24">
        <CTA href="/start" size="lg">
          {site.heroCta}
        </CTA>
      </div>

      {/*
        The corner captions are paper, not ink: this strip of the photograph is
        the desk, which is nearly black. They are the one part of the opening
        that does not follow the band's tone, because they do not sit on the
        band — they sit on the darkest part of the picture.
      */}
      <div className="shell relative flex shrink-0 items-end justify-between gap-6 pb-6 text-[0.6875rem] tracking-[0.22em] text-white/55 uppercase">
        <p className="flex items-center gap-4">
          <span className="tabular">01</span>
          <span aria-hidden className="block h-px w-10 bg-white/40" />
          Душанбе · UTC+5
        </p>
        <p className="hidden items-center gap-3 sm:flex">
          Прокрутите вниз
          <span aria-hidden>↓</span>
        </p>
      </div>
    </section>
  );
}

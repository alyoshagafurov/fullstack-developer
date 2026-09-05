import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the words are behind him, split left and right.
 *
 * The ground is light rather than black, and that is not a preference. The
 * cut-out is a man in a black t-shirt with dark hair, a black mug and a dark
 * desk; on a black band all of that disappears and only his face and forearms
 * survive. On the warm off-white he reads whole and the type reads as ink.
 *
 * Everything is sized from the stage's height, never its width. An earlier
 * version sized the photograph by viewport width, and on a wide window it grew
 * taller than the space it had — cropping the top of his head — while the words
 * sat high enough to collide with the navigation. Height-driven sizing cannot
 * do either.
 */
export function Opening() {
  return (
    <section
      data-tone="light"
      className="relative flex h-[100svh] flex-col overflow-hidden bg-ground pt-24 md:pt-28"
    >
      <div className="relative flex-1">
        {/*
          The type layer sits at two-fifths of the stage, which is where the top
          of the photograph lands — so the words cross him at the hairline,
          where his silhouette is narrowest and each one keeps most of its
          length visible. Lower down his shoulders would swallow them.
        */}
        <div
          aria-hidden
          className="shell absolute inset-x-0 top-[22%] z-0 flex items-start justify-between gap-4 md:top-[7%]"
        >
          <span className="text-[clamp(1.5rem,7.2vw,6.5rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-ink uppercase">
            Цифровые
          </span>
          <span className="text-[clamp(1.5rem,7.2vw,6.5rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-ink uppercase">
            продукты,
          </span>
        </div>

        {/* The real heading, for anything that reads rather than looks. */}
        <h1 className="sr-only">
          {site.shortStatement}. {site.name}, {site.role}.
        </h1>

        {/*
         * `contain`, filling the stage.
         *
         * The photograph is wide, the stage is not; sizing it by viewport width
         * made it taller than the space it had and cropped the top of his head,
         * and sizing it by a fraction of the stage's height left him small on a
         * wide screen. Filling the stage and containing solves both: as large
         * as the room allows, never cut.
         */}
        <Image
          src="/photo/hero-cut.webp"
          alt={`${site.name}, ${site.role}`}
          fill
          priority
          sizes="100vw"
          className="z-10 object-contain object-bottom"
        />
      </div>

      <div className="shell relative z-20 shrink-0 pb-8 text-center md:pb-10">
        <p className="text-[clamp(1.375rem,4.4vw,3.25rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase">
          С характером
        </p>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ink-2 md:text-base">
          {site.difference}
        </p>

        <CTA href="/start" size="lg" className="mt-8">
          {site.heroCta}
        </CTA>
      </div>
    </section>
  );
}

import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening, in three layers.
 *
 *   1. the photograph, full bleed — wall, plant, desk, all of it
 *   2. the words, on top of it
 *   3. the same frame with the background cut away, on top of the words
 *
 * Because layers one and three are the same shot at the same size with the same
 * fit and the same object-position, the cut-out lands exactly over the man in
 * the photograph. The words slip behind him while the room stays visible — an
 * effect that is impossible with one image and trivial with two.
 *
 * The registration is the fragile part. Both files are exported from the same
 * crop at the same pixel dimensions, and both images below must keep identical
 * sizing classes. Change the fit on one and a ghost edge appears around him.
 */

// The single source of truth for how both layers are placed.
const FRAME = 'object-cover object-[58%_30%]';

export function Opening() {
  return (
    <section
      data-tone="light"
      className="relative flex h-[100svh] flex-col justify-end overflow-hidden bg-ground"
    >
      {/* 1. The room. */}
      <Image
        src="/photo/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`z-0 ${FRAME}`}
      />

      {/*
        2. The words, over the wall behind him.
        Ink rather than paper: at this height the frame is the lit wall, and
        white letters would disappear into it.
      */}
      <div
        aria-hidden
        className="shell absolute inset-x-0 top-[26%] z-10 flex items-start justify-between gap-4 md:top-[20%]"
      >
        <span className="text-[clamp(1.5rem,7.2vw,6.5rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-ink uppercase">
          Цифровые
        </span>
        <span className="text-[clamp(1.5rem,7.2vw,6.5rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-ink uppercase">
          продукты,
        </span>
      </div>

      {/* 3. Him, cut out, in front of the words. */}
      <Image
        src="/photo/hero-cut.webp"
        alt={`${site.name}, ${site.role}`}
        fill
        priority
        sizes="100vw"
        className={`z-20 ${FRAME}`}
      />

      {/*
        A light strip the height of the header, and no taller.
        The plant occupies the top-left of this frame, and the wordmark is cut
        black — over the leaves it vanished. Lifting only the strip the chrome
        occupies costs the photograph nothing anyone looks at.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-white/85 to-transparent md:h-32"
      />

      <h1 className="sr-only">
        {site.shortStatement}. {site.name}, {site.role}.
      </h1>

      {/*
        The closing block sits over the desk, which is nearly black in the
        photograph — so this is the one part of the opening set in paper. A
        gradient carries it, because the desk's edge crosses the text and a flat
        scrim would flatten the room behind it.
      */}
      <div className="relative z-30 w-full bg-gradient-to-t from-black/80 via-black/55 to-transparent pt-24 pb-10">
        <div className="shell text-center">
          <p className="text-[clamp(1.375rem,4.4vw,3.25rem)] leading-[0.9] font-extrabold tracking-[-0.04em] text-paper uppercase">
            С характером
          </p>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-paper/75 md:text-base">
            {site.difference}
          </p>

          <CTA href="/start" tone="dark" size="lg" className="mt-8">
            {site.heroCta}
          </CTA>
        </div>
      </div>
    </section>
  );
}

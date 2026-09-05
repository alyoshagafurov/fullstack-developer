import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the photograph is the screen, the words sit in the middle of it.
 *
 * A scrim carries the type. It is not decoration — over the lit wall behind him
 * white letters simply vanish, and an earlier split-screen version avoided the
 * problem by never crossing the picture at all. Centred type has to cross it,
 * so the picture is darkened enough to hold the words and no more: the plant,
 * the desk and his face all survive.
 *
 * `data-tone="dark"` tells the header to go white here.
 */
export function Opening() {
  return (
    <section
      data-tone="dark"
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-void px-5 py-28 text-center"
    >
      <Image
        src="/photo/hero.webp"
        alt={`${site.name}, ${site.role}`}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_32%]"
      />

      {/* Denser at the top and bottom, where the header and the button sit. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/75"
      />

      {/*
        The headline is deliberately smaller than the display-1 used elsewhere.
        At thirteen viewport widths it filled the screen on its own and pushed
        the button below the fold — which defeats the point of a first screen
        whose whole job is to get the button pressed.
      */}
      <div className="relative flex w-full max-w-4xl flex-col items-center">
        <p className="text-[0.6875rem] tracking-[0.18em] text-paper/70 uppercase">
          {site.name} · {site.role}
        </p>

        <h1 className="mt-7 text-[clamp(2rem,6.4vw,5rem)] leading-[0.92] font-extrabold tracking-[-0.04em] text-paper uppercase">
          {site.shortStatement}
        </h1>

        <p className="mt-7 max-w-lg text-sm leading-relaxed text-paper/75 md:text-base">
          {site.difference}
        </p>

        <CTA href="/start" tone="dark" size="lg" className="mt-10">
          {site.heroCta}
        </CTA>

        <p className="mt-5 text-xs text-paper/55">
          Отвечаю {site.responseTime.toLowerCase()}. Ни к чему не обязывает.
        </p>
      </div>

      <p className="absolute inset-x-0 bottom-8 text-center text-[0.6875rem] tracking-[0.18em] text-paper/35 uppercase">
        Душанбе · UTC+5
      </p>
    </section>
  );
}

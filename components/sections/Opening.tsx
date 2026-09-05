import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/content/site';

/*
 * The opening.
 *
 * A hard split: black on the left carrying type at the scale of a poster, the
 * photograph on the right, untouched. The boldness comes from the ratio — three
 * lines of 800-weight caps filling half a viewport — not from putting words on
 * top of a face.
 *
 * An earlier version overlapped the two and inverted the type with
 * `mix-blend-mode: difference`. It was struck out for two reasons worth
 * recording: difference against a colour photograph shifts hue rather than
 * inverting cleanly, so the letters came out cyan and read as a rendering bug;
 * and the words covered the one thing the photograph is there to show. A scrim
 * would have fixed legibility and dulled the picture instead.
 */
export function Opening() {
  // "Цифровые продукты, с характером" — his own line, set as two blocks.
  const [head, tail] = site.shortStatement.split(', ');

  return (
    <section
      data-opening
      className="relative flex min-h-[100svh] flex-col bg-void md:flex-row"
    >
      {/* Photograph. Top on narrow screens, right half on wide ones, never
          cropped so tightly that his hands and the laptop leave the frame. */}
      <div className="relative h-[42svh] w-full shrink-0 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[52%]">
        <Image
          src="/photo/hero.webp"
          alt={`${site.name}, ${site.role}`}
          fill
          priority
          sizes="(min-width: 768px) 52vw, 100vw"
          className="object-cover object-[58%_34%]"
        />

        {/*
          A scrim the exact height of the header, and no taller.
          The wall behind him is light where the navigation crosses it, so white
          links disappeared into it. Darkening the whole photograph to fix that
          would have cost the picture its light; darkening only the strip the
          chrome occupies costs nothing anyone looks at.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent md:h-32"
        />
      </div>

      <div className="shell relative flex flex-1 flex-col justify-between py-10 md:w-[48%] md:py-32">
        <p className="mt-auto mb-8 text-[0.6875rem] tracking-[0.18em] text-paper/45 uppercase md:mt-0">
          {site.name} · {site.role}
        </p>

        {/*
          The lines run past the black panel and onto the photograph. That
          overlap is the point — it is what stops the two halves reading as two
          boxes — but it costs the second line its tint: over his hair and shirt
          only solid white survives, and a 45% white would go muddy exactly
          where the letters cross the face.
        */}
        <h1 className="relative z-10 text-[clamp(2.5rem,7.2vw,6.5rem)] leading-[0.86] font-extrabold tracking-[-0.045em] text-paper uppercase">
          <span className="block">{head}</span>
          {tail && <span className="block">{tail}</span>}
        </h1>

        <div className="mt-auto pt-12">
          <p className="max-w-md text-sm leading-relaxed text-paper/55 md:text-base">
            {site.difference}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
            <Link href="/start" className="group inline-flex items-center gap-4 text-paper">
              <span className="text-[0.6875rem] tracking-[0.18em] uppercase">{site.heroCta}</span>
              <span
                aria-hidden
                className="block h-px w-12 bg-paper transition-[width] duration-300 ease-[var(--ease-studio)] group-hover:w-20"
              />
            </Link>
            {/* Kept inside the black column: on the photograph it disappeared. */}
            <p className="text-[0.6875rem] tracking-[0.18em] text-paper/35 uppercase">
              Душанбе · UTC+5
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

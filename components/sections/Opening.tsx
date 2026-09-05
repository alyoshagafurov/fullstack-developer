import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: him on one side, the words on the other, nothing on top of
 * anything.
 *
 * Three earlier versions put type over the photograph — centred on his face,
 * split around his head, and set heavy across his chest. Every one of them
 * traded legibility for drama and lost: the statement is black, his shirt is
 * black, and the second line disappeared into it. A scrim strong enough to fix
 * that flattened the picture.
 *
 * So the two are separated. He gets a full-bleed half where nothing covers him;
 * the words get a quiet half with room to breathe. Both are legible without a
 * single compromise, and the composition is calm rather than busy — which is
 * what the owner asked for after seeing the loud ones.
 *
 * `data-tone="light"` tells the header to go black here.
 */
export function Opening() {
  // "Цифровые продукты, с характером" — split so the second half can take a
  // lighter weight and the line reads as one sentence rather than two shouts.
  const [head, tail] = site.shortStatement.split(', ');

  return (
    <section
      data-tone="light"
      className="relative flex min-h-[100svh] w-full flex-col bg-ground lg:flex-row"
    >
      {/* The photograph. Below the words on a phone, beside them on a desk. */}
      <div className="relative order-1 h-[42svh] w-full shrink-0 lg:order-2 lg:h-auto lg:w-[52%]">
        <Image
          src="/photo/hero.webp"
          alt={`${site.name}, ${site.role}`}
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover object-[62%_32%]"
        />
      </div>

      {/* The words. Nothing crosses the picture, so nothing needs a scrim. */}
      <div className="order-2 flex flex-1 flex-col justify-center px-5 py-16 md:px-10 lg:order-1 lg:py-24 lg:pr-16 lg:pl-[max(2.5rem,calc((100vw-1440px)/2+4rem))]">
        <p className="flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink-2 uppercase">
          <span aria-hidden className="block h-px w-10 bg-ink-3" />
          {site.role}
        </p>

        <h1 className="mt-10 text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[0.95] tracking-[-0.04em] uppercase">
          <span className="block font-extrabold">{head},</span>
          {tail && <span className="block font-light">{tail}</span>}
        </h1>

        <p className="mt-10 max-w-md text-base leading-relaxed text-ink-2">{site.difference}</p>

        <CTA href="/start" size="lg" className="mt-12 self-start">
          {site.heroCta}
        </CTA>

        <p className="mt-16 flex items-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink-3 uppercase">
          {site.name}
          <span aria-hidden className="block h-px w-10 bg-ink-3" />
          Душанбе · UTC+5
        </p>
      </div>
    </section>
  );
}

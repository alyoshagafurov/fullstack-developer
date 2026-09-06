import Image from 'next/image';
import Link from 'next/link';
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
 * desk screen, half on a phone — and the section around it continues the two
 * planes the picture is made of: the white wall above the desk line, the grey
 * desk below it. The photograph's top and right edges are feathered into those
 * planes so there is no rectangle, just a room that carries on past the frame.
 * On a desk screen it sits flush left, so the plant stays in.
 *
 * Desk screen: the words are laid over the wall — paragraph top left,
 * statement top right ranged right so it never reaches his head, the button
 * on the desk, centred. Phone: the section is a column instead — label,
 * statement, paragraph and button centred at the top, the photograph pushed
 * to the bottom underneath them. In flow, not layered, so a short phone grows
 * the section rather than dropping the button onto his face.
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
      data-hero-root
      /* `--ph` is the photograph's height; everything else is derived from it. */
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden [--ph:min(50svh,150vw)] md:block md:h-[100svh] md:[--ph:min(90svh,56vw)]"
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

      {/* The words. Above the photograph in paint order on a desk screen. */}
      <div className="relative px-5 pt-24 pb-4 md:absolute md:inset-0 md:z-10 md:pt-32 md:pb-0 md:px-10">
        <div className="mx-auto w-full max-w-[1440px] md:flex md:flex-row-reverse md:items-start md:justify-between md:gap-16">
          <div className="min-w-0 text-center md:w-1/2 md:text-right">
            <p
              data-hero="eyebrow"
              className="flex items-center justify-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink uppercase md:flex-row-reverse md:justify-start"
            >
              {/* The rule is a desk-screen device: centred type has no edge for it to hang off. */}
              <span aria-hidden className="hidden h-px w-10 bg-ink/50 md:block" />
              {site.role}
            </p>

            <h1 className="mt-3 text-[min(11.5vw,2.75rem)] leading-[0.95] tracking-[-0.045em] text-ink uppercase md:mt-4 md:text-[clamp(2.25rem,4.4vw,5.25rem)]">
              {lines.map((line, index) => (
                <span
                  key={line}
                  data-hero="line"
                  className={`block ${index === lines.length - 1 ? 'font-light' : 'font-extrabold'}`}
                >
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <p
            data-hero="lede"
            className="mx-auto mt-6 max-w-sm text-center text-base leading-relaxed text-ink md:mx-0 md:mt-1 md:text-left md:text-[0.9375rem]"
          >
            {site.difference}
          </p>
        </div>

        {/* The button: under the words on a phone, on the desk on a desk screen.
            Ink on both — the owner's call — and the desk is grey, not black,
            so it still stands off it. */}
        <div
          data-hero-cta
          className="mt-8 flex flex-col items-center gap-4 md:absolute md:inset-x-0 md:bottom-[calc(var(--ph)*0.0705+20px)] md:mt-0 md:flex-row md:justify-center md:gap-5 md:translate-y-1/2"
        >
          {/*
            On a phone the button sits on the light wall, where ink is the only
            legible fill. On a wide screen it stands on the grey desk, and there
            paper carries far better than the black the owner chose for the
            phone — so the fill flips with the ground under it.
          */}
          <CTA
            href="/start"
            size="lg"
            className="md:bg-paper md:text-void md:hover:bg-paper/85"
          >
            {site.heroCta}
          </CTA>
          {/* Quieter than the brief: ink on the wall, paper on the desk. */}
          <Link
            href="/work"
            className="inline-flex min-h-14 items-center gap-3 rounded-full border border-ink px-7 text-[0.875rem] font-medium text-ink transition-colors hover:bg-ink hover:text-paper md:border-paper/70 md:text-paper md:hover:bg-paper md:hover:text-ink"
          >
            Посмотреть кейсы
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/*
       * The photograph, whole, at its own framing. Flush left on a desk screen,
       * where it is narrower than the window; on a phone it is wider than the
       * screen and shifted so that he, not the frame's centre, is centred, and
       * pushed to the bottom of the column.
       */}
      {/* `self-start`: a column flex item is stretched to the column's width
          otherwise, which overrides the aspect ratio and crops the frame. */}
      <div
        data-hero="photo"
        className="relative left-1/2 mt-auto aspect-[1672/941] h-[var(--ph)] shrink-0 self-start -translate-x-[62%] md:absolute md:bottom-0 md:left-0 md:mt-0 md:translate-x-0"
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
    </section>
  );
}

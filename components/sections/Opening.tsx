import Image from 'next/image';
import Link from 'next/link';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

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
export async function Opening() {
  const { lang, t } = await getDictionary();
  /* Three lines — who he is in one plain sentence: "I build / websites / for business". */
  const lines = t.hero.lines;

  return (
    <section
      data-tone="light"
      data-hero-root
      /* `--ph` is the photograph's height; everything else is derived from it. */
      className="relative h-[100svh] w-full overflow-hidden [--ph:min(50svh,150vw)] md:[--ph:min(90svh,56vw)]"
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

      {/* The words, laid over the photograph rather than stacked above it.
          They used to sit in the flow with the picture pushed under them, and
          on a phone the two together came to more than one screen: the section
          grew, and he ended up below the fold on the one screen that has to
          show him. Now the section is exactly one screen and the type sits on
          the wall, which is the part of the photograph above his head. */}
      <div className="absolute inset-0 z-10 px-5 pt-20 md:pt-28 md:px-10">
        {/* Desk screen: label and statement on the left, the paragraph under them.
            On a wide screen the paragraph moves to the empty wall on the right,
            level with the statement's last line — on the left it sat on the leaves. */}
        <div className="mx-auto w-full max-w-[1440px] md:flex md:items-start md:justify-between md:gap-12">
          <div className="min-w-0 text-center md:max-w-[46rem] md:text-left">
            <p
              data-hero="eyebrow"
              className="flex items-center justify-center gap-4 text-[0.6875rem] tracking-[0.22em] text-ink uppercase md:flex-row-reverse md:justify-end"
            >
              {/* The rule is a desk-screen device: centred type has no edge for it to hang off. */}
              <span aria-hidden className="hidden h-px w-10 bg-ink/50 md:block" />
              {t.hero.eyebrow}
            </p>

            {/* Three caps in the size: the screen's width, the screen's
                height, and a ceiling. A short phone is the one that used to
                push him off the bottom, so height gets a vote. */}
            <h1 className="mt-3 text-[min(10vw,4.8svh,2.75rem)] leading-[0.95] tracking-[-0.045em] text-ink uppercase md:mt-4 md:text-[clamp(2.25rem,3.9vw,4.75rem)]">
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
            className="mx-auto mt-4 max-w-sm text-center text-[0.9375rem] leading-relaxed text-ink md:mx-0 md:mt-10 md:max-w-[19rem] md:shrink-0 md:text-left md:text-base lg:max-w-sm xl:text-[1.0625rem]"
          >
            {t.hero.lede}
          </p>
        </div>

        {/*
          One button now: the work. The request button used to stand beside
          it; it floats at the bottom of every page instead (see
          components/chrome/StickyCta.tsx), so a second copy here would put
          the same button on the first screen twice. Under the words on a
          phone, on the desk on a desk screen — quiet on both, so the floating
          request button stays the loudest thing on the screen.
        */}
        <div
          data-hero-cta
          className="mt-6 flex flex-wrap items-center justify-center gap-3 md:absolute md:inset-x-0 md:bottom-[calc(var(--ph)*0.0705+20px)] md:mt-0 md:translate-y-1/2"
        >
          {/* The request button's twin: while it is on screen the floating one
              stays down; scroll it away and the floating one rises. */}
          <Link
            href={localePath(lang, '/start')}
            data-cta-twin=""
            className="inline-flex min-h-12 min-w-44 items-center justify-center gap-3 rounded-full border border-ink bg-ink px-7 text-[0.875rem] font-medium text-paper transition-colors hover:bg-ink-2 md:min-h-14 md:min-w-52 md:border-paper md:bg-paper md:text-ink md:hover:bg-paper/85"
          >
            {t.common.getQuote}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={localePath(lang, '/work')}
            className="inline-flex min-h-12 min-w-44 items-center justify-center gap-3 rounded-full border border-ink bg-paper/85 px-7 text-[0.875rem] font-medium text-ink transition-colors hover:bg-ink hover:text-paper md:min-h-14 md:min-w-52 md:border-paper/70 md:bg-transparent md:text-paper md:hover:bg-paper md:hover:text-ink"
          >
            {t.common.seeWork}
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
      <div
        data-hero="photo"
        className="absolute bottom-0 left-1/2 aspect-[1672/941] h-[var(--ph)] -translate-x-[62%] md:left-0 md:translate-x-0"
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
          alt={t.hero.photoAlt}
          fill
          priority
          sizes="(min-width: 768px) 100vw, 220vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}

import { CTA } from '@/components/ui/CTA';
import { Sculpture } from '@/components/three/Sculpture';
import { site } from '@/lib/content/site';

/*
 * How every page other than the home page begins.
 *
 * The owner asked for the inner pages to greet a visitor the way the closing
 * band of the landing page does: black, centred, one enormous line, one button.
 * Repeating that shape is what makes the site feel like one publication rather
 * than a set of screens that happen to share a header.
 *
 * `data-tone="dark"` is what the header reads to know it must go white here.
 */
export function PageOpening({
  eyebrow,
  title,
  lede,
  cta = true,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  cta?: boolean;
}) {
  return (
    <section
      data-tone="dark"
      className="flex min-h-[78svh] w-full flex-col items-center justify-center bg-void px-5 py-32 text-center text-paper"
    >
      {/* The stone, the size of a mark, where a masthead would carry one. */}
      <div data-intro className="mb-8 size-20 md:size-24">
        <Sculpture className="size-full" />
      </div>

      <p data-intro className="text-[0.6875rem] tracking-[0.18em] text-paper/55 uppercase">
        {eyebrow}
      </p>

      <h1 data-intro className="display-1 mt-10 max-w-6xl uppercase">
        {title}
      </h1>

      {lede && (
        <p data-intro className="lede mt-10 max-w-xl text-paper/55">
          {lede}
        </p>
      )}

      {cta && (
        <div data-intro className="mt-14">
          <CTA href="/start" tone="dark" size="lg">
            {site.heroCta}
          </CTA>
        </div>
      )}
    </section>
  );
}

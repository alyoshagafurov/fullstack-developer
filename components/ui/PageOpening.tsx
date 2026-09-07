import { CTA } from '@/components/ui/CTA';
import { Stage, type Fact } from '@/components/three/Stage';
import { about } from '@/lib/content/about';
import { site } from '@/lib/content/site';

/* What stands beside the form when a page does not name its own facts. */
const defaultLeft: Fact[] = site.stats.map((stat) => ({
  label: stat.label,
  value: stat.value,
}));
const defaultRight: Fact[] = about.facts.slice(0, 3);

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
  ctaHref = '/start',
  ctaLabel = site.heroCta,
  stage = true,
  facts,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  cta?: boolean;
  /** The reviews page asks for a review here, not for a brief. */
  ctaHref?: string;
  ctaLabel?: string;
  /** The two form pages set this false: nothing belongs between them and their form. */
  stage?: boolean;
  facts?: { left?: Fact[]; right?: Fact[] };
}) {
  return (
    <>
    <section
      data-tone="dark"
      className="flex min-h-[78svh] w-full flex-col items-center justify-center bg-void px-5 py-32 text-center text-paper"
    >

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
          <CTA href={ctaHref} tone="dark" size="lg">
            {ctaLabel}
          </CTA>
        </div>
      )}
      </section>

      {/* One screen of black under the opening, where the form assembles. */}
      {stage && <Stage left={facts?.left ?? defaultLeft} right={facts?.right ?? defaultRight} />}
    </>
  );
}

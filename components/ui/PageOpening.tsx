import { CTA } from '@/components/ui/CTA';
import { Stage, type Fact } from '@/components/three/Stage';
import { getDictionary } from '@/lib/i18n/server';

/*
 * How every page other than the home page begins: black, centred, one
 * enormous line.
 *
 * It used to carry the request button too. The floating request button now
 * rises at the bottom of every page the moment it loads, so a second one here
 * would put two identical buttons on the first screen. A page that asks for
 * something else — the reviews page asks for a review — still passes its own.
 *
 * `data-tone="dark"` is what the header reads to know it must go white here.
 */
export async function PageOpening({
  eyebrow,
  title,
  lede,
  cta,
  stage = true,
  facts,
  video,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** A button for a different action than the request — e.g. "Leave a review". */
  cta?: { href: string; label: string };
  /** The form pages set this false: nothing belongs between them and their form. */
  stage?: boolean;
  facts?: { left?: readonly Fact[]; right?: readonly Fact[] };
  /** Footage behind the title, on the pages that are about the work itself. */
  video?: { src: string; poster: string };
}) {
  const { t } = await getDictionary();
  const left = facts?.left ?? t.manifesto.stats;
  const right = facts?.right ?? t.about.facts.slice(0, 3);

  return (
    <>
      <section
        data-tone="dark"
        className="relative isolate flex min-h-[78svh] w-full flex-col items-center justify-center overflow-hidden bg-void px-5 py-32 text-center text-paper"
      >
        {video && (
          <>
            <video
              data-video
              src={video.src}
              poster={video.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              className="absolute inset-0 -z-10 size-full object-cover opacity-25"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-void/55" />
          </>
        )}

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
            <CTA href={cta.href} tone="dark" size="lg">
              {cta.label}
            </CTA>
          </div>
        )}
      </section>

      {/* One screen of black under the opening, where the form assembles. */}
      {stage && <Stage left={left} right={right} />}
    </>
  );
}

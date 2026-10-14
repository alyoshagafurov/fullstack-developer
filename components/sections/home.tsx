import Image from 'next/image';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';
import { fill, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The bands of the landing page.
 *
 * They live in one module because they are views of the same content and none
 * is reused elsewhere. What matters more than the split is the sequence: every
 * band changes both the ground colour and the type scale, so scrolling feels
 * like turning pages rather than sliding down a template.
 *
 * The words come from lib/i18n — the plain-language copy the owner asked for,
 * in English and Russian.
 */

/**
 * A line that runs. Two identical halves, so the loop has no visible seam.
 * Decorative only: it repeats what the page already says, and reduced motion
 * stops it.
 */
export async function Marquee() {
  const { t } = await getDictionary();
  const words = t.marquee;
  const strip = [...words, ...words, ...words];

  return (
    <div className="overflow-hidden border-y border-white/10 bg-void py-5 select-none">
      <div className="marquee" aria-hidden>
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {strip.map((word, index) => (
              <span
                key={`${half}-${index}`}
                className="flex items-center px-6 text-[0.75rem] tracking-[0.2em] whitespace-nowrap text-paper uppercase"
              >
                {word}
                <span className="ml-6 block size-1 rounded-full bg-paper/40" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only">{words.join('. ')}.</p>
    </div>
  );
}

/**
 * What he does, in one plain paragraph, then the three real numbers — set
 * larger than the sentence, because they are the part a visitor checks.
 */
export async function Manifesto() {
  const { t } = await getDictionary();
  return (
    <Band tone="paper" innerClassName="py-28 md:py-40">
      <p data-reveal className="label mb-12">
        {t.manifesto.label}
      </p>
      <p data-reveal className="display-3 max-w-5xl">
        {t.manifesto.statement}
      </p>

      <div
        data-reveal="group"
        className="mt-24 grid gap-x-10 gap-y-14 border-t border-line pt-14 md:grid-cols-3"
      >
        {t.manifesto.stats.map((stat) => (
          <div key={stat.label}>
            <p data-count className="display-2 tabular">
              {stat.value}
            </p>
            <p className="mt-4 text-sm text-ink-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}

/**
 * Who he is, on the landing page — strictly the working half. The rest of his
 * story belongs on /about, where a visitor has already decided to look.
 */
export async function AboutSpread() {
  const { lang, t } = await getDictionary();
  return (
    <Band tone="paper" id="studio" innerClassName="py-24 md:py-32">
      <div className="grid gap-14 md:grid-cols-2 md:items-start md:gap-20">
        <div data-reveal="group" className="md:order-1">
          <p className="label mb-8">{t.about.label}</p>
          <p className="display-2 uppercase">{t.person.name}</p>
          <p className="lede mt-8">{t.about.difference}</p>
          <p className="mt-6 text-base leading-relaxed text-ink-2">{t.about.why[1]}</p>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8">
            {t.about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="label mb-3">{fact.label}</dt>
                <dd className="text-sm leading-snug">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <CTA href={localePath(lang, '/about')} className="mt-12">
            {t.about.more}
          </CTA>
        </div>

        <div
          data-reveal="image"
          className="group relative aspect-3/2 w-full overflow-hidden bg-ground md:order-2 md:aspect-4/5"
        >
          <Image
            src="/photo/about.webp"
            alt={t.person.photoAlt}
            fill
            sizes="(min-width: 768px) 46vw, 92vw"
            className="object-cover object-[55%_35%] transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.04]"
          />
        </div>
      </div>
    </Band>
  );
}

/*
 * Where each stage stands in the frame. Moved around the frame, each arrival
 * is somewhere new and the reader keeps looking.
 */
const PLACES = [
  'items-start text-left',
  'items-end text-right',
  'items-center text-center',
  'items-start text-left md:pl-[14%]',
  'items-end text-right md:pr-[12%]',
  'items-center text-center',
];

/* How much of the total time each of the six stages takes, from his durations. */
const WEIGHTS = [2, 2, 10, 28, 5, 1];

/**
 * How the work goes, read one stage at a time over him actually working. The
 * band pins and holds the screen while the six stages pass through the frame.
 */
export async function ProcessTrack() {
  const { t } = await getDictionary();
  const total = WEIGHTS.reduce((sum, weight) => sum + weight, 0);

  return (
    <>
      <section data-reel data-tone="dark" id="process" className="relative w-full bg-void text-paper">
        <div
          data-reel-stage
          className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
        >
          {/* His own room, behind the words. Decorative: the stages say it all. */}
          <video
            data-video
            src="/gallery/room.mp4"
            poster="/gallery/room-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-70"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/35 to-void/80"
          />

          <div className="shell relative w-full py-16 md:py-20">
            <h2 className="display-3 uppercase [text-shadow:0_2px_28px_rgb(5_5_5_/_0.6)]">
              {t.process.title}
            </h2>

            <div className="relative mt-10 h-[48svh] md:mt-14">
              <ol>
                {t.process.stages.map((stage, index) => (
                  <li
                    key={stage.title}
                    data-reel-slide
                    className={`flex size-full flex-col justify-center ${PLACES[index % PLACES.length]}`}
                  >
                    <div className="max-w-2xl">
                      <p className="tabular text-[clamp(3rem,9vw,7rem)] leading-[0.85] font-extrabold tracking-[-0.05em] text-paper/35">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-5 text-[clamp(1.5rem,3.6vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em] [text-shadow:0_1px_24px_rgb(5_5_5_/_0.55)]">
                        {stage.title}
                      </h3>
                      <p className="mt-3 text-sm tracking-[0.06em] text-paper/70">{stage.duration}</p>
                      <p className="mt-6 text-[clamp(0.9375rem,1.5vw,1.125rem)] leading-relaxed text-paper/85 [text-shadow:0_1px_18px_rgb(5_5_5_/_0.6)]">
                        {stage.body}
                      </p>
                      <p className="sr-only">
                        {fill(t.process.share, { n: Math.round(((WEIGHTS[index] ?? 0) / total) * 100) })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <Band tone="shelf" innerClassName="py-20 md:py-28">
        <dl data-reveal="group" className="grid gap-10 md:grid-cols-3">
          {t.process.terms.map((term) => (
            <div key={term.label}>
              <dt className="label mb-3">{term.label}</dt>
              <dd className="text-sm leading-relaxed text-ink-2">{term.value}</dd>
            </div>
          ))}
        </dl>
      </Band>
    </>
  );
}

/** The closing. One sentence, centred, the size of a poster. */
export async function StartBand() {
  const { lang, t } = await getDictionary();
  const { contact } = site;

  return (
    <Band tone="void" id="start" innerClassName="py-28 text-center md:py-44">
      <p data-reveal className="text-[0.6875rem] tracking-[0.18em] text-paper/55 uppercase">
        {t.closing.label}
      </p>

      <p data-reveal className="display-1 mx-auto mt-12 max-w-6xl leading-[0.94] text-paper uppercase">
        {t.closing.invite}
      </p>

      <div data-reveal="group" className="mt-14 flex flex-col items-center">
        <CTA href={localePath(lang, '/start')} tone="dark" size="lg">
          {t.common.getQuote}
        </CTA>
        <p className="mt-5 text-xs text-paper/60">{t.closing.hint}</p>
      </div>

      <dl
        data-reveal="group"
        className="mx-auto mt-24 grid max-w-3xl gap-10 border-t border-white/12 pt-10 text-sm sm:grid-cols-3"
      >
        <div>
          <dt className="label mb-3 text-paper/55">{t.closing.reply}</dt>
          <dd className="text-paper/70">{t.common.responseTime}</dd>
        </div>
        <div>
          <dt className="label mb-3 text-paper/55">{t.closing.email}</dt>
          <dd>
            <a href={`mailto:${contact.email}`} className="text-paper transition-opacity hover:opacity-60">
              {contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="label mb-3 text-paper/55">{t.closing.telegram}</dt>
          <dd>
            <a
              href={`https://t.me/${contact.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper transition-opacity hover:opacity-60"
            >
              @{contact.telegram}
            </a>
          </dd>
        </div>
      </dl>
    </Band>
  );
}

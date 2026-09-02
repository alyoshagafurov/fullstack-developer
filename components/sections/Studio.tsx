'use client';

import Image from 'next/image';

import Reveal from '@/components/ui/Reveal';
import Shell from '@/components/ui/Shell';
import { useI18n } from '@/lib/i18n';

/*
 * About — the light spread.
 *
 * The one section on the page that is not dark, and that is the whole idea.
 * The reference works by dropping a bright editorial block into an otherwise
 * dark composition: a heavy sans headline with a single word in italic serif,
 * a photograph in a soft-cornered panel beside it, and one small card floating
 * over the image.
 *
 * The colours are written literally rather than pulled from the palette
 * tokens, because every token in this project names a value on the dark
 * canvas. Inverting them here would mean adding a parallel light scale for a
 * single section, and the section would still have to state what it is.
 *
 * The photograph is used exactly as shot — no filter, no recolour, no scrim.
 * It is already a bright, quiet frame, which is why it can carry this block.
 */

const CREAM = '#efece7';
const INK = '#14110f';
const INK_SOFT = 'rgba(20,17,15,0.62)';
const HAIRLINE = 'rgba(20,17,15,0.12)';

export default function Studio() {
  const { t } = useI18n();
  const a = t.about;

  // The headline's last word is set in italic serif, the way the reference
  // emphasises one word rather than a phrase. If the dictionary ever returns a
  // single-word title this still holds: `head` is empty and `tail` carries it.
  const words = a.title.trim().split(/\s+/);
  const tail = words[words.length - 1];
  const head = words.slice(0, -1).join(' ');

  return (
    <section id="studio" className="relative beat overflow-x-clip">
      <Shell>
        <Reveal>
          <div
            className="rounded-panel px-6 py-10 md:px-12 md:py-14"
            style={{ background: CREAM, color: INK }}
          >
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* ── The words ────────────────────────────────────────── */}
              <div className="lg:col-span-6">
                <span
                  className="inline-flex items-center rounded-pill px-3 py-1.5 text-[10px]
                             font-medium uppercase tracking-[0.18em]"
                  style={{ border: `1px solid ${HAIRLINE}`, color: INK_SOFT }}
                >
                  {a.eyebrow}
                </span>

                <h2
                  className="mt-6 text-[clamp(1.9rem,1.2rem+2.6vw,3.25rem)] font-semibold
                             leading-[1.06] tracking-[-0.03em]"
                >
                  {head}{' '}
                  {/* `font-display` rather than the `.display` class: the
                      monochrome pivot repointed that class at the grotesk, but
                      Playfair is still loaded and Tailwind still maps to it.
                      The reference emphasises its one word in a serif italic,
                      and that is the whole effect. */}
                  <span className="font-display font-normal italic">{tail}</span>
                </h2>

                <div className="mt-6 max-w-[46ch] space-y-4">
                  <p className="m-0 text-[15px] leading-[1.7]" style={{ color: INK_SOFT }}>
                    {a.p1}
                  </p>
                  <p className="m-0 text-[15px] leading-[1.7]" style={{ color: INK_SOFT }}>
                    {a.p2}
                  </p>
                </div>

                {/* The ledger, as pills. Small, factual, and the only place in
                    this block where the type goes quiet. */}
                <dl className="mt-8 flex flex-wrap gap-2">
                  {a.facts.map((fact) => (
                    <div
                      key={fact.k}
                      className="inline-flex items-baseline gap-2 rounded-pill px-3.5 py-2"
                      style={{ border: `1px solid ${HAIRLINE}` }}
                    >
                      <dt
                        className="text-[10px] font-medium uppercase tracking-[0.16em]"
                        style={{ color: INK_SOFT }}
                      >
                        {fact.k}
                      </dt>
                      <dd className="m-0 text-[13px] font-medium">{fact.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ── The photograph ───────────────────────────────────── */}
              <div className="relative lg:col-span-6">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-panel">
                  <Image
                    src="/about-portrait.jpg"
                    alt="Алишер Гафуров за работой"
                    fill
                    quality={90}
                    sizes="(max-width:1024px) 100vw, 46vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* The floating card. One fact, lifted off the photograph —
                    the reference's "Calories" chip, doing the same job. */}
                <div
                  className="absolute bottom-4 left-4 right-4 rounded-[18px] px-4 py-3
                             backdrop-blur-md sm:right-auto sm:min-w-[220px]"
                  style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${HAIRLINE}` }}
                >
                  <span
                    className="block text-[10px] font-medium uppercase tracking-[0.18em]"
                    style={{ color: INK_SOFT }}
                  >
                    {a.eyebrow}
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold">
                    Dushanbe · Tajikistan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

'use client';

import Image from 'next/image';
import Shell from '@/components/ui/Shell';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/lib/i18n';

/*
 * 04 — Process.
 *
 * Compositional idea: A LADDER ON A SPINE.
 *
 * A single hairline runs down the middle of the block and the steps alternate
 * across it — odd steps hard against the left edge, even steps hard against
 * the right. Nothing is aligned to a shared column, so the eye zig-zags down
 * the page instead of scanning a list. That alternation is the section's whole
 * identity and appears nowhere else on the site.
 *
 * The step title is set in the serif and the number is demoted to a small tick
 * on the spine — the inverse of Capabilities, which sits directly above it.
 *
 * workspace-detail.jpg closes the ladder at its native size: it is a 735px
 * source, so it is used as a small object, never stretched.
 */
export default function Method() {
  const { t } = useI18n();

  return (
    <section id="process" className="relative beat bg-base-deep overflow-x-clip">
      <Shell>
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-[16px] mb-[64px] md:mb-[128px]">
          <span className="label">04 — {t.process.eyebrow}</span>
          <span className="hidden sm:block max-w-[42ch] text-right text-[13px] leading-[1.6] text-ink-2">
            {t.process.sub}
          </span>
        </div>

        <h2 className="sr-only">{t.process.title}</h2>
        <div className="relative">
          {/* the spine */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-[7px] md:left-1/2 w-px bg-line md:-translate-x-1/2"
          />

          <ol>
            {t.process.steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <Reveal as="li" key={s.n} delay={i % 3} className="group relative">
                  <div
                    className={`relative py-[24px] md:py-[48px] pl-[40px] md:pl-0 md:w-1/2 ${
                      left ? 'md:pr-[64px] md:text-right' : 'md:ml-auto md:pl-[64px]'
                    }`}
                  >
                    {/* tick on the spine */}
                    <span
                      aria-hidden
                      className={`absolute top-[34px] md:top-[58px] w-[7px] h-[7px] rounded-full bg-surface
                                  transition-colors duration-200 group-hover:bg-signal
                                  left-[4px] ${left ? 'md:left-auto md:-right-[3.5px]' : 'md:-left-[3.5px]'}`}
                    />
                    <span className="label text-[11px] block mb-[12px]">{s.n}</span>
                    <h3 className="display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.05] text-ink mb-[12px]">
                      {s.t}
                    </h3>
                    <p
                      className={`text-[14px] leading-[1.65] text-ink-2 max-w-[38ch] ${
                        left ? 'md:ml-auto' : ''
                      }`}
                    >
                      {s.d}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ol>

          {/* the ladder ends on a real object, used at a size its source supports */}
          <Reveal className="relative mt-[48px] md:mt-[64px] flex md:justify-center">
            <figure className="w-[200px] md:w-[280px]">
              <div className="relative aspect-[735/494] overflow-hidden">
                <Image
                  src="/workspace-detail.jpg"
                  alt="Рабочий стол поздним вечером"
                  fill
                  quality={86}
                  sizes="280px"
                  className="object-cover"
                />
              </div>
              <figcaption className="label text-[11px] mt-[12px]">Dushanbe · 23:11</figcaption>
            </figure>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

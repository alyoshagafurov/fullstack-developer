import Image from 'next/image';
import { CTA } from '@/components/ui/CTA';
import { site } from '@/lib/content/site';

/*
 * The opening: the words are behind him, split left and right.
 *
 * The ground is light rather than black, and that is not a style preference.
 * The cut-out is a man in a black t-shirt with dark hair, a black mug and a
 * dark desk; on a black band all of that disappears and only his face and
 * forearms survive. On the warm off-white he reads whole, and the type reads as
 * ink rather than needing a scrim to hold it.
 *
 * The two words sit at head height, where his silhouette is narrowest, so each
 * one keeps most of its length visible. Lower down his shoulders would swallow
 * them.
 */
export function Opening() {
  return (
    <section
      data-tone="light"
      className="relative flex h-[100svh] flex-col overflow-hidden bg-ground"
    >
      <div className="relative flex-1">
        {/* The type layer. Behind the photograph, in front of the ground. */}
        <div
          aria-hidden
          className="shell absolute inset-x-0 top-[14%] z-0 flex items-start justify-between gap-4 md:top-[16%]"
        >
          <span className="text-[clamp(1.75rem,7.6vw,7rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-ink uppercase">
            Цифровые
          </span>
          <span className="text-[clamp(1.75rem,7.6vw,7rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-ink uppercase">
            продукты,
          </span>
        </div>

        {/* The real heading, for anything that reads rather than looks. */}
        <h1 className="sr-only">
          {site.shortStatement}. {site.name}, {site.role}.
        </h1>

        <Image
          src="/photo/hero-cut.webp"
          alt={`${site.name}, ${site.role}`}
          width={1800}
          height={1014}
          priority
          sizes="(min-width: 768px) 78vw, 118vw"
          className="absolute bottom-0 left-1/2 z-10 w-[118vw] max-w-none -translate-x-1/2 md:w-[78vw] md:max-w-[1120px]"
        />
      </div>

      <div className="shell relative z-20 shrink-0 pb-8 text-center md:pb-10">
        <p className="text-[clamp(1.5rem,4.6vw,3.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase">
          С характером
        </p>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ink-2 md:text-base">
          {site.difference}
        </p>

        <CTA href="/start" size="lg" className="mt-8">
          {site.heroCta}
        </CTA>
      </div>
    </section>
  );
}

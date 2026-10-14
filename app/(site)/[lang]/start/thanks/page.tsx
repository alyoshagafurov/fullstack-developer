import type { Metadata } from 'next';
import { Band } from '@/components/ui/Band';
import { CTA } from '@/components/ui/CTA';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.thanks.metaTitle,
    robots: { index: false, follow: false },
  };
}

/*
 * After the request: one large sentence saying he is on it, and two ways to
 * keep looking while they wait — the prices and the work.
 *
 * The request number and the bot code stay, set small underneath: the code is
 * shown only once, and it is what lets the client ask the bot how it is going.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; code?: string }>;
}) {
  const { lang, t } = await getDictionary();
  const done = t.brief.done;
  const { ref, code } = await searchParams;
  const refValid = ref && /^ALY-[\d-]+$/.test(ref) ? ref : null;
  const codeValid = code && /^[a-f0-9]{32}$/.test(code) ? code : null;
  const bot = `https://t.me/${site.contact.bot}?start=status`;

  return (
    <Band tone="ground" innerClassName="flex min-h-[100svh] flex-col justify-center py-28 md:py-32">
      <div className="grid items-center gap-14 md:grid-cols-[1fr_16rem] md:gap-20">
        <div data-reveal="group">
          <h1 className="max-w-3xl text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.02] font-bold tracking-[-0.045em] text-balance">
            {done.title}
          </h1>
          <p className="mt-8 max-w-xl text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-ink-2">
            {done.message}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <CTA href={localePath(lang, '/prices')} size="lg">
              {done.prices}
            </CTA>
            <PillLink href={localePath(lang, '/work')} variant="outline">
              {done.work}
            </PillLink>
          </div>

          {refValid && (
            <div className="mt-16 max-w-xl border-t border-line pt-6">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="label mb-2">{done.refLabel}</dt>
                  <dd className="tabular text-lg tracking-[-0.01em]">{refValid}</dd>
                </div>
                {codeValid && (
                  <div className="min-w-0">
                    <dt className="label mb-2">{done.codeLabel}</dt>
                    <dd className="font-mono text-xs break-all text-ink-2">{codeValid}</dd>
                  </div>
                )}
              </dl>
              <a
                href={bot}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {done.track} <span aria-hidden>→</span>
              </a>
            </div>
          )}
        </div>

        <div className="relative aspect-square w-40 justify-self-start md:w-full md:justify-self-end">
          <StudioObject src="/objects/laptop.webp" alt="" sizes="(min-width: 768px) 16rem, 10rem" />
        </div>
      </div>
    </Band>
  );
}

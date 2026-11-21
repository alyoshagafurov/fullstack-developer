import type { Metadata } from 'next';
import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon } from '@/components/museum/Icons';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * After the request: the thanks as the room's headline, the reference number
 * and status code as the small label in the corner, and the way on.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.thanks.metaTitle,
    robots: { index: false, follow: false },
  };
}

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
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_35%,rgb(255_236_204/0.12),transparent_55%)]"
      />
      <div className="hall flex min-h-[100svh] flex-col justify-end pt-32 pb-16 md:pb-24">
        <h1 className="hall-title text-[clamp(3rem,9vw,9rem)]">
          <Lines lines={[done.title]} />
        </h1>
        <p className="lead-line mt-4 text-bone-2">{t.common.responseTime}</p>

        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link href={localePath(lang, '/work')} className="btn-bone group">
              {done.work}
              <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link href={localePath(lang, '/prices')} className="btn-line">
              {done.prices}
            </Link>
          </div>

          <div className="md:text-right">
            <p className="wall-note md:ml-auto">{done.message}</p>
            {refValid && (
              <dl className="mt-6 space-y-3">
                <div>
                  <dt className="wall-label">{done.refLabel}</dt>
                  <dd className="mt-1 text-base text-bone tabular-nums">{refValid}</dd>
                </div>
                {codeValid && (
                  <div>
                    <dt className="wall-label">{done.codeLabel}</dt>
                    <dd className="mt-1 font-mono text-xs break-all text-bone-2">{codeValid}</dd>
                  </div>
                )}
              </dl>
            )}
            {refValid && (
              <a href={bot} target="_blank" rel="noopener noreferrer" className="link-quiet mt-5 inline-block text-sm">
                {done.track}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

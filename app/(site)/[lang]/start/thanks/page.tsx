import type { Metadata } from 'next';
import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon } from '@/components/museum/Icons';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * After the request: the thanks as the room's headline, when to expect an
 * answer, and the way on. No number and no code: if the client wants to know
 * how things stand, they simply write and he answers.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.thanks.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function ThanksPage() {
  const { lang, t } = await getDictionary();
  const done = t.brief.done;

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
          </div>
        </div>
      </div>
    </section>
  );
}

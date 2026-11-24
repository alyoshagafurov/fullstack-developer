import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon } from '@/components/museum/Icons';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/* An empty wall where a work used to hang: the label says what happened. */
export default async function NotFound() {
  const { lang, t } = await getDictionary();

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_30%,rgb(255_236_204/0.1),transparent_50%)]"
      />
      <div className="hall flex min-h-[100svh] flex-col justify-end pt-32 pb-16 md:pb-24">
        <p className="lead-line text-bone-2">404</p>
        <h1 className="hall-title mt-4 text-[clamp(3rem,9vw,9rem)]">
          <Lines lines={[t.notFound.title]} />
        </h1>
        <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link href={localePath(lang, '/')} className="btn-line group">
              {t.common.backHome}
              <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link href={localePath(lang, '/work')} className="btn-line">
              {t.common.seeWork}
            </Link>
          </div>
          <p className="wall-note md:text-right">{t.notFound.body}</p>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/apple/Sections';
import { ArrowIcon } from '@/components/museum/Icons';
import { startHref } from '@/components/museum/links';
import { getPublishedCases, localizeCases } from '@/lib/cases';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * Every published work, hung salon-style: large and small frames alternate
 * down the wall, each with its label in the corner. Published from the admin,
 * so revalidated rather than built once.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.work.metaTitle,
    description: t.work.metaDescription,
    alternates: alternatesFor(lang, '/work'),
  };
}

/* Where each frame hangs on a twelve-column wall, repeating every four works. */
const HANG = [
  'lg:col-span-7',
  'lg:col-span-4 lg:col-start-9 lg:mt-[28vh]',
  'lg:col-span-5 lg:col-start-2',
  'lg:col-span-6 lg:col-start-7 lg:mt-[16vh]',
];

export default async function WorkPage() {
  const { lang, t } = await getDictionary();
  const cases = await localizeCases(await getPublishedCases(), lang);

  return (
    <>
      <HallHead title={t.home.workTitle} script={t.home.workScript} note={t.work.metaDescription} />

      {cases.length === 0 ? (
        <section className="hall pb-32">
          <p className="room-title max-w-3xl">{t.work.emptyTitle}</p>
          <p className="wall-note mt-8">{t.work.emptyBody}</p>
          <Link href={startHref(lang)} className="btn-bone mt-10">
            {t.common.getQuote}
            <ArrowIcon />
          </Link>
        </section>
      ) : (
        <section className="hall pb-32 md:pb-48" aria-label={t.work.metaTitle}>
          <ul className="grid gap-x-10 gap-y-24 md:gap-y-32 lg:grid-cols-12">
            {cases.map((row, index) => (
              <li key={row.id} data-fade className={HANG[index % HANG.length]}>
                <Link href={localePath(lang, `/work/${row.slug}`)} className="group block">
                  <div className="relative pt-10">
                    <div className="exhibit aspect-[16/10] overflow-hidden">
                      <Image
                        src={row.screenshots[0] || row.objectImage}
                        alt={row.title}
                        fill
                        sizes="(min-width: 1024px) 58vw, 92vw"
                        className="object-cover object-top transition-transform duration-[1.4s] ease-[var(--ease-gallery)] group-hover:scale-[1.04]"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex items-start justify-between gap-6">
                    <div>
                      <h2
                        lang={row.fallback.title ? 'ru' : undefined}
                        className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-none font-extrabold"
                      >
                        {row.title}
                      </h2>
                      <p className="wall-label mt-3">{[row.client, row.year].filter(Boolean).join(' · ')}</p>
                    </div>
                    <span className="mt-1 inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-seam-2 transition-colors duration-500 group-hover:border-brass group-hover:bg-brass group-hover:text-wall">
                      <ArrowIcon className="size-4" />
                    </span>
                  </div>
                  {row.task && (
                    <p lang={row.fallback.task ? 'ru' : undefined} className="wall-note mt-5 line-clamp-3">
                      {row.task}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Closing lang={lang} t={t} />
    </>
  );
}

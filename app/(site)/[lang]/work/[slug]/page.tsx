import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/apple/Sections';
import { ArrowIcon } from '@/components/museum/Icons';
import { getCase, getPublishedCases, localizeCases } from '@/lib/cases';
import { alternatesFor, fill, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * One work, given its own room. The name large, the problem in the corner,
 * then the screens hung one after another, each under its own light, with what
 * was done and what came of it as two short labels between them. The room
 * ends on the door to the next work, the way a museum leads you on.
 */
export const revalidate = 300;
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cases = await getPublishedCases();
  return cases.map((row) => ({ slug: row.slug }));
}

async function getLocalCase(slug: string) {
  const row = await getCase(slug);
  if (!row) return null;
  const { lang, t } = await getDictionary();
  const [local] = await localizeCases([row], lang);
  return { row: local, lang, t };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await getLocalCase(slug);
  if (!found) return {};
  const { row, lang } = found;
  return {
    title: row.title,
    description: row.task.slice(0, 180),
    alternates: alternatesFor(lang, `/work/${row.slug}`),
    openGraph: row.screenshots[0] ? { images: [{ url: row.screenshots[0] }] } : undefined,
  };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const found = await getLocalCase(slug);
  if (!found) notFound();
  const { row, lang, t } = found;

  const all = await getPublishedCases();
  const at = all.findIndex((item) => item.slug === row.slug);
  const nextRaw = all.length > 1 ? all[(at + 1) % all.length] : null;
  const [next] = nextRaw ? await localizeCases([nextRaw], lang) : [];

  const ru = (missing: boolean) => (missing ? 'ru' : undefined);
  const screens = row.screenshots.length > 0 ? row.screenshots : [row.objectImage];
  const [first, ...rest] = screens;
  const caption = [row.client, row.year].filter(Boolean).join(' · ');

  return (
    <>
      <HallHead
        title={row.title}
        script={caption}
        back={{ href: localePath(lang, '/work'), label: t.work.breadcrumb }}
        note={row.task ? <span lang={ru(row.fallback.task)}>{row.task}</span> : undefined}
      >
        {row.liveUrl && (
          <a href={row.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
            {t.work.open}
            <ArrowIcon className="size-4 -rotate-45" />
          </a>
        )}
      </HallHead>

      {/* The first screen, hung large. */}
      <section className="hall pb-24 md:pb-36">
        <figure data-fade className="relative pt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[6%] top-0 bottom-[40%] bg-[radial-gradient(ellipse_40%_70%_at_50%_0%,rgb(255_236_204/0.16),transparent_72%)]"
          />
          <div className="exhibit overflow-hidden">
            <Image
              src={first}
              alt={fill(t.work.screenAlt, { title: row.title, n: 1 })}
              width={2400}
              height={1500}
              priority
              sizes="(min-width: 1680px) 1540px, 92vw"
              className="h-auto w-full"
            />
          </div>
        </figure>
      </section>

      {(row.solution || row.result) && (
        <section className="bg-wall-2 py-24 md:py-36">
          <div className="hall grid gap-16 md:grid-cols-2 md:gap-10">
            {row.solution && (
              <div data-fade>
                <h2 className="room-title">{t.work.solution}</h2>
                <p lang={ru(row.fallback.solution)} className="wall-note mt-8 whitespace-pre-line">
                  {row.solution}
                </p>
              </div>
            )}
            {row.result && (
              <div data-fade="0.1" className="md:mt-[18vh]">
                <h2 className="room-title">{t.work.result}</h2>
                <p lang={ru(row.fallback.result)} className="wall-note mt-8 whitespace-pre-line">
                  {row.result}
                </p>
              </div>
            )}
          </div>
          {row.technologies.length > 0 && (
            <p className="hall wall-label mt-20 leading-relaxed md:mt-28">
              {t.work.tech}: <span className="text-bone-2">{row.technologies.join(' · ')}</span>
            </p>
          )}
        </section>
      )}

      {rest.length > 0 && (
        <section className="hall py-24 md:py-36" aria-label={t.work.screens}>
          <ul className="grid gap-20 md:gap-32 lg:grid-cols-12">
            {rest.map((shot, index) => (
              <li
                key={shot}
                data-fade
                className={index % 3 === 2 ? 'lg:col-span-12' : index % 2 === 0 ? 'lg:col-span-8' : 'lg:col-span-7 lg:col-start-6'}
              >
                <div className="exhibit overflow-hidden">
                  <Image
                    src={shot}
                    alt={fill(t.work.screenAlt, { title: row.title, n: index + 2 })}
                    width={2400}
                    height={1500}
                    sizes="(min-width: 1024px) 66vw, 92vw"
                    className="h-auto w-full"
                  />
                </div>
                <p className="wall-label mt-5">
                  {index + 2} / {screens.length}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {next && next.slug !== row.slug && (
        <section className="border-t border-seam">
          <Link href={localePath(lang, `/work/${next.slug}`)} className="group hall flex items-end justify-between gap-8 py-24 md:py-32">
            <span>
              <span className="block text-lg text-bone-2">{t.vitrine.next}</span>
              <span className="hall-title mt-4 block text-[clamp(2.75rem,8vw,8rem)] transition-colors duration-500 group-hover:text-brass">
                {next.title}
              </span>
            </span>
            <span className="mb-4 inline-flex size-16 shrink-0 items-center justify-center rounded-full border border-seam-2 transition-colors duration-500 group-hover:border-brass group-hover:bg-brass group-hover:text-wall md:size-20">
              <ArrowIcon className="size-6" />
            </span>
          </Link>
        </section>
      )}

      <Closing lang={lang} t={t} />
    </>
  );
}

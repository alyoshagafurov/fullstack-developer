import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/site/Closing';
import { ArrowIcon } from '@/components/museum/Icons';
import { getCase, getPublishedCases, localizeCases } from '@/lib/cases';
import { fill, localePath } from '@/lib/i18n';
import { dictionaryFor, getDictionary } from '@/lib/i18n/server';
import { JsonLd } from '@/lib/seo/JsonLd';
import { isUntranslated } from '@/lib/seo/dates';
import { notFoundMetadata, pageMetadata, snippet } from '@/lib/seo/metadata';
import { lowerFirst } from '@/lib/seo/price';
import { breadcrumbs } from '@/lib/seo/schema';

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

/*
 * A case with no English yet reads the same Russian text at both addresses.
 * Rather than offer that as a translation, both point at the Russian page as
 * the one to index (and the sitemap lists only it); once the owner adds the
 * English in the admin, the usual pair of language versions comes back.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await getLocalCase(slug);
  if (!found) return notFoundMetadata((await getDictionary()).t);
  const { row, lang, t } = found;
  const path = `/work/${row.slug}`;
  const [english] = lang === 'en' ? [row] : await localizeCases([row], 'en');
  const russianOnly = english ? isUntranslated(english) : false;
  const kind = t.showroom.kinds[row.slug];
  const shot = row.screenshots[0];
  return pageMetadata({
    lang,
    t,
    path,
    // «ArusDomod — магазин свадебных нарядов»: the name alone says nothing to a searcher
    title: kind ? `${row.title} — ${lowerFirst(kind)}` : row.title,
    description: snippet(row.task),
    image: shot ? { url: shot, alt: fill(t.work.screenAlt, { title: row.title, n: 1 }) } : undefined,
    alternates: russianOnly ? { canonical: localePath('ru', path) } : undefined,
  });
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

  /*
   * The breadcrumb of the page that is indexed. An English address with no
   * English words yet points at the Russian page as its canonical, so its
   * trail names the Russian addresses too, in Russian, as that page does.
   */
  const crumbLang = lang === 'en' && isUntranslated(row) ? 'ru' : lang;
  const crumbT = crumbLang === lang ? t : dictionaryFor(crumbLang);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          ...breadcrumbs(crumbLang, crumbT, [
            { name: crumbT.nav.work, path: '/work' },
            { name: row.title, path: `/work/${row.slug}` },
          ]),
        }}
      />
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
        <section data-tone="dark" className="bg-wall py-24 md:py-36" aria-label={t.work.screens}>
        <div className="hall">
          <ul className="grid gap-20 md:gap-32 lg:grid-cols-12">
            {rest.map((shot, index) => (
              <li
                key={shot}
                data-fade
                data-colour
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
        </div>
        </section>
      )}

      {next && next.slug !== row.slug && (
        <section className="border-t border-seam">
          <Link href={localePath(lang, `/work/${next.slug}`)} className="group hall flex items-end justify-between gap-8 py-24 md:py-32">
            <span>
              <span className="block text-lg text-bone-2">{t.vitrine.next}</span>
              <span className="hall-title mt-4 block text-[clamp(2.75rem,8vw,8rem)] transition-colors duration-500 group-hover:underline group-hover:decoration-brass group-hover:decoration-2 group-hover:underline-offset-8">
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

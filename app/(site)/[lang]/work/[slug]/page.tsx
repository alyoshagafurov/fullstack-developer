import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { getCase, getPublishedCases, localizeCases } from '@/lib/cases';
import { alternatesFor, fill, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export const revalidate = 300;

/*
 * The site's root layout refuses languages it does not know; a case it has not
 * seen yet is different — the owner publishes one from the admin and it has
 * to open without a redeploy. An unknown slug still 404s via `getCase`.
 */
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
  };
}

/*
 * A case reads like a product page: the object first, then the three sections
 * the owner wrote, then the real screenshots.
 *
 * Those screenshots are the only colour on the entire site. Everything around
 * them is studio-neutral so the work is the thing that carries it.
 *
 * Until the owner adds the English for a case, its sections stay in his
 * Russian and the page says so in one line rather than pretending otherwise.
 */
export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const found = await getLocalCase(slug);
  if (!found) notFound();
  const { row, lang, t } = found;

  const ru = (missing: boolean) => (missing ? 'ru' : undefined);
  const sections = [
    { title: t.work.task, body: row.task, lang: ru(row.fallback.task) },
    { title: t.work.solution, body: row.solution, lang: ru(row.fallback.solution) },
    { title: t.work.result, body: row.result, lang: ru(row.fallback.result) },
  ];
  const untranslated = sections.some((section) => section.lang);

  return (
    <>
      <Band tone="ground" innerClassName="pt-36 pb-20 md:pt-44 md:pb-28">
        <nav className="label mb-10">
          <Link href={localePath(lang, '/work')} className="transition-colors hover:text-ink">
            {t.work.breadcrumb}
          </Link>
          <span className="mx-2 text-ink-3">/</span>
          <span className="text-ink-2">{row.year}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-[1fr_22rem] md:items-center md:gap-16">
          <div>
            {row.client && <p className="label mb-6">{row.client}</p>}
            <h1
              lang={ru(row.fallback.title)}
              className="max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.04em]"
            >
              {row.title}
            </h1>
            {row.liveUrl && (
              <PillLink href={row.liveUrl} variant="outline" size="sm" className="mt-8">
                {t.work.open}
              </PillLink>
            )}
          </div>
          <div className="relative aspect-square w-56 justify-self-start md:w-full md:justify-self-end">
            <StudioObject
              src={row.objectImage}
              alt={row.title}
              priority
              sizes="(min-width: 768px) 22rem, 14rem"
            />
          </div>
        </div>
      </Band>

      <Band tone="paper" innerClassName="py-20 md:py-28">
        {untranslated && <p className="mb-12 text-sm text-ink-3">{t.common.inRussianOnly}</p>}

        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="label mb-5">{section.title}</h2>
              <p lang={section.lang} className="text-base leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {row.technologies.length > 0 && (
          <div className="mt-16 border-t border-line pt-8">
            <p className="label mb-6">{t.work.tech}</p>
            <ul className="flex flex-wrap gap-2">
              {row.technologies.map((tech) => (
                <li
                  key={tech}
                  className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm text-ink-2"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Band>

      {row.screenshots.length > 0 && (
        <Band tone="shelf" innerClassName="py-20 md:py-28">
          <p className="label mb-10">{t.work.screens}</p>
          <div className="space-y-8 md:space-y-16">
            {row.screenshots.map((shot, index) => (
              <figure key={shot} className="group relative w-full overflow-hidden bg-paper">
                <Image
                  src={shot}
                  alt={fill(t.work.screenAlt, { title: row.title, n: index + 1 })}
                  width={2400}
                  height={1500}
                  sizes="(min-width: 1440px) 1376px, 92vw"
                  className="h-auto w-full transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.02]"
                />
              </figure>
            ))}
          </div>
        </Band>
      )}

      <Invite />
    </>
  );
}

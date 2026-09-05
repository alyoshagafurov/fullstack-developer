import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Band } from '@/components/ui/Band';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { getCase, getPublishedCases } from '@/lib/cases';
import { site } from '@/lib/content/site';

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cases = await getPublishedCases();
  return cases.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const row = await getCase(slug);
  if (!row) return {};

  return {
    title: row.title,
    description: row.task.slice(0, 180),
    alternates: { canonical: `/work/${row.slug}` },
  };
}

/*
 * A case reads like a product page: the object first, then the three sections
 * the owner wrote, then the real screenshots.
 *
 * Those screenshots are the only colour on the entire site. Everything around
 * them is studio-neutral so the work is the thing that carries it.
 */
export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const row = await getCase(slug);
  if (!row) notFound();

  const sections = [
    { title: 'Задача', body: row.task },
    { title: 'Решение', body: row.solution },
    { title: 'Результат', body: row.result },
  ];

  return (
    <>
      <Band tone="ground" innerClassName="pt-36 pb-20 md:pt-44 md:pb-28">
        <nav className="label mb-10">
          <Link href="/work" className="transition-colors hover:text-ink">
            Проекты
          </Link>
          <span className="mx-2 text-ink-3">/</span>
          <span className="text-ink-2">{row.year}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-[1fr_22rem] md:items-center md:gap-16">
          <div>
            {row.client && <p className="label mb-6">{row.client}</p>}
            <h1 className="max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.04em]">
              {row.title}
            </h1>
            {row.liveUrl && (
              <PillLink href={row.liveUrl} variant="outline" size="sm" className="mt-8">
                Открыть проект
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
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="label mb-5">{section.title}</h2>
              <p className="text-base leading-relaxed whitespace-pre-line">{section.body}</p>
            </section>
          ))}
        </div>

        {row.technologies.length > 0 && (
          <div className="mt-16 border-t border-line pt-8">
            <p className="label mb-6">Технологии</p>
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
          <p className="label mb-10">Экраны</p>
          <div className="space-y-8 md:space-y-16">
            {row.screenshots.map((shot, index) => (
              <figure key={shot} className="relative w-full overflow-hidden bg-paper">
                <Image
                  src={shot}
                  alt={`${row.title}: экран ${index + 1}`}
                  width={2400}
                  height={1500}
                  sizes="(min-width: 1440px) 1376px, 92vw"
                  className="h-auto w-full"
                />
              </figure>
            ))}
          </div>
        </Band>
      )}

      <Band tone="ground" innerClassName="py-24 md:py-32">
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.03em]">
          {site.contactInvite}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <PillLink href="/start" variant="solid">
            {site.heroCta}
          </PillLink>
          <PillLink href="/work" variant="outline">
            Все проекты
          </PillLink>
        </div>
      </Band>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import Action from '@/components/ui/Action';
import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import { getPublishedCase } from '@/lib/cases';
import { SITE_URL } from '@/lib/seo';

/*
 * /work/[slug] — one case.
 *
 * Reads as a document: what it is, what it runs on, where to see it, then the
 * screenshots at full width as panels. The images are the argument, so they
 * get the whole measure rather than being boxed into a gallery grid.
 *
 * `getPublishedCase` filters on `published` inside the query, so an unpublished
 * case 404s exactly as a non-existent one does — a draft is not reachable by
 * knowing its address.
 *
 * `params` is a Promise: Next 15 resolves route params lazily.
 */

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getPublishedCase(slug);
  if (!item) return { title: 'Кейс не найден' };

  return {
    title: `${item.title} — работы Alisher Gafurov`,
    description: item.summary || undefined,
    alternates: { canonical: `${SITE_URL}/work/${item.slug}` },
    openGraph: item.cover ? { images: [{ url: item.cover }] } : undefined,
  };
}

export default async function CasePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const item = await getPublishedCase(slug);
  if (!item) notFound();

  // Blank lines separate paragraphs. The field is plain text on purpose: an
  // owner writing a case should not have to know a markup language, and
  // rendering their input as HTML would be an injection hole for no gain.
  const paragraphs = item.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <Header />
      <main id="main" className="shell pb-24 pt-28 md:pt-32">
        <article>
          <Link
            href="/work"
            className="lnk inline-flex min-h-[44px] items-center gap-3 text-[12px] uppercase
                       tracking-[0.2em] text-ink-3 hover:text-ink"
          >
            <span aria-hidden>←</span>
            Все работы
          </Link>

          <Rail label="Кейс" className="mt-6">{item.year || undefined}</Rail>

          <header className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="display m-0 max-w-[18ch] text-d-l text-ink">{item.title}</h1>
              {item.summary && (
                <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.6] text-ink-2">{item.summary}</p>
              )}
            </div>

            {item.technologies.length > 0 && (
              <dl className="m-0 lg:col-span-5">
                <dt className="label">Технологии</dt>
                <dd className="m-0 mt-3 flex flex-wrap gap-1.5">
                  {item.technologies.map((tech) => (
                    <span key={tech} className="chip">
                      {tech}
                    </span>
                  ))}
                </dd>
              </dl>
            )}
          </header>

          {item.liveUrl && (
            <div className="mb-10">
              <Action href={item.liveUrl} external variant="ghost">
                Открыть сайт
                <span aria-hidden>↗</span>
              </Action>
            </div>
          )}

          {paragraphs.length > 0 && (
            <Panel className="mb-4 px-6 py-7 md:px-9 md:py-9">
              <div className="max-w-text">
                {paragraphs.map((text, i) => (
                  <p key={i} className="mb-4 text-[16px] leading-[1.7] text-ink-2 last:mb-0">
                    {text}
                  </p>
                ))}
              </div>
            </Panel>
          )}

          {item.screenshots.length > 0 && (
            <section className="grid gap-3">
              <h2 className="sr-only">Скриншоты</h2>
              {item.screenshots.map((src, i) => (
                <Panel as="figure" key={src} className="m-0 overflow-hidden bg-base-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${item.title} — экран ${i + 1}`}
                    className="block h-auto w-full"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </Panel>
              ))}
            </section>
          )}

          <Panel
            tone="raised"
            className="mt-12 flex flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-9"
          >
            <p className="m-0 max-w-[44ch] text-[15px] leading-[1.6] text-ink">
              Похожая задача? Расскажите о проекте — вернусь с предложением.
            </p>
            <Action href="/start-project" variant="signal" className="shrink-0">
              Обсудить проект
            </Action>
          </Panel>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

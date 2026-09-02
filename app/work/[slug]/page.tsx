import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import { getPublishedCase } from '@/lib/cases';
import { SITE_URL } from '@/lib/seo';

/*
 * /work/[slug] — one case.
 *
 * Reads as a document: what it is, what it runs on, where to see it, then the
 * screenshots at full width. The images are the argument, so they get the whole
 * measure rather than being boxed into a gallery grid.
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
      <main id="main" className="px-gutter pt-[104px] pb-24">
        <article className="mx-auto w-full max-w-shell">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden />
            Все работы
          </Link>

          <header className="mt-6 mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="display m-0 text-[clamp(1.9rem,1.3rem+2.4vw,3.25rem)] text-ink">
                {item.title}
              </h1>
              {item.summary && (
                <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.6] text-ink-2">
                  {item.summary}
                </p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:col-span-5">
              {item.year && (
                <div>
                  <dt className="label text-[10px]">Год</dt>
                  <dd className="mt-1.5 text-[13px] text-ink-2">{item.year}</dd>
                </div>
              )}
              {item.technologies.length > 0 && (
                <div className="col-span-2">
                  <dt className="label text-[10px]">Технологии</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {item.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-pill border border-line px-2.5 py-1 text-[11px] leading-none text-ink-2"
                      >
                        {tech}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </header>

          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-10 inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2.5
                         text-[13px] font-medium text-base transition-colors hover:bg-signal-deep"
            >
              Открыть сайт
              <ArrowUpRight size={15} aria-hidden />
            </a>
          )}

          {paragraphs.length > 0 && (
            <div className="mb-12 max-w-text">
              {paragraphs.map((text, i) => (
                <p key={i} className="mb-4 text-[16px] leading-[1.7] text-ink-2 last:mb-0">
                  {text}
                </p>
              ))}
            </div>
          )}

          {item.screenshots.length > 0 && (
            <section className="grid gap-4">
              <h2 className="sr-only">Скриншоты</h2>
              {item.screenshots.map((src, i) => (
                <figure
                  key={src}
                  className="m-0 overflow-hidden rounded-panel border border-line bg-base-deep"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${item.title} — экран ${i + 1}`}
                    className="block h-auto w-full"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </figure>
              ))}
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import { SITE_URL } from '@/lib/seo';
import { getService, services } from '@/lib/services';

/*
 * /services/[slug] — one service.
 *
 * Three questions in a fixed order, because that is what the owner asked the
 * page to answer: what it is, what it gives you, who it is for. Every service
 * answers all three, so the pages are comparable — a reader who has opened two
 * of them can put them side by side without re-reading.
 *
 * The other thirteen are listed at the foot as a plain index. Only five are
 * cards on the landing page, so without this the remaining nine would exist
 * and be unreachable.
 *
 * Statically generated: fourteen pages from a constant array, so there is
 * nothing to render per request.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return { title: 'Услуга не найдена' };

  return {
    title: `${service.title} — Alisher Gafurov`,
    description: service.tagline,
    alternates: { canonical: `${SITE_URL}/services/${service.slug}` },
  };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8 md:grid md:grid-cols-12 md:gap-8">
      <h2 className="m-0 text-[11px] uppercase tracking-[0.22em] text-ink-3 md:col-span-3">
        {label}
      </h2>
      <p className="m-0 mt-4 max-w-[62ch] text-[16px] leading-[1.75] text-ink-2 md:col-span-9 md:mt-0">
        {children}
      </p>
    </section>
  );
}

export default async function ServicePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <Header />
      <main id="main" className="px-gutter pb-24 pt-[104px]">
        <article className="mx-auto w-full max-w-shell">
          <Link
            href="/#services"
            className="inline-flex min-h-[44px] items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-ink-3 transition-colors hover:text-ink"
          >
            <span aria-hidden>←</span>
            Все услуги
          </Link>

          <header className="mb-12 mt-8">
            <span aria-hidden className="block text-[13px] tracking-[0.2em] text-copper">
              {service.num}
            </span>
            <h1
              className="mt-5 max-w-[20ch] text-[clamp(2rem,1.2rem+2.6vw,3.4rem)] font-light
                         uppercase leading-[1.08] tracking-[-0.015em] text-ink"
            >
              {service.title}
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-ink-2">
              {service.tagline}
            </p>
          </header>

          <Block label="Что это">{service.what}</Block>
          <Block label="Чем поможет">{service.help}</Block>
          <Block label="Для кого">{service.who}</Block>

          <div className="border-t border-line pt-10">
            <Link
              href="/start-project"
              className="group inline-flex min-h-[48px] items-center gap-4 rounded-pill
                         border border-line-2 px-7 text-[12px] uppercase tracking-[0.18em]
                         text-ink transition-colors duration-300 hover:border-copper hover:text-copper"
            >
              Обсудить проект
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          {/* The rest of the catalogue, so nothing is unreachable. */}
          <nav className="mt-20 border-t border-line pt-8" aria-label="Другие услуги">
            <h2 className="m-0 text-[11px] uppercase tracking-[0.22em] text-ink-3">
              Другие услуги
            </h2>
            <ul className="m-0 mt-6 grid list-none gap-x-8 gap-y-1 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/services/${item.slug}`}
                    className="group flex min-h-[44px] items-center gap-4 border-b border-line text-[14px] text-ink-2 transition-colors hover:text-ink"
                  >
                    <span aria-hidden className="text-[11px] tabular-nums text-ink-3">
                      {item.num}
                    </span>
                    {item.title}
                    <span
                      aria-hidden
                      className="ml-auto text-ink-3 transition-all duration-300 group-hover:translate-x-1 group-hover:text-copper"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

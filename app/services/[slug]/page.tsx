import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import Header from '@/components/chrome/Header';
import SiteFooter from '@/components/sections/SiteFooter';
import Action from '@/components/ui/Action';
import Panel from '@/components/ui/Panel';
import Rail from '@/components/ui/Rail';
import { ru } from '@/lib/i18n/ru';
import { SITE_URL } from '@/lib/seo';
import { getService, services } from '@/lib/services';

/*
 * /services/[slug] — one service.
 *
 * Three questions in a fixed order, because that is what the owner asked the
 * page to answer: what it is, what it gives you, who it is for. They sit as
 * three rows of one panel, so a reader who has opened two services can put
 * them side by side without re-reading.
 *
 * The other thirteen are listed at the foot as a plain index, so nothing in
 * the catalogue is ever unreachable.
 *
 * Statically generated: fourteen pages from a constant array.
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

export default async function ServicePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((item) => item.slug !== service.slug);
  const blocks: [string, string][] = [
    ['Что это', service.what],
    ['Чем поможет', service.help],
    ['Для кого', service.who],
  ];
  const help = ru.servicesSection;

  return (
    <>
      <Header />
      <main id="main" className="shell pb-24 pt-28 md:pt-32">
        <article>
          <Link
            href="/services"
            className="lnk inline-flex min-h-[44px] items-center gap-3 text-[12px] uppercase
                       tracking-[0.2em] text-ink-3 hover:text-ink"
          >
            <span aria-hidden>←</span>
            Все услуги
          </Link>

          <Rail label="Услуга" className="mt-6">
            <span className="text-copper">{service.num}</span> / {String(services.length).padStart(2, '0')}
          </Rail>

          <header className="mb-10 md:mb-14">
            <h1 className="display max-w-[18ch] text-d-l text-ink">{service.title}</h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-ink-2">{service.tagline}</p>
          </header>

          <Panel>
            <dl className="m-0">
              {blocks.map(([label, text], index) => (
                <div
                  key={label}
                  className={`grid gap-3 px-6 py-6 md:grid-cols-12 md:gap-8 md:px-8 md:py-8 ${
                    index > 0 ? 'border-t border-edge' : ''
                  }`}
                >
                  <dt className="label md:col-span-3">{label}</dt>
                  <dd className="m-0 max-w-[62ch] text-[16px] leading-[1.75] text-ink-2 md:col-span-9">
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel
            tone="raised"
            className="mt-3 flex flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-9"
          >
            <div>
              <p className="m-0 text-[15px] font-medium uppercase tracking-[0.04em] text-ink">{help.helpTitle}</p>
              <p className="m-0 mt-1.5 max-w-[48ch] text-[13px] leading-[1.55] text-ink-3">{help.helpSub}</p>
            </div>
            <Action href="/start-project" variant="signal" className="shrink-0">
              {help.cta}
            </Action>
          </Panel>

          {/* The rest of the catalogue, so nothing is unreachable. */}
          <nav className="mt-16 md:mt-20" aria-label="Другие услуги">
            <Rail label="Другие услуги">{String(others.length).padStart(2, '0')}</Rail>
            <ul className="m-0 grid list-none gap-x-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/services/${item.slug}`}
                    className="lnk group flex min-h-[48px] items-center gap-4 border-b border-edge text-[14px] text-ink-2 hover:text-ink"
                  >
                    <span aria-hidden className="text-[11px] tabular-nums text-ink-3">
                      {item.num}
                    </span>
                    {item.title}
                    <span
                      aria-hidden
                      className="ml-auto text-ink-3 transition-transform duration-300 ease-out
                                 group-hover:translate-x-1 group-hover:text-copper"
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

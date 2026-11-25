import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { PlusIcon } from '@/components/local/ui';
import { HallHead } from '@/components/museum/HallHead';
import { Closing } from '@/components/site/Closing';
import { ArrowIcon, ChevronIcon, WhatsAppIcon } from '@/components/museum/Icons';
import { SERVICE_TYPE, startHref, whatsappHref } from '@/components/museum/links';
import { getPublishedCases, localizeCases } from '@/lib/cases';
import {
  RELATED_CASES,
  RELATED_SERVICES,
  hasProjectStages,
  serviceFaq,
  serviceHeadline,
  servicePageCopy,
  serviceStages,
} from '@/lib/content/service-pages';
import { getService, services } from '@/lib/content/services';
import { priceFormatter } from '@/lib/price-display';
import { localePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';
import { getDictionary } from '@/lib/i18n/server';
import { localizeService } from '@/lib/i18n/services';
import { JsonLd } from '@/lib/seo/JsonLd';
import { absoluteUrl, fullTitle, notFoundMetadata, pageMetadata } from '@/lib/seo/metadata';
import { lowerFirst } from '@/lib/seo/price';
import { breadcrumbs, graph, ids, serviceNode } from '@/lib/seo/schema';
import { cachedPriceList, serviceSeo } from '@/lib/seo/services';

/*
 * One service, in the home's voice: the name, a line saying who makes it and
 * where, then black and graphite bands taking turns — what you get, the price
 * as large as a headline, how the work goes, payment and changes, projects
 * like it, its neighbours and the questions people ask. One heading and a
 * short text per band; the blue button only where a project starts.
 *
 * Every word below the description is the site's own: the stages and terms
 * from the dictionary, the price and term from the live price list, the FAQ
 * built from those (lib/content/service-pages.ts).
 */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

/*
 * What a search result says about the service — «Telegram-бот на заказ в
 * Душанбе — от 1 500 сомони» — and the same figure as structured data. Read
 * from the price list the page shows, so the two never disagree.
 *
 * A service the owner hid in the admin is not on that list. Its page still
 * opens — every service is built, and an old link should not break — but it
 * is no longer on offer: `offered` is false, the page asks not to be indexed
 * and says nothing about a Service, an Offer or its questions.
 */
async function serviceHead(lang: Locale, t: Dictionary, slug: string) {
  const found = getService(slug);
  if (!found) return null;
  const service = localizeService(found, t);
  const [list, shown] = await Promise.all([cachedPriceList(lang), priceFormatter(lang)]);
  const row = list.find((item) => item.slug === slug);
  const seo = serviceSeo({
    lang,
    t,
    slug,
    fallbackTitle: service.title,
    fallbackSummary: service.tagline,
    price: row?.price ?? service.budget,
    term: row?.term ?? service.duration,
    shown,
  });
  return { service, seo, offered: Boolean(row), row, list, shown };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { lang, t } = await getDictionary();
  const head = await serviceHead(lang, t, slug);
  if (!head) return notFoundMetadata(t);
  return pageMetadata({
    lang,
    t,
    path: `/services/${slug}`,
    title: head.seo.title,
    absoluteTitle: head.seo.absolute,
    description: head.seo.description,
    ...(head.offered ? {} : { robots: { index: false, follow: true } }),
  });
}

/* ------------------------------------------------------------ the bands -- */

const display = 'font-display font-semibold tracking-[-0.045em] text-balance';
const heading = `${display} text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]`;
const corner = 'mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-bone-2';

/** A dark band: black or graphite, one heading, read by the header as dark. */
function Band({ id, bg, label, children }: { id: string; bg: string; label?: string; children: ReactNode }) {
  return (
    <section
      data-tone="dark"
      {...(label ? { 'aria-label': label } : { 'aria-labelledby': id })}
      className={`${bg} py-24 text-bone md:py-36`}
    >
      {children}
    </section>
  );
}

/** Heading and corner line on the left, the content on the right — the home's price-list layout. */
function Split({ id, title, note, children }: { id: string; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="hall grid gap-10 md:grid-cols-12 md:gap-12">
      <div data-fade className="md:col-span-4">
        <h2 id={id} className={heading}>
          {title}
        </h2>
        {note && <div className={corner}>{note}</div>}
      </div>
      <div data-fade className="md:col-span-8">
        {children}
      </div>
    </div>
  );
}

const quietLink = 'link-quiet group inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem]';
const chevron = <ChevronIcon className="size-3 transition-transform group-hover:translate-x-0.5" />;

/* ----------------------------------------------------------------- page -- */

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const { lang, t } = await getDictionary();
  const head = await serviceHead(lang, t, slug);
  if (!head) notFound();

  const { service, row: priced, list, shown: price } = head;
  const c = servicePageCopy(lang);
  const labels = t.services;
  const href = (path: string) => localePath(lang, path);
  const figure = price(priced?.price ?? service.budget) ?? t.common.priceOnRequest;
  const term = priced?.term ?? service.duration ?? null;
  const stages = hasProjectStages(slug);

  const faq = serviceFaq({
    lang,
    slug,
    asked: service.title,
    price: figure,
    term,
    deliverable: service.deliverable,
  });

  /* Its neighbours the owner still offers, named and priced as /prices names them. */
  const bySlug = new Map(list.map((row) => [row.slug, row]));
  const related = (RELATED_SERVICES[slug] ?? []).flatMap((other) => {
    const row = bySlug.get(other);
    return row ? [row] : [];
  });

  /* A published project that is plainly this service; otherwise the page points at /work. */
  const caseSlugs = RELATED_CASES[slug] ?? [];
  const published = caseSlugs.length > 0 ? await localizeCases(await getPublishedCases(), lang) : [];
  const cases = caseSlugs.flatMap((caseSlug) => {
    const row = published.find((item) => item.slug === caseSlug);
    return row ? [{ slug: row.slug, title: row.title, kind: t.showroom.kinds[row.slug] ?? row.client ?? '' }] : [];
  });

  /*
   * The page's JSON-LD: the Service with its Offer, the questions in the very
   * words shown below, and where the page sits in the site. The FAQPage is the
   * page itself and is about the Service; neither repeats the layout's
   * #person or #business. Google keeps FAQ rich results for government and
   * health sites, so this draws no snippet there; Yandex and others still
   * read the questions as the page's content.
   */
  const pageUrl = absoluteUrl(lang, `/services/${slug}`);
  const structuredData = graph(
    head.offered &&
      serviceNode({ lang, t, slug, name: service.title, description: service.tagline, figure: head.seo.figure }),
    head.offered &&
      faq.length > 0 && {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: head.seo.absolute ? head.seo.title : fullTitle(t, head.seo.title),
        description: head.seo.description,
        inLanguage: lang,
        isPartOf: { '@id': ids.website },
        about: { '@id': `${pageUrl}#service` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    breadcrumbs(lang, t, [
      { name: t.nav.services, path: '/services' },
      { name: service.title, path: `/services/${slug}` },
    ]),
  );

  /* The bands in reading order. Their colours alternate back from the closing, which is black. */
  const bands: { key: string; render: (bg: string) => ReactNode }[] = [
    {
      key: 'get',
      render: (bg) => (
        <Band key="get" id="get-title" bg={bg}>
          <div className="hall grid gap-10 lg:grid-cols-12 lg:gap-12">
            <h2 id="get-title" data-fade className={`${heading} lg:col-span-7`}>
              {labels.youGet}
            </h2>
            <div data-fade className="lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-bone-2">{service.deliverable}</p>
              <p className="wall-label mt-10">{labels.forWho}</p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-bone-2">{service.who}</p>
            </div>
          </div>
        </Band>
      ),
    },
    {
      key: 'price',
      render: (bg) => (
        <Band key="price" id="price" bg={bg} label={labels.budget}>
          <div className="hall flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <p data-fade className={`${display} text-[clamp(3rem,9vw,9rem)] leading-[0.95]`}>
              {figure}
            </p>
            <p className="wall-note md:text-right">
              {term ? `${labels.timeline}: ${lowerFirst(term.trim()).replace(/\.$/, '')}. ` : ''}
              {t.prices.lede}
            </p>
          </div>
        </Band>
      ),
    },
    ...(stages
      ? [
          {
            key: 'process',
            render: (bg: string) => (
              <Band key="process" id="process-title" bg={bg}>
                <Split
                  id="process-title"
                  title={t.process.title}
                  note={c.processNote(t.process.stages[1]?.title ?? '')}
                >
                  <ol className="border-t border-seam">
                    {serviceStages(slug, t.process.stages).map((stage) => (
                      <li
                        key={stage.title}
                        className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 border-b border-seam py-6 md:py-7"
                      >
                        <h3 className="font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-semibold tracking-[-0.02em]">
                          {stage.title}
                        </h3>
                        {stage.duration && (
                          <span className="text-right text-[0.9375rem] text-bone-2 tabular-nums">{stage.duration}</span>
                        )}
                        <p className="col-span-2 max-w-[62ch] text-[1rem] leading-relaxed text-bone-3">{stage.body}</p>
                      </li>
                    ))}
                  </ol>
                </Split>
              </Band>
            ),
          },
          {
            key: 'terms',
            render: (bg: string) => (
              <Band key="terms" id="terms-title" bg={bg}>
                <Split id="terms-title" title={c.termsTitle}>
                  <dl className="border-t border-seam">
                    {t.process.terms.map((item) => (
                      <div
                        key={item.label}
                        className="grid gap-2 border-b border-seam py-6 md:grid-cols-[11rem_1fr] md:gap-8 md:py-7"
                      >
                        <dt className="wall-label md:pt-1.5">{item.label}</dt>
                        <dd className="text-[1.0625rem] leading-relaxed text-bone">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Split>
              </Band>
            ),
          },
        ]
      : []),
    ...(cases.length > 0
      ? [
          {
            key: 'cases',
            render: (bg: string) => (
              <Band key="cases" id="cases-title" bg={bg}>
                <Split
                  id="cases-title"
                  title={c.casesTitle}
                  note={
                    <>
                      <p>{c.casesNote}</p>
                      <Link href={href('/work')} className={`${quietLink} mt-4`}>
                        {c.allWork}
                        {chevron}
                      </Link>
                    </>
                  }
                >
                  <ul className="border-t border-seam">
                    {cases.map((row) => (
                      <li key={row.slug} className="border-b border-seam">
                        <Link
                          href={href(`/work/${row.slug}`)}
                          className="group grid grid-cols-[1fr_auto] items-center gap-x-6 py-6 md:py-8"
                        >
                          <span>
                            <span className="block font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight font-semibold tracking-[-0.03em] decoration-1 underline-offset-[0.2em] group-hover:underline">
                              {row.title}
                            </span>
                            {row.kind && <span className="mt-1.5 block text-[0.9375rem] text-bone-2">{row.kind}</span>}
                          </span>
                          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-seam-2 transition-colors duration-300 group-hover:border-bone">
                            <ArrowIcon className="size-4" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Split>
              </Band>
            ),
          },
        ]
      : []),
    ...(related.length > 0
      ? [
          {
            key: 'related',
            render: (bg: string) => (
              <Band key="related" id="related-title" bg={bg}>
                <Split
                  id="related-title"
                  title={c.relatedTitle}
                  note={
                    <p className="flex flex-wrap gap-x-6">
                      <Link href={href('/services')} className={quietLink}>
                        {c.allServices}
                        {chevron}
                      </Link>
                      <Link href={href('/prices')} className={quietLink}>
                        {c.allPrices}
                        {chevron}
                      </Link>
                      {cases.length === 0 && (
                        <Link href={href('/work')} className={quietLink}>
                          {c.allWork}
                          {chevron}
                        </Link>
                      )}
                    </p>
                  }
                >
                  <ul className="border-t border-seam">
                    {related.map((row) => (
                      <li key={row.slug} className="border-b border-seam">
                        <Link
                          href={href(`/services/${row.slug}`)}
                          className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 md:py-6"
                        >
                          <span className="font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-semibold tracking-[-0.02em] decoration-1 underline-offset-[0.2em] group-hover:underline">
                            {row.title}
                          </span>
                          <span className="text-right text-[1.0625rem] text-bone tabular-nums md:text-lg">
                            {price(row.price) ?? t.common.priceOnRequest}
                          </span>
                          {row.term && <span className="col-span-2 text-[0.875rem] text-bone-3">{row.term}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Split>
              </Band>
            ),
          },
        ]
      : []),
    ...(faq.length > 0
      ? [
          {
            key: 'faq',
            render: (bg: string) => (
              <Band key="faq" id="faq-title" bg={bg}>
                <Split id="faq-title" title={c.faqTitle} note={<p>{c.faqNote(t)}</p>}>
                  <div className="border-t border-seam">
                    {faq.map((item, i) => (
                      <details key={item.q} open={i === 0} className="group border-b border-seam">
                        <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-6 md:py-7 [&::-webkit-details-marker]:hidden">
                          <h3 className="font-display text-[clamp(1.1875rem,1.9vw,1.5rem)] leading-snug font-semibold tracking-[-0.02em]">
                            {item.q}
                          </h3>
                          <PlusIcon className="mt-1.5 size-4 shrink-0 text-bone-2 transition-transform duration-300 group-open:rotate-45" />
                        </summary>
                        <p className="max-w-[62ch] pb-7 text-[1.0625rem] leading-relaxed text-bone-2">{item.a}</p>
                      </details>
                    ))}
                  </div>
                </Split>
              </Band>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <HallHead
        title={serviceHeadline(lang, slug, service.title)}
        size="room"
        back={{ href: href('/services'), label: labels.eyebrow }}
        script={c.sub}
        note={service.tagline}
      >
        <Link href={startHref(lang, SERVICE_TYPE[slug])} className="btn-bone group">
          {t.common.getQuote}
          <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
        <a href={whatsappHref(t)} target="_blank" rel="noopener noreferrer" className="btn-line">
          <WhatsAppIcon className="size-[1.1rem]" />
          {t.common.whatsapp}
        </a>
      </HallHead>

      {bands.map((band, i) => band.render((bands.length - 1 - i) % 2 === 0 ? 'bg-wall-2' : 'bg-black'))}

      <Closing lang={lang} t={t} />
    </>
  );
}

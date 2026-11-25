import type { Metadata } from 'next';
import { cache } from 'react';
import {
  LocalClosing,
  LocalFaq,
  LocalHero,
  LocalServices,
  LocalWho,
  LocalWork,
  type LocalServiceRow,
  type LocalWorkItem,
} from '@/components/local/LocalSections';
import { startHref, whatsappHref } from '@/components/museum/links';
import { isAlive } from '@/lib/alive';
import { getPublishedCases } from '@/lib/cases';
import {
  DUSHANBE_PATH,
  LOCAL_SERVICES,
  LOCAL_WORK,
  MIMI_URL,
  MORE_SERVICES,
  dushanbeCopy,
  dushanbeFaq,
  type Figures,
} from '@/lib/content/dushanbe';
import { site } from '@/lib/content/site';
import { localePath, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { priceFormatter } from '@/lib/price-display';
import type { PricedService } from '@/lib/prices';
import { JsonLd } from '@/lib/seo/JsonLd';
import { absoluteUrl, fullTitle, pageMetadata } from '@/lib/seo/metadata';
import { parsePrice } from '@/lib/seo/price';
import { breadcrumbs, graph, ids } from '@/lib/seo/schema';
import { cachedPriceList } from '@/lib/seo/services';

/*
 * /dushanbe and /ru/dushanbe — «Создание сайтов в Душанбе»: for someone who
 * wants a site made here and asks what it costs, how long it takes and how
 * payment works. The home owns «Программист в Душанбе»; this page answers the
 * commercial questions (see lib/content/dushanbe.ts), with who would do the
 * work, what he builds and from what price, and real projects.
 *
 * Revalidated like the home: the prices come from the admin and must reach
 * this page, its title and its FAQ markup without a redeploy.
 */
export const revalidate = 300;

/* Him at work on a laptop — one of the new photos; the older ones stay on /about. */
const PHOTO = '/me/laptop.webp';
const AVATAR = '/me/avatar.webp';

type PriceFacts = { list: PricedService[]; figures: Figures; shown: (value: string | null) => string | null };

/**
 * Each service's starting price and term, as the visitor reads them in this
 * language. Once per request: the head, the page and its markup all ask, and
 * the list itself is the one the layout already read.
 */
const priceFacts = cache(async (lang: Locale): Promise<PriceFacts> => {
  const [list, price] = await Promise.all([cachedPriceList(lang), priceFormatter(lang)]);
  const figures: Figures = Object.fromEntries(list.map((row) => [row.slug, { price: price(row.price), term: row.term }]));
  return { list, figures, shown: (value) => price(value) };
});

/**
 * A service's starting price as shown, only when the list gives it as a
 * figure in somoni — «Считается под задачу» or «до …» says nothing a snippet
 * can promise from.
 */
function startingAt({ list, figures }: PriceFacts, slug: string): string | null {
  const figure = parsePrice(list.find((row) => row.slug === slug)?.price);
  if (!figure || figure.kind === 'upTo') return null;
  return figures[slug]?.price ?? null;
}

/** «Заказать сайт в Душанбе: лендинг от …, сайт под ключ от … сомони» and the promise. */
function describe(lang: Locale, facts: PriceFacts): string {
  return dushanbeCopy(lang).metaDescription(startingAt(facts, 'landing'), startingAt(facts, 'sites'));
}

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  const c = dushanbeCopy(lang);
  // the page's own title, card and canonical; the layout's template adds the name
  return pageMetadata({ lang, t, path: DUSHANBE_PATH, title: c.metaTitle, description: describe(lang, await priceFacts(lang)) });
}

export default async function DushanbePage() {
  const { lang, t } = await getDictionary();
  const c = dushanbeCopy(lang);
  const [facts, cases, mimiAlive] = await Promise.all([priceFacts(lang), getPublishedCases(), isAlive(MIMI_URL)]);
  const { list, figures, shown } = facts;
  const href = (path: string) => localePath(lang, path);
  const pageUrl = absoluteUrl(lang, DUSHANBE_PATH);
  const homeHref = href('/');
  const faq = dushanbeFaq(lang, figures, t);

  /* The services people here ask for most, each linking to its own page, hidden ones left out. */
  const bySlug = new Map(list.map((row) => [row.slug, row]));
  const rows: LocalServiceRow[] = LOCAL_SERVICES.flatMap((slug) => {
    const row = bySlug.get(slug);
    if (!row) return [];
    return [
      {
        slug,
        title: c.services.names[slug] ?? row.title,
        tagline: t.services.items[slug]?.tagline ?? row.tagline,
        term: row.term,
        price: shown(row.price) ?? t.common.priceOnRequest,
        href: href(`/services/${slug}`),
      },
    ];
  });
  const more = MORE_SERVICES.flatMap((slug) =>
    bySlug.has(slug) && c.services.moreNames[slug] ? [{ label: c.services.moreNames[slug], href: href(`/services/${slug}`) }] : [],
  );

  /* The home's three projects: the two with case pages if they are published, and mimi's live site. */
  const published = new Map(cases.map((row) => [row.slug, row]));
  const work: LocalWorkItem[] = LOCAL_WORK.flatMap((slug): LocalWorkItem[] => {
    if (slug === 'mimi') {
      return [
        {
          slug,
          title: 'mimi',
          kind: c.work.kinds.mimi ?? '',
          href: mimiAlive ? MIMI_URL : `${homeHref}#work`,
          external: mimiAlive,
          action: mimiAlive ? c.work.openSite : c.work.details,
        },
      ];
    }
    const row = published.get(slug);
    if (!row) return [];
    return [{ slug, title: row.title, kind: c.work.kinds[slug] ?? '', href: href(`/work/${slug}`), external: false, action: c.work.details }];
  });

  /*
   * What a search engine is told about this page: questions and answers in the
   * very words shown on it, and where it sits in the site. It is about the
   * layout's #person and #business — the business is the node that says
   * Dushanbe — and nothing here repeats or adds to either.
   *
   * Google shows FAQ rich results only for well-known government and health
   * sites, so this will not draw an FAQ snippet there; Yandex and other
   * engines still read the questions as the page's content.
   */
  const structuredData = graph(
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: fullTitle(t, c.metaTitle),
      description: describe(lang, facts),
      inLanguage: lang,
      isPartOf: { '@id': ids.website },
      about: [{ '@id': ids.person }, { '@id': ids.business }],
      primaryImageOfPage: { '@type': 'ImageObject', contentUrl: `${site.url}${PHOTO}`, caption: c.hero.photoAlt },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    breadcrumbs(lang, t, [{ name: c.crumbs.here, path: DUSHANBE_PATH }]),
  );

  return (
    <>
      <JsonLd data={structuredData} />

      <LocalHero
        crumbs={{ label: c.crumbsLabel, home: t.nav.home, homeHref, here: c.crumbs.here }}
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        sub={c.hero.sub}
        cta={c.hero.cta}
        ctaHref={startHref(lang)}
        promise={c.hero.promise}
        photo={{ src: PHOTO, alt: c.hero.photoAlt }}
      />

      <LocalWho
        title={c.who.title}
        body={c.who.body}
        more={c.who.more}
        moreHref={href('/about')}
      />

      <LocalServices
        title={c.services.title}
        note={c.services.note}
        rows={rows}
        termLabel={c.services.termLabel}
        moreLabel={c.services.more}
        more={more}
        all={c.services.all}
        allHref={href('/services')}
        prices={c.services.prices}
        pricesHref={href('/prices')}
      />

      <LocalWork
        title={c.work.title}
        note={c.work.note}
        items={work}
        all={c.work.all}
        allHref={href('/work')}
        home={c.work.home}
        homeHref={`${homeHref}#work`}
      />

      <LocalFaq title={c.faqTitle} note={c.faqNote} faq={faq} />

      <LocalClosing
        title={c.closing.title}
        sub={c.closing.sub}
        cta={c.closing.cta}
        ctaHref={startHref(lang)}
        or={c.closing.or}
        whatsapp={t.common.whatsapp}
        whatsappHref={whatsappHref(t)}
        telegramHref={`https://t.me/${site.contact.telegram}`}
        links={[
          { label: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
          { label: `Instagram @${site.contact.instagram}`, href: `https://instagram.com/${site.contact.instagram}` },
        ]}
        avatar={{ src: AVATAR, alt: c.closing.avatarAlt }}
      />
    </>
  );
}

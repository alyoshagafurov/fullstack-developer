import { site } from '@/lib/content/site';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/en';
import { absoluteUrl } from './metadata';
import type { PriceFigure } from './price';

/*
 * What a search engine is told about the person, the business and each page,
 * as schema.org JSON-LD.
 *
 * One person and one business, each with a fixed @id, described once in the
 * site layout; every page that mentions them points at that @id instead of
 * describing them again. Every value is one the owner gave (lib/content/site.ts)
 * or one the page itself shows.
 *
 * Left out on purpose:
 * - a street address or map point: he gave none, so only the city and country;
 * - opening hours: his are "roughly 10:00–23:00", and schema.org has no way to
 *   say "roughly" — a firm figure would be a promise he never made;
 * - ratings and Review/AggregateRating: Google ignores a business's markup of
 *   reviews on its own site and can penalise it. The reviews stay plain text.
 */

export type Node = Record<string, unknown>;

export const ids = {
  person: `${site.url}/#person`,
  business: `${site.url}/#business`,
  website: `${site.url}/#website`,
};

/** A @graph document from any number of nodes; missing ones are skipped. */
export function graph(...nodes: (Node | null | undefined | false)[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}

const AVATAR = `${site.url}/me/avatar.webp`;
const LOGO = `${site.url}/icon.png`;

const profiles = [
  `https://t.me/${site.contact.telegram}`,
  `https://instagram.com/${site.contact.instagram}`,
  site.contact.github,
];

function address(t: Dictionary): Node {
  return { '@type': 'PostalAddress', addressLocality: t.meta.place.city, addressCountry: 'TJ' };
}

/** Where he works from and whom he serves — the city, then the country. */
export function areaServed(t: Dictionary): Node[] {
  return [
    { '@type': 'City', name: t.meta.place.city, sameAs: 'https://en.wikipedia.org/wiki/Dushanbe' },
    { '@type': 'Country', name: t.meta.place.country, sameAs: 'https://en.wikipedia.org/wiki/Tajikistan' },
  ];
}

/** Every spelling of his name people search for, without the one the page already uses. */
function otherNames(name: string): string[] {
  const seen = new Set([name.toLowerCase()]);
  return [site.name, 'Alisher Gafurov', ...site.alsoKnownAs, site.brand].filter((n) => {
    const key = n.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * The person, the business and the site — the graph every page carries.
 *
 * Names and descriptions follow the page's language; the addresses do not.
 * Each @id is one entity, so it gets one url — the site's own address — on
 * every page, rather than /ru on the Russian pages and / on the English ones,
 * which gave the same person two conflicting homes. The language versions are
 * told apart by the pages' hreflang links, not by the entities.
 */
export function siteGraph({ t, priceRange }: { t: Dictionary; priceRange: string | null }): Node {
  const home = `${site.url}/`;

  const person: Node = {
    '@type': 'Person',
    '@id': ids.person,
    name: t.person.name,
    alternateName: otherNames(t.person.name),
    jobTitle: t.meta.jobTitles,
    description: t.meta.personDescription,
    image: AVATAR,
    url: home,
    email: site.contact.email,
    telephone: site.contact.phoneHref,
    address: address(t),
    worksFor: { '@id': ids.business },
    brand: { '@type': 'Brand', name: site.brand },
    knowsLanguage: ['ru', 'en', 'tg'],
    knowsAbout: [
      'Web development',
      'Online stores',
      'Telegram bots',
      'Telegram Mini Apps',
      'Next.js',
      'React',
      'TypeScript',
      'Node.js',
      'Python',
    ],
    sameAs: profiles,
  };

  const business: Node = {
    '@type': 'ProfessionalService',
    '@id': ids.business,
    name: t.meta.businessName,
    alternateName: [site.brand, site.domain],
    description: t.meta.siteDescription,
    url: home,
    image: AVATAR,
    logo: LOGO,
    telephone: site.contact.phoneHref,
    email: site.contact.email,
    address: address(t),
    areaServed: areaServed(t),
    ...(priceRange ? { priceRange } : {}),
    founder: { '@id': ids.person },
    knowsLanguage: ['ru', 'en', 'tg'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: site.contact.phoneHref,
      email: site.contact.email,
      url: `https://wa.me/${site.contact.whatsapp}`,
      availableLanguage: ['Russian', 'English', 'Tajik'],
    },
  };

  const website: Node = {
    '@type': 'WebSite',
    '@id': ids.website,
    url: `${site.url}/`,
    name: site.brand,
    alternateName: [site.domain, site.name, 'Alisher Gafurov'],
    description: t.meta.siteDescription,
    inLanguage: ['en', 'ru'],
    publisher: { '@id': ids.person },
  };

  return graph(person, business, website);
}

/** Home › … › this page. `trail` starts after the home page. */
export function breadcrumbs(lang: Locale, t: Dictionary, trail: { name: string; path: string }[]): Node {
  const steps = [{ name: t.nav.home, path: '/' }, ...trail];
  const here = steps[steps.length - 1]!;
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(lang, here.path)}#breadcrumb`,
    itemListElement: steps.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: absoluteUrl(lang, step.path),
    })),
  };
}

/** A price in somoni as an Offer, or nothing when the row carries no figure. */
export function offer(figure: PriceFigure | null, url: string): Node | null {
  if (!figure) return null;
  const spec: Node = { '@type': 'PriceSpecification', priceCurrency: 'TJS' };
  if (figure.kind === 'from') {
    spec.minPrice = figure.amount;
    if (figure.max) spec.maxPrice = figure.max;
  } else if (figure.kind === 'upTo') {
    spec.maxPrice = figure.amount;
  } else {
    spec.price = figure.amount;
  }
  return {
    '@type': 'Offer',
    url,
    priceCurrency: 'TJS',
    ...(figure.kind === 'exact' ? { price: figure.amount } : {}),
    priceSpecification: spec,
    offeredBy: { '@id': ids.business },
  };
}

/** One service, offered by the business, in Dushanbe and Tajikistan. */
export function serviceNode({
  lang,
  t,
  slug,
  name,
  description,
  figure,
}: {
  lang: Locale;
  t: Dictionary;
  slug: string;
  name: string;
  description: string;
  figure: PriceFigure | null;
}): Node {
  const url = absoluteUrl(lang, `/services/${slug}`);
  const priced = offer(figure, url);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    serviceType: name,
    description,
    url,
    // no inLanguage: schema.org defines it for creative works and events, not for a Service
    provider: { '@id': ids.business },
    areaServed: areaServed(t),
    ...(priced ? { offers: priced } : {}),
  };
}

/** A list of pages — the projects on /work, the services on /services. */
export function itemList(url: string, name: string, items: { name: string; url: string }[]): Node {
  return {
    '@type': 'ItemList',
    '@id': `${url}#list`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/** The price list as offers: each service with its starting price, as /prices shows it. */
export function offerCatalog(
  url: string,
  name: string,
  rows: { name: string; url: string; figure: PriceFigure | null }[],
): Node {
  return {
    '@type': 'OfferCatalog',
    '@id': `${url}#catalog`,
    name,
    itemListElement: rows.map((row) => ({
      ...(offer(row.figure, row.url) ?? { '@type': 'Offer', url: row.url, offeredBy: { '@id': ids.business } }),
      itemOffered: { '@type': 'Service', name: row.name, url: row.url, provider: { '@id': ids.business } },
    })),
  };
}

import type { Metadata } from 'next';

/*
 * Central SEO source of truth: brand, identity, canonical URL, keywords,
 * per-page metadata helpers and the Schema.org JSON-LD graph.
 *
 * ▸ Canonical domain is aly.lat (the brand). Override with NEXT_PUBLIC_SITE_URL
 *   if the primary domain changes. Connect aly.lat in Vercel as the primary
 *   domain so canonicals, OG and sitemap all resolve there.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aly.lat').replace(/\/+$/, '');

export const BRAND = 'ALY';
export const PERSON = 'Alisher Gafurov';
export const PERSON_RU = 'Алишер Гафуров';
export const EMAIL = 'gafurovalyosha@gmail.com';
export const PHONE = '+992918793231';
export const LOCALITY = 'Dushanbe';
export const LOCALITY_RU = 'Душанбе';
export const REGION = 'Tajikistan';
export const REGION_RU = 'Таджикистан';

/* Only REAL, existing profiles — a broken sameAs hurts entity matching. */
export const SAME_AS = [
  'https://t.me/alishergafurovv',
  'https://instagram.com/alishergafurow',
  'https://github.com/alyoshagafurov',
];

export const NAME_VARIANTS = ['Aly', 'Alyosha', 'Alyosha Gafurov', 'Алишер Гафуров', 'Алишер', 'aly.lat'];

export const KNOWS_ABOUT = [
  'Full-Stack Development', 'Frontend Development', 'Backend Development', 'Software Engineering',
  'Web Development', 'UI/UX Design', 'SaaS', 'CRM', 'Business Automation',
  'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'PostgreSQL', 'Tailwind CSS', 'SEO',
];

export const KEYWORDS = [
  'Alisher Gafurov', 'Алишер Гафуров', 'Aly', 'Alyosha', 'Alyosha Gafurov', 'aly.lat', 'ALY',
  'Full Stack Developer Tajikistan', 'Web Developer Tajikistan', 'Frontend Developer Tajikistan',
  'Backend Developer Tajikistan', 'Software Engineer Tajikistan',
  'Программист Таджикистан', 'Веб разработчик Таджикистан',
  'Разработка сайтов Душанбе', 'Разработка сайтов Таджикистан',
  'Создание сайтов Душанбе', 'Создание сайтов Таджикистан',
  'Next.js Developer', 'React Developer', 'Node.js Developer', 'TypeScript Developer', 'JavaScript Developer',
  'Full-Stack разработчик', 'веб-разработчик', 'разработка сайтов под ключ', 'SaaS', 'CRM',
];

export const DEFAULT_TITLE = 'Алишер Гафуров (Aly) — Full-Stack разработчик · Душанбе, Таджикистан';
export const DEFAULT_DESCRIPTION =
  'Алишер Гафуров (Aly) — Full-Stack разработчик и Software Engineer из Душанбе, Таджикистан, основатель ALY. Создаю сайты, веб-приложения, SaaS и CRM на Next.js, React, Node.js и TypeScript.';

/** Per-page metadata with a canonical URL and inherited/overridable OG. */
export function pageMetadata(opts: {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  const images = opts.ogImage ? [{ url: opts.ogImage }] : undefined;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords ?? KEYWORDS,
    alternates: { canonical: url },
    openGraph: { url, title: opts.title, description: opts.description, ...(images ? { images } : {}) },
    twitter: { title: opts.title, description: opts.description, ...(images ? { images } : {}) },
  };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

const personId = `${SITE_URL}/#person`;
const orgId = `${SITE_URL}/#organization`;
const siteId = `${SITE_URL}/#website`;

/** Site-wide Schema.org graph (Person, Organization ALY, WebSite, service). */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: PERSON,
        alternateName: NAME_VARIANTS,
        givenName: 'Alisher',
        familyName: 'Gafurov',
        url: SITE_URL,
        image: `${SITE_URL}/hero-portrait.jpg`,
        jobTitle: ['Full-Stack Developer', 'Software Engineer', 'Web Developer', 'UI/UX Designer'],
        description: DEFAULT_DESCRIPTION,
        email: `mailto:${EMAIL}`,
        telephone: PHONE,
        address: { '@type': 'PostalAddress', addressLocality: LOCALITY, addressCountry: 'TJ' },
        worksFor: { '@id': orgId },
        founder: { '@id': orgId },
        knowsAbout: KNOWS_ABOUT,
        knowsLanguage: ['ru', 'tg', 'en'],
        sameAs: SAME_AS,
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: BRAND,
        alternateName: 'ALY Studio',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon`, width: 512, height: 512 },
        image: `${SITE_URL}/opengraph-image`,
        description: 'ALY — студия Алишера Гафурова: сайты, веб-приложения, SaaS и CRM под ключ.',
        founder: { '@id': personId },
        foundingLocation: { '@type': 'Place', name: `${LOCALITY_RU}, ${REGION_RU}` },
        areaServed: [REGION, 'Worldwide'],
        sameAs: SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: SITE_URL,
        name: `${PERSON} — ${BRAND}`,
        description: DEFAULT_DESCRIPTION,
        inLanguage: ['ru', 'tg', 'en'],
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#service`,
        name: `${BRAND} — веб-разработка`,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        description: 'Разработка сайтов, веб-приложений, SaaS и CRM под ключ в Душанбе и по всему миру.',
        provider: { '@id': personId },
        areaServed: [{ '@type': 'Country', name: REGION }, { '@type': 'City', name: LOCALITY }, 'Worldwide'],
        serviceType: ['Web Development', 'Web Application Development', 'SaaS Development', 'CRM Development', 'UI/UX Design'],
        priceRange: '$$',
        address: { '@type': 'PostalAddress', addressLocality: LOCALITY, addressCountry: 'TJ' },
      },
    ],
  };
}

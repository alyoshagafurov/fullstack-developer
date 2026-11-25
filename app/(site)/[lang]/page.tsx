import type { Metadata } from 'next';
import {
  Hero,
  NotFor,
  Prices,
  Specs,
  Steps,
  Voices,
  Works,
  type Capture,
  type PriceRow,
  type ShowWork,
  type Voice,
} from '@/components/home/Showroom';
import { startHref } from '@/components/museum/links';
import { Closing } from '@/components/site/Closing';
import { isAlive } from '@/lib/alive';
import { blurOf } from '@/lib/blur';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { REVIEW_BUSINESS_MISSING, beforeAfter, visibleText, type BeforeAfter } from '@/lib/content/placeholders';
import { reviewShot } from '@/lib/content/review-shots';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';
import { priceFormatter } from '@/lib/price-display';
import { getPriceList } from '@/lib/prices';
import { pageMetadata } from '@/lib/seo/metadata';

/*
 * The page that answers «программист в Душанбе»: the role and the city lead
 * its title, used as written because it already ends on his name. It is the
 * address his Instagram, Telegram and the bot point to, so the query is this
 * page's alone: another page that leads with the same words only competes
 * with it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return pageMetadata({ lang, t, path: '/', title: t.meta.siteTitle, description: t.meta.siteDescription, absoluteTitle: true });
}

/*
 * The home page, in the order a careful client decides: what he does and the
 * promise (a draft in 1–3 days, pay only if you like it), the numbers, how a
 * project starts without risk, the work as «было → стало», who he is not for,
 * what clients say, and only then the prices — ending on one clear way in.
 *
 * Revalidated rather than fully static: cases, reviews and prices are
 * published from the admin and must reach the site without a redeploy.
 */
export const revalidate = 300;

/* Full-page captures of the live sites, for computer and phone. */
const CAPTURES: Record<string, { desktop: Capture; phone: Capture | null }> = {
  'arusdomod-shop': {
    desktop: { src: '/cases/arusdomod-desktop.webp', width: 1200, height: 3000 },
    phone: { src: '/cases/arusdomod-phone.webp', width: 420, height: 4200 },
  },
  'autoshine-store': {
    desktop: { src: '/cases/autoshine-store-desktop.webp', width: 1200, height: 3000 },
    phone: { src: '/cases/autoshine-store-phone.webp', width: 420, height: 4200 },
  },
};

/*
 * mimi, a marketing agency in Dushanbe: a live site he built that has no case
 * page in the admin yet, so it is described here and opens straight to the site.
 */
const MIMI = {
  url: 'https://www.mimitj.agency',
  desktop: { src: '/cases/mimi-desktop.webp', width: 1200, height: 2240 },
  phone: { src: '/cases/mimi-phone.webp', width: 420, height: 1370 },
  ru: { kind: 'Маркетинговое агентство', result: 'Сайт агентства: услуги, кейсы, тарифы и заявка на аудит — на трёх языках.' },
  en: { kind: 'Marketing agency', result: 'The agency’s site: services, cases, pricing and an audit request — in three languages.' },
} as const;

/* The first screen shows two real sites: a store on the laptop, the agency on the phone. */
const HERO_SCREENS = { desktop: CAPTURES['arusdomod-shop'].desktop, phone: MIMI.phone };

/*
 * The «было → стало» pair as the page may show it. Filtered here, on the
 * server: Works is a client component, so whatever it is handed is written
 * into the page's HTML as data, and a placeholder left out only at render
 * would still be read in the source. An empty string renders nothing.
 */
const shownPair = (pair: BeforeAfter): BeforeAfter => ({
  before: visibleText(pair.before) ?? '',
  after: visibleText(pair.after) ?? '',
});

/* The few prices shown on the home; the full list lives on /prices. */
const PRICE_PICKS = ['landing', 'sites', 'ecommerce', 'telegram-bots'];

export default async function HomePage() {
  const { lang, t } = await getDictionary();
  const [rawCases, testimonials, priceList, price] = await Promise.all([
    getPublishedCases(),
    getTestimonials(),
    getPriceList(lang),
    priceFormatter(lang),
  ]);
  const s = t.showroom;

  const ordered = [...rawCases].sort(
    (a, b) => Number(!!CAPTURES[b.slug]) - Number(!!CAPTURES[a.slug]) || Number(b.featured) - Number(a.featured),
  );
  const cases = (await localizeCases(ordered, lang)).slice(0, 2);
  const works: ShowWork[] = await Promise.all(
    cases.map(async (row) => {
      const capture = CAPTURES[row.slug];
      const [alive, blur, phoneBlur] = await Promise.all([
        isAlive(row.liveUrl),
        blurOf(capture?.desktop.src),
        blurOf(capture?.phone?.src),
      ]);
      return {
        blur,
        phoneBlur,
        slug: row.slug,
        title: row.title,
        kind: s.kinds[row.slug] ?? '',
        year: row.year,
        result: row.result.split(/(?<=[.!?])\s/)[0] ?? row.result,
        ...shownPair(beforeAfter(row.slug, lang, row.title)),
        host: row.liveUrl ? new URL(row.liveUrl).host : null,
        liveUrl: alive ? row.liveUrl : null,
        href: localePath(lang, `/work/${row.slug}`),
        desktop: CAPTURES[row.slug]?.desktop ?? null,
        shot: row.screenshots[0] || row.objectImage,
        phone: CAPTURES[row.slug]?.phone ?? null,
      };
    }),
  );

  const mimi = MIMI[lang === 'ru' ? 'ru' : 'en'];
  const [mimiAlive, mimiBlur, mimiPhoneBlur, heroBlur] = await Promise.all([
    isAlive(MIMI.url),
    blurOf(MIMI.desktop.src),
    blurOf(MIMI.phone.src),
    blurOf(HERO_SCREENS.desktop.src),
  ]);
  works.push({
    slug: 'mimi',
    title: 'mimi',
    kind: mimi.kind,
    year: '',
    result: mimi.result,
    ...shownPair(beforeAfter('mimi', lang)),
    host: 'mimitj.agency',
    liveUrl: mimiAlive ? MIMI.url : null,
    href: null,
    desktop: MIMI.desktop,
    shot: MIMI.desktop.src,
    phone: MIMI.phone,
    blur: mimiBlur,
    phoneBlur: mimiPhoneBlur,
  });

  const langOf = (text: string) => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const voices: Voice[] = [...testimonials]
    .filter((row) => row.text.length <= 260)
    .sort((a, b) => Number(langOf(a.text) !== lang) - Number(langOf(b.text) !== lang))
    .map((row) => ({
      id: row.id,
      text: row.text,
      name: row.name,
      // the business first, then the person's role in it: "mimi agency · SEO";
      // with neither, a placeholder in development and nothing on the live site
      business: visibleText([row.company, row.role].filter(Boolean).join(' · ') || REVIEW_BUSINESS_MISSING[lang]) ?? '',
      lang: langOf(row.text),
      shot: reviewShot(row),
    }));

  const prices: PriceRow[] = PRICE_PICKS.flatMap((slug) => {
    const row = priceList.find((item) => item.slug === slug);
    if (!row) return [];
    return [
      {
        slug,
        title: row.title,
        term: row.term,
        price: price(row.price) ?? t.common.priceOnRequest,
        href: localePath(lang, `/services/${slug}`),
      },
    ];
  });

  return (
    <>
      <Hero
        eyebrow={s.eyebrow}
        title={s.title}
        sub={s.sub}
        cta={s.cta}
        ctaHref={startHref(lang)}
        ctaNote={s.ctaNote}
        screens={{ ...HERO_SCREENS, label: s.screens, desktopBlur: heroBlur, phoneBlur: mimiPhoneBlur }}
      />
      <Specs label={s.specsLabel} items={s.specs} />
      <Steps title={s.stepsTitle} steps={s.steps} cta={s.cta} ctaHref={startHref(lang)} photo="/me/call.webp" alt={s.stepsAlt} />
      <Works
        id="work"
        title={s.workTitle}
        // the «было → стало» half of the line only while a pair is actually shown
        sub={works.some((work) => work.before || work.after) ? s.workSub : s.workSubPlain}
        all={s.workAll}
        allHref={localePath(lang, '/work')}
        labels={s.labels}
        openSite={s.openSite}
        details={s.details}
        works={works}
      />
      <NotFor
        eyebrow={s.notForEyebrow}
        title={s.notForTitle}
        line={s.notForLine}
        accent={s.notForAccent}
        cta={s.cta}
        ctaHref={startHref(lang)}
        more={s.notForMore}
        moreHref={localePath(lang, '/about')}
        photo="/me/mirror.webp"
        alt={s.notForAlt}
        focus="50% 46%"
      />
      <Voices
        title={s.voicesTitle}
        voices={voices}
        prev={s.prev}
        next={s.next}
        all={s.voicesAll}
        allHref={localePath(lang, '/reviews')}
        shotCaption={s.shotCaption}
      />
      <Prices title={s.pricesTitle} sub={t.prices.lede} rows={prices} all={s.pricesAll} allHref={localePath(lang, '/prices')} />
      <Closing lang={lang} t={t} />
    </>
  );
}

import { Hero, type HeroDoor } from '@/components/site/Hero';
import {
  Bespoke,
  Collections,
  Contact,
  Craft,
  Details,
  Origin,
  Philosophy,
  SelectedWorks,
  Stories,
  type Collection,
  type Story,
  type Work,
} from '@/components/site/Sections';
import { startHref, whatsappHref } from '@/components/museum/links';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page in ten rooms, each one huge headline and one small line:
 *   the word and him · one person · what we build · the work · the details ·
 *   the workshop · made to measure · clients · Dushanbe · the way in.
 *
 * Revalidated rather than fully static: cases, reviews and prices are
 * published from the admin and must reach the site without a redeploy.
 */
export const revalidate = 300;

/* Which service page each direction opens. */
const SERVICE_OF = {
  sites: 'sites',
  stores: 'ecommerce',
  bots: 'telegram-bots',
  apps: 'web-apps',
} as const;

export default async function HomePage() {
  const { lang, t } = await getDictionary();
  const [rawCases, testimonials, prices, price] = await Promise.all([
    getPublishedCases(),
    getTestimonials(),
    getPriceList(lang),
    priceFormatter(lang),
  ]);
  const l = t.landing;

  const featured = rawCases.filter((row) => row.featured);
  const cases = await localizeCases(featured.length >= 3 ? featured : rawCases, lang);
  const works: Work[] = cases.slice(0, 5).map((row) => ({
    slug: row.slug,
    href: localePath(lang, `/work/${row.slug}`),
    title: row.title,
    client: row.client,
    year: row.year,
    image: row.screenshots[0] || row.objectImage,
  }));
  const detail = cases.find((row) => row.screenshots[1])?.screenshots[1] ?? works[0]?.image ?? '/me/night-code.webp';

  const priceOf = new Map(prices.map((row) => [row.slug, row.price]));
  const collections: Collection[] = t.home.directions.map((item) => {
    const service = SERVICE_OF[item.key as keyof typeof SERVICE_OF];
    return {
      key: item.key,
      word: item.word,
      script: item.script,
      href: localePath(lang, `/services/${service}`),
      price: price(priceOf.get(item.price)),
    };
  });
  /* The three small doors on the first screen: three other finished works. */
  const doors: HeroDoor[] = works.slice(1, 4).map((work) => ({
    key: work.slug,
    label: work.title,
    href: work.href,
    image: work.image,
  }));

  const langOf = (text: string) => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const stories: Story[] = [...testimonials]
    .filter((row) => row.text.length <= 320)
    .sort((a, b) => Number(langOf(a.text) !== lang) - Number(langOf(b.text) !== lang))
    .map((row) => ({
      text: row.text,
      name: row.name,
      role: [row.role, row.company].filter(Boolean).join(', ') || null,
      avatar: row.avatarUrl,
      lang: langOf(row.text),
    }));

  return (
    <>
      <Hero
        word="ALISHER"
        title={l.heroTitle}
        script={l.heroScript}
        cta={l.heroCta}
        ctaHref={startHref(lang)}
        alt={l.heroAlt}
        doors={doors}
      />
      <Philosophy
        title={l.philosophyTitle}
        hand={l.philosophyHand}
        note={l.philosophyNote}
        more={t.home.personMore}
        moreHref={localePath(lang, '/about')}
        alt={t.home.personAlt}
      />
      <Collections title={l.collectionsTitle} note={l.collectionsNote} from={l.from} items={collections} />
      <SelectedWorks title={l.worksTitle} note={l.worksNote} all={l.worksAll} allHref={localePath(lang, '/work')} works={works} />
      <Details title={l.detailTitle} note={l.detailNote} image={detail} alt="" />
      <Craft title={l.craftTitle} hand={l.craftHand} note={l.craftNote} photoAlt={t.home.personAlt} />
      <Bespoke
        title={l.bespokeTitle}
        hand={l.bespokeHand}
        note={l.bespokeNote}
        days={l.bespokeDays}
        cta={l.bespokeCta}
        ctaHref={startHref(lang)}
      />
      <Stories
        title={l.storiesTitle}
        note={l.storiesNote}
        all={l.storiesAll}
        allHref={localePath(lang, '/reviews')}
        prev={l.prev}
        next={l.next}
        stories={stories}
      />
      <Origin
        title={l.originTitle}
        note={l.originNote}
        clockLabel={l.originClock}
        online={l.originOnline}
        offline={l.originOffline}
        lang={lang}
        alt=""
      />
      <Contact
        title={l.closeTitle}
        note={l.closeNote}
        form={l.closeForm}
        formHref={startHref(lang)}
        whatsapp={t.common.whatsapp}
        whatsappHref={whatsappHref(t)}
        links={[
          { label: `Telegram @${site.contact.telegram}`, href: `https://t.me/${site.contact.telegram}` },
          { label: `Instagram @${site.contact.instagram}`, href: `https://instagram.com/${site.contact.instagram}` },
          { label: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
        ]}
      />
    </>
  );
}

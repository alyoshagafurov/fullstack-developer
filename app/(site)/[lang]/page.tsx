import { LensHero } from '@/components/site/LensHero';
import { Manifesto } from '@/components/site/Manifesto';
import { BentoGrid } from '@/components/site/BentoGrid';
import { StackedWorks, type Work } from '@/components/site/StackedWorks';
import { DirectionsMarquee, type Direction } from '@/components/site/DirectionsMarquee';
import { Closing } from '@/components/site/Closing';
import { startHref, whatsappHref } from '@/components/museum/links';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page, built from the three concepts the owner picked:
 *   the lens (D)       — his photo in grey, a circle of colour under the pointer
 *   the statement (B)  — one huge sentence with pictures set in it like words
 *   the bento (E)      — every useful fact as a small living tile
 *   the pile (B + D)   — the work as stacking cards that colour up
 *   the line (B)       — the directions running past as huge words
 *   the door (D)       — a warm block on black, and the WhatsApp badge
 *
 * Revalidated rather than fully static: cases, reviews and prices are
 * published from the admin and must reach the site without a redeploy.
 */
export const revalidate = 300;

export default async function HomePage() {
  const { lang, t } = await getDictionary();
  const [rawCases, testimonials, prices, price] = await Promise.all([
    getPublishedCases(),
    getTestimonials(),
    getPriceList(lang),
    priceFormatter(lang),
  ]);

  const featured = rawCases.filter((row) => row.featured);
  const cases = await localizeCases(featured.length > 0 ? featured : rawCases, lang);
  const works: Work[] = cases.map((row) => ({
    slug: row.slug,
    href: localePath(lang, `/work/${row.slug}`),
    title: row.title,
    caption: row.year,
    image: row.screenshots[0] || row.objectImage,
  }));

  const priceOf = new Map(prices.map((row) => [row.slug, row.price]));
  const directions: Direction[] = t.home.directions.map((item) => ({
    key: item.key,
    word: item.word,
    href: startHref(lang, item.type),
    price: price(priceOf.get(item.price)),
  }));

  const langOf = (text: string) => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const reviews = [...testimonials]
    .filter((row) => row.text.length <= 240)
    .sort((a, b) => Number(langOf(a.text) !== lang) - Number(langOf(b.text) !== lang))
    .map((row) => ({ text: row.text, name: row.name, lang: langOf(row.text) }));

  const h = t.home;

  return (
    <>
      <LensHero
        name={t.person.name}
        offer={`${h.heroOffer} ${h.heroScript}`}
        hint={h.lensHint}
        quote={t.common.getQuote}
        whatsapp={t.common.whatsapp}
        startHref={startHref(lang)}
        whatsappHref={whatsappHref(t)}
        photoAlt={t.person.photoAlt}
      />
      <Manifesto
        words={h.manifesto}
        shot={works[0]?.image ?? null}
        note={h.heroNote}
        badge={h.badge}
        whatsappHref={whatsappHref(t)}
        whatsappLabel={t.common.whatsapp}
      />
      <BentoGrid
        lang={lang}
        copy={{
          ...h.bento,
          replyWithin: t.common.replyWithin,
          draft: h.draftTitle.join(' '),
          personTitle: h.personTitle.join(' '),
          personMore: h.personMore,
        }}
        price={price(priceOf.get('landing'))}
        reviews={reviews}
        whatsappHref={whatsappHref(t)}
        aboutHref={localePath(lang, '/about')}
      />
      <StackedWorks
        title={h.workTitle}
        note={h.workNote}
        works={works}
        allHref={localePath(lang, '/work')}
        allLabel={h.workAll}
        openLabel={h.workOpen}
      />
      <DirectionsMarquee title={h.directionsTitle} hint={h.bento.directionsHint} fromLabel={h.directionsFrom} items={directions} />
      <Closing lang={lang} t={t} />
    </>
  );
}

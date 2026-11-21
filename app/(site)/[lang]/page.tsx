import { LivingRoom } from '@/components/home/LivingRoom';
import { Corridor, type Work } from '@/components/home/Corridor';
import { Rooms, type Room } from '@/components/home/Rooms';
import { Glass, type GlassVoice } from '@/components/home/Glass';
import { Doorway, Draft, Portrait } from '@/components/home/Spaces';
import { startHref, whatsappHref } from '@/components/museum/links';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page as a dark house at night, and he lives in it. Each room is lit
 * its own way and none repeats another: the living room with him at the
 * island, the corridor of work, the slatted wall of directions, his portrait
 * under a picture light, the glass partition of reviews, a single line of
 * light for the first draft, and the cold doorway out.
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
  const rooms: Room[] = t.home.directions.map((item) => ({
    key: item.key,
    word: item.word,
    script: item.script,
    price: price(priceOf.get(item.price)),
    href: startHref(lang, item.type),
    cool: item.key === 'bots',
  }));

  // Reviews in the page's language first.
  const langOf = (text: string) => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const voices: GlassVoice[] = [...testimonials]
    .sort((a, b) => Number(langOf(a.text) !== lang) - Number(langOf(b.text) !== lang))
    .map((row) => ({
      id: row.id,
      text: row.text,
      name: row.name,
      who: [row.role, row.company].filter(Boolean).join(', ') || null,
      lang: langOf(row.text),
    }));

  return (
    <>
      <LivingRoom
        name={t.person.name.toUpperCase().split(' ')}
        offer={t.home.heroOffer}
        script={t.home.heroScript}
        role={t.home.heroRole}
        note={t.home.heroNote}
        quote={t.common.getQuote}
        whatsapp={t.common.whatsapp}
        startHref={startHref(lang)}
        whatsappHref={whatsappHref(t)}
        photoAlt={t.person.photoAlt}
      />
      <Corridor
        title={t.home.workTitle}
        script={t.home.workScript}
        note={t.home.workNote}
        hint={t.home.walkHint}
        works={works}
        allHref={localePath(lang, '/work')}
        allLabel={t.home.workAll}
        openLabel={t.home.workOpen}
      />
      <Rooms title={t.home.directionsTitle} note={t.home.directionsNote} fromLabel={t.home.directionsFrom} rooms={rooms} />
      <Portrait lang={lang} t={t} />
      <Glass
        title={t.home.glassTitle}
        note={t.home.voicesNote}
        allLabel={t.home.voicesAll}
        allHref={localePath(lang, '/reviews')}
        voices={voices}
      />
      <Draft t={t} />
      <Doorway lang={lang} t={t} />
    </>
  );
}

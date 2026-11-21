import { Choices, Closing, Draft, Feature, Hero, Person, Tiles, type Choice, type Work } from '@/components/apple/Sections';
import { Highlights, type Highlight } from '@/components/apple/Highlights';
import { startHref } from '@/components/museum/links';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page, in the manner of apple.com: one idea per screen, a short
 * headline, one line, two doors. Him first; then one work on the whole screen;
 * every work as tiles; the four directions; who does the work; what clients
 * say; how a job starts; the way out. Light or dark follows the theme.
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
    live: row.liveUrl,
  }));
  const [lead, ...rest] = works;

  const priceOf = new Map(prices.map((row) => [row.slug, row.price]));
  const choices: Choice[] = t.home.directions.map((item) => ({
    key: item.key,
    word: item.word,
    line: item.script,
    price: price(priceOf.get(item.price)),
    href: startHref(lang, item.type),
  }));

  // Reviews in the page's language first.
  const langOf = (text: string) => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const highlights: Highlight[] = [...testimonials]
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
      <Hero lang={lang} t={t} />
      {lead && <Feature work={lead} t={t} />}
      <Tiles works={rest.length > 0 ? rest : works} t={t} allHref={localePath(lang, '/work')} />
      <Choices t={t} choices={choices} />
      <Person lang={lang} t={t} />
      <Highlights
        title={t.home.glassTitle}
        allLabel={t.home.voicesAll}
        allHref={localePath(lang, '/reviews')}
        items={highlights}
      />
      <Draft t={t} />
      <Closing lang={lang} t={t} />
    </>
  );
}

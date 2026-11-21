import { Entrance, type Exhibit } from '@/components/museum/home/Entrance';
import { WorkHall } from '@/components/museum/home/WorkHall';
import { Directions, type Direction } from '@/components/museum/home/Directions';
import { Voices, type Voice } from '@/components/museum/home/Voices';
import { ClosingHall, DraftHall, PersonHall } from '@/components/museum/home/Halls';
import { startHref } from '@/components/museum/links';
import { getPublishedCases, getTestimonials, localizeCases, type LocalCase } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page as a night museum: the entrance with one work lit, the long
 * wall of work, the four halls to choose from, a client's voice, the person,
 * the first draft, and the way out. Each hall is one headline and one small
 * label; nothing here asks to be read line by line.
 *
 * Revalidated rather than fully static: cases, reviews and prices are
 * published from the admin and must reach the site without a redeploy.
 */
export const revalidate = 300;

/* Which work stands for which direction, by preference; the first published one that exists wins. */
const DIRECTION_WORK: Record<string, string[]> = {
  sites: ['python-academy', 'parfumeria'],
  stores: ['arusdomod-shop', 'tajshop', 'autoshine-store'],
  bots: [],
  apps: ['autoshine-store', 'python-academy'],
};
const DIRECTION_PHOTO: Record<string, string> = {
  sites: '/gallery/work-desk.webp',
  stores: '/gallery/work-desk.webp',
  bots: '/gallery/work-phone.webp',
  apps: '/gallery/work-desk.webp',
};

const cover = (row: LocalCase) => row.screenshots[0] || row.objectImage;

/** The first sentence or two of a review, long enough to stand as a headline. */
function splitReview(text: string): { lead: string; rest: string } {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [clean];
  let lead = sentences[0] ?? clean;
  let used = 1;
  while (lead.length < 40 && used < sentences.length) lead = `${lead} ${sentences[used++]}`;
  if (lead.length > 110) {
    // Too long to stand as a headline: the whole review goes to the corner instead.
    const cut = lead.slice(0, 90);
    return { lead: `${cut.slice(0, cut.lastIndexOf(' '))}…`, rest: clean };
  }
  return { lead: lead.replace(/[.,]+$/, ''), rest: sentences.slice(used).join(' ') };
}

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

  const works: Exhibit[] = cases.map((row) => ({
    slug: row.slug,
    href: localePath(lang, `/work/${row.slug}`),
    title: row.title,
    // The client line is dropped when it only repeats the title.
    caption: [
      row.client && !row.client.toLowerCase().startsWith(row.title.toLowerCase()) ? row.client : null,
      row.year,
    ]
      .filter(Boolean)
      .join(' · '),
    image: cover(row),
  }));

  const bySlug = new Map(cases.map((row) => [row.slug, row]));
  const priceOf = new Map(prices.map((row) => [row.slug, row.price]));

  const directions: Direction[] = t.home.directions.map((item) => {
    const work = DIRECTION_WORK[item.key]?.map((slug) => bySlug.get(slug)).find(Boolean);
    return {
      key: item.key,
      word: item.word,
      script: item.script,
      price: price(priceOf.get(item.price)),
      href: startHref(lang, item.type),
      image: work ? cover(work) : DIRECTION_PHOTO[item.key] ?? '/gallery/work-desk.webp',
    };
  });

  const voices: Voice[] = testimonials
    .map((row) => ({
    id: row.id,
    ...splitReview(row.text),
    name: row.name,
    who: [row.role, row.company].filter(Boolean).join(', ') || null,
    lang: /[а-яё]/i.test(row.text) ? 'ru' : 'en',
    }))
    // Reviews in the page's language first, then those whose first line already reads as a headline.
    .sort(
      (a, b) =>
        Number(a.lang !== lang) - Number(b.lang !== lang) ||
        Number(a.lead.endsWith('…')) - Number(b.lead.endsWith('…')),
    );

  return (
    <>
      <Entrance lang={lang} t={t} exhibit={works[0] ?? null} />
      <WorkHall t={t} works={works} allHref={localePath(lang, '/work')} />
      <Directions
        title={t.home.directionsTitle}
        note={t.home.directionsNote}
        fromLabel={t.home.directionsFrom}
        items={directions}
      />
      {voices.length > 0 && (
        <Voices
          title={t.home.voicesTitle}
          note={t.home.voicesNote}
          allLabel={t.home.voicesAll}
          allHref={localePath(lang, '/reviews')}
          items={voices}
        />
      )}
      <PersonHall lang={lang} t={t} />
      <DraftHall t={t} />
      <ClosingHall lang={lang} t={t} />
    </>
  );
}

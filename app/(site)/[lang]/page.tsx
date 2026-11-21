import { Finale, Hero, Lineup, Manifesto, Specs, Story, Voices, Works, type Capture, type Line, type ShowWork, type Voice } from '@/components/home/Showroom';
import { startHref, whatsappHref } from '@/components/museum/links';
import { isAlive } from '@/lib/alive';
import { blurOf } from '@/lib/blur';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page, in the manner of Apple and Porsche: a black stage where one
 * of his sites grows to fill the screen, the numbers that matter, the work as
 * a range you choose from, the four kinds of work side by side, the person,
 * the clients, and one clear way to start.
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
  'python-academy': {
    desktop: { src: '/cases/python-academy-desktop.webp', width: 1200, height: 2368 },
    phone: null,
  },
};

export default async function HomePage() {
  const { lang, t } = await getDictionary();
  const [rawCases, testimonials, prices, price] = await Promise.all([
    getPublishedCases(),
    getTestimonials(),
    getPriceList(lang),
    priceFormatter(lang),
  ]);
  const s = t.showroom;

  const ordered = [...rawCases].sort(
    (a, b) => Number(!!CAPTURES[b.slug]) - Number(!!CAPTURES[a.slug]) || Number(b.featured) - Number(a.featured),
  );
  const cases = (await localizeCases(ordered, lang)).slice(0, 3);
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
        client: row.client,
        result: row.result.split(/(?<=[.!?])\s/)[0] ?? row.result,
        host: row.liveUrl ? new URL(row.liveUrl).host : null,
        liveUrl: alive ? row.liveUrl : null,
        href: localePath(lang, `/work/${row.slug}`),
        desktop: CAPTURES[row.slug]?.desktop ?? null,
        shot: row.screenshots[0] || row.objectImage,
        phone: CAPTURES[row.slug]?.phone ?? null,
      };
    }),
  );

  const priceOf = new Map(prices.map((row) => [row.slug, row.price]));
  const lines: Line[] = t.home.directions.map((item) => ({
    key: item.key,
    word: item.word,
    script: item.script,
    price: price(priceOf.get(item.price)),
    href: startHref(lang, item.type),
  }));

  const langOf = (text: string) => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const voices: Voice[] = [...testimonials]
    .filter((row) => row.text.length <= 260)
    .sort((a, b) => Number(langOf(a.text) !== lang) - Number(langOf(b.text) !== lang))
    .map((row) => ({
      text: row.text,
      name: row.name,
      role: [row.role, row.company].filter(Boolean).join(', ') || null,
      lang: langOf(row.text),
    }));

  return (
    <>
      <Hero
        eyebrow={s.eyebrow}
        title={s.title}
        sub={s.sub}
        cta={s.cta}
        ctaHref={startHref(lang)}
        seeWork={s.seeWork}
        seeWorkHref="#work"
      />
      <Manifesto text={s.manifesto} accent={s.manifestoAccent} />
      <Specs items={s.specs} />
      <Works
        id="work"
        title={s.workTitle}
        sub={s.workSub}
        all={s.workAll}
        allHref={localePath(lang, '/work')}
        labels={s.labels}
        openSite={s.openSite}
        details={s.details}
        works={works}
      />
      <Lineup title={s.lineTitle} sub={s.lineSub} from={s.from} choose={s.choose} lines={lines} />
      <Story
        eyebrow={s.storyEyebrow}
        title={s.storyTitle}
        text={s.storyText}
        more={s.storyMore}
        moreHref={localePath(lang, '/about')}
        photo="/me/blue-street.webp"
        alt={t.home.personAlt}
      />
      <Voices title={s.voicesTitle} voices={voices} prev={s.prev} next={s.next} />
      <Finale
        title={s.finalTitle}
        sub={s.finalSub}
        cta={s.cta}
        ctaHref={startHref(lang)}
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

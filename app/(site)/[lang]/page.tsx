import { ColourStage } from '@/components/stage/ColourStage';
import { StageHero, type RibbonWork } from '@/components/stage/StageHero';
import { CaseChapter, type Capture, type Chapter } from '@/components/stage/CaseChapter';
import { Directions, Person, type Voice, type Way } from '@/components/stage/Rooms';
import { Contact } from '@/components/site/Contact';
import { startHref, whatsappHref } from '@/components/museum/links';
import { isAlive } from '@/lib/alive';
import { caseColour, NEUTRAL } from '@/lib/case-colour';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { getPriceList } from '@/lib/prices';
import { priceFormatter } from '@/lib/price-display';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page. The site is the frame and the work is the picture: a
 * neutral first screen with the work running past, then every project on a
 * screen of its own colour, inside a computer or a phone the visitor
 * switches; then what you need, who builds it, and the way in. The whole page
 * takes the colour of whatever is in front of the reader (ColourStage).
 *
 * Revalidated rather than fully static: cases, reviews and prices are
 * published from the admin and must reach the site without a redeploy.
 */
export const revalidate = 300;

/* Full-page captures of the live sites (desktop and phone), by case slug. */
const CAPTURES: Record<string, { desktop: Capture; phone: Capture }> = {
  'arusdomod-shop': {
    desktop: { src: '/cases/arusdomod-desktop.webp', width: 1440, height: 4500 },
    phone: { src: '/cases/arusdomod-phone.webp', width: 640, height: 9695 },
  },
  'autoshine-store': {
    desktop: { src: '/cases/autoshine-store-desktop.webp', width: 1440, height: 4500 },
    phone: { src: '/cases/autoshine-store-phone.webp', width: 640, height: 9695 },
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
  const s = t.stage;
  const l = t.landing;

  /* Captured ones lead (they show best), then featured, then the rest. */
  const ordered = [...rawCases].sort(
    (a, b) => Number(!!CAPTURES[b.slug]) - Number(!!CAPTURES[a.slug]) || Number(b.featured) - Number(a.featured),
  );
  const cases = (await localizeCases(ordered, lang)).slice(0, 6);

  const chapters: Chapter[] = await Promise.all(
    cases.map(async (row, i) => {
      const capture = CAPTURES[row.slug];
      const shots = row.screenshots.length > 0 ? row.screenshots : [row.objectImage];
      const desktop: Capture[] = capture ? [capture.desktop] : shots.map((src) => ({ src, width: 1440, height: 900 }));
      const [colour, alive] = await Promise.all([caseColour(desktop[0].src), isAlive(row.liveUrl)]);
      return {
        slug: row.slug,
        index: i + 1,
        title: row.title,
        year: row.year,
        client: row.client,
        line: row.result.split(/(?<=[.!?])\s/)[0] ?? row.result,
        liveUrl: alive ? row.liveUrl : null,
        href: localePath(lang, `/work/${row.slug}`),
        desktop,
        phone: capture ? [capture.phone] : null,
        colour,
      };
    }),
  );

  const ribbon: RibbonWork[] = chapters.map((c) => ({
    slug: c.slug,
    title: c.title,
    host: c.liveUrl ? new URL(c.liveUrl).host : c.title,
    image: cases.find((row) => row.slug === c.slug)?.screenshots[0] ?? c.desktop[0].src,
    href: `#case-${c.slug}`,
    colour: c.colour,
  }));

  const priceOf = new Map(prices.map((row) => [row.slug, row.price]));
  const ways: Way[] = t.home.directions.map((item) => ({
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

  const personPhoto = '/me/blue-street.webp';
  const personColour = await caseColour(personPhoto);

  return (
    <>
      <ColourStage />
      <StageHero
        eyebrow={s.eyebrow}
        title={s.title}
        script={s.script}
        note={s.note}
        cta={s.cta}
        ctaHref={startHref(lang)}
        whatsapp={t.common.whatsapp}
        whatsappHref={whatsappHref(t)}
        hint={s.ribbonHint}
        scrollHint={s.scrollHint}
        works={ribbon}
        neutral={NEUTRAL}
      />
      {chapters.map((chapter) => (
        <CaseChapter key={chapter.slug} chapter={chapter} labels={s} />
      ))}
      <Directions title={l.collectionsTitle} note={l.collectionsNote} from={l.from} ways={ways} colour={NEUTRAL} />
      <Person
        title={l.philosophyTitle}
        hand={l.philosophyHand}
        note={l.philosophyNote}
        count="50+"
        countLabel={t.home.bento.projects}
        more={t.home.personMore}
        moreHref={localePath(lang, '/about')}
        photo={personPhoto}
        photoAlt={t.home.personAlt}
        voices={voices}
        prev={l.prev}
        next={l.next}
        colour={personColour}
      />
      <div data-stage data-tone="stage" data-bg={NEUTRAL.bg} data-ink={NEUTRAL.ink} data-accent={NEUTRAL.accent} data-dark="0">
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
      </div>
    </>
  );
}

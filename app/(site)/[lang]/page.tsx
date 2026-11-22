import { Finale, Hero, Manifesto, Specs, Story, Voices, Works, type Capture, type ShowWork, type Voice } from '@/components/home/Showroom';
import { startHref, whatsappHref } from '@/components/museum/links';
import { isAlive } from '@/lib/alive';
import { blurOf } from '@/lib/blur';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The home page, in the manner of Apple and Porsche: a black stage where one
 * of his sites grows to fill the screen, the numbers that matter, three of his sites one after another, the person,
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

export default async function HomePage() {
  const { lang, t } = await getDictionary();
  const [rawCases, testimonials] = await Promise.all([getPublishedCases(), getTestimonials()]);
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

  const mimi = MIMI[lang === 'ru' ? 'ru' : 'en'];
  const [mimiAlive, mimiBlur, mimiPhoneBlur] = await Promise.all([isAlive(MIMI.url), blurOf(MIMI.desktop.src), blurOf(MIMI.phone.src)]);
  works.push({
    slug: 'mimi',
    title: 'mimi',
    kind: mimi.kind,
    year: '',
    client: null,
    result: mimi.result,
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

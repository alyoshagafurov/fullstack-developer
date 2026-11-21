import type { Metadata } from 'next';
import { CityExperience, type CityWork } from '@/components/city/CityExperience';
import { startHref, whatsappHref } from '@/components/museum/links';
import { isAlive } from '@/lib/alive';
import { getPublishedCases, localizeCases } from '@/lib/cases';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * Prototype of the home as a night city you fly through: the arrival and the
 * work district. Kept off the real home until the owner has tried it on his
 * computer and his phone.
 */
export const revalidate = 300;
export const metadata: Metadata = { robots: { index: false, follow: false } };

/* What each tower shows: a full-page capture for a computer and, when made, for a phone. */
const TOWERS: Record<string, Pick<CityWork, 'desktop' | 'phone'>> = {
  'arusdomod-shop': {
    desktop: { image: '/city/arus-desktop.webp', width: 1024, height: 3200 },
    phone: { image: '/city/arus-phone.webp', width: 420, height: 4000 },
  },
  'autoshine-store': {
    desktop: { image: '/city/autoshine-desktop.webp', width: 1024, height: 3200 },
    phone: { image: '/city/autoshine-phone.webp', width: 420, height: 4000 },
  },
  'python-academy': {
    desktop: { image: '/city/python-academy-desktop.webp', width: 1024, height: 640 },
    phone: null,
  },
};

export default async function CityPage() {
  const { lang, t } = await getDictionary();
  const c = t.city;
  const cases = await localizeCases(
    (await getPublishedCases()).filter((row) => TOWERS[row.slug]),
    lang,
  );
  const order = Object.keys(TOWERS);
  cases.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  const works: CityWork[] = await Promise.all(
    cases.map(async (row) => ({
      slug: row.slug,
      title: row.title,
      kind: c.kinds[row.slug] ?? '',
      line: row.result.split(/(?<=[.!?])\s/)[0] ?? row.result,
      meta: [row.client, row.year].filter(Boolean).join(' · '),
      liveUrl: (await isAlive(row.liveUrl)) ? row.liveUrl : null,
      href: localePath(lang, `/work/${row.slug}`),
      ...TOWERS[row.slug],
    })),
  );

  return (
    <CityExperience
      copy={{ ...c, name: t.person.name, whatsapp: t.common.whatsapp }}
      works={works}
      ctaHref={startHref(lang)}
      whatsappHref={whatsappHref(t)}
      avatar="/me/blue-street.webp"
    />
  );
}

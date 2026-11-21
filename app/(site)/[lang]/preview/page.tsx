import type { Metadata } from 'next';
import { ColourStage } from '@/components/stage/ColourStage';
import { StageHero, type RibbonWork } from '@/components/stage/StageHero';
import { CaseChapter, type Chapter } from '@/components/stage/CaseChapter';
import { Contact } from '@/components/site/Sections';
import { startHref, whatsappHref } from '@/components/museum/links';
import { caseColour, NEUTRAL } from '@/lib/case-colour';
import { getPublishedCases, localizeCases } from '@/lib/cases';
import { site } from '@/lib/content/site';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * A prototype of the next home page, kept off the real one until the owner
 * has tried it: the first screen and one project. The page takes the colour
 * of the work in front of the reader.
 */
export const revalidate = 300;

export const metadata: Metadata = { robots: { index: false, follow: false } };

/* Full-page captures of the live sites, desktop and phone, by case slug. */
const CAPTURES: Record<string, { desktop: Chapter['desktop']; phone: Chapter['phone'] }> = {
  'arusdomod-shop': {
    desktop: { src: '/cases/arusdomod-desktop.webp', width: 1440, height: 4500 },
    phone: { src: '/cases/arusdomod-phone.webp', width: 640, height: 9695 },
  },
};

export default async function PreviewPage() {
  const { lang, t } = await getDictionary();
  const s = t.stage;
  const raw = await getPublishedCases();
  const cases = await localizeCases(raw, lang);

  const works: RibbonWork[] = await Promise.all(
    cases.map(async (row) => {
      const image = row.screenshots[0] || row.objectImage;
      return {
        slug: row.slug,
        title: row.title,
        host: row.liveUrl ? new URL(row.liveUrl).host : row.title,
        image,
        href: CAPTURES[row.slug] ? `#case-${row.slug}` : localePath(lang, `/work/${row.slug}`),
        colour: await caseColour(CAPTURES[row.slug]?.desktop.src ?? image),
      };
    }),
  );

  const first = cases.find((row) => CAPTURES[row.slug]);
  const chapter: Chapter | null = first
    ? {
        slug: first.slug,
        index: 1,
        title: first.title,
        year: first.year,
        client: first.client,
        line: first.result.split(/(?<=[.!?])\s/)[0] ?? first.result,
        liveUrl: first.liveUrl,
        href: localePath(lang, `/work/${first.slug}`),
        ...CAPTURES[first.slug],
        colour: await caseColour(CAPTURES[first.slug].desktop.src),
      }
    : null;

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
        works={works}
        neutral={NEUTRAL}
      />
      {chapter && <CaseChapter chapter={chapter} labels={s} />}
      <div data-stage data-tone="stage" data-bg={NEUTRAL.bg} data-ink={NEUTRAL.ink} data-accent={NEUTRAL.accent} data-dark="0">
        <Contact
          title={t.landing.closeTitle}
          note={t.landing.closeNote}
          form={t.landing.closeForm}
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

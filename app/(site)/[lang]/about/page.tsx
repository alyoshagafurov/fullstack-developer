import type { Metadata } from 'next';
import Image from 'next/image';
import { Band } from '@/components/ui/Band';
import { Story } from '@/components/about/Story';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { site } from '@/lib/content/site';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.aboutPage.metaTitle,
    description: t.aboutPage.metaDescription,
    alternates: alternatesFor(lang, '/about'),
  };
}

export default async function AboutPage() {
  const { lang, t } = await getDictionary();

  /*
   * This page is the profile of the person declared once in the root layout;
   * it points at the same node rather than describing him a second time.
   */
  const profile = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${site.url}${localePath(lang, '/about')}#profile`,
    url: `${site.url}${localePath(lang, '/about')}`,
    name: `${t.person.name} — ${t.person.role}`,
    inLanguage: lang,
    mainEntity: { '@id': `${site.url}/#person` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }} />

      <PageOpening eyebrow={t.aboutPage.eyebrow} title={t.person.name} lede={t.person.role} />

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div
            data-reveal="image"
            className="group relative aspect-3/2 w-full overflow-hidden bg-ground md:aspect-4/5"
          >
            <Image
              src="/photo/about.webp"
              alt={t.person.photoAlt}
              fill
              priority
              sizes="(min-width: 768px) 46vw, 92vw"
              className="object-cover object-[55%_35%] transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.04]"
            />
          </div>

          <div data-reveal="group">
            <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.35] tracking-[-0.02em]">
              {t.about.origin}
            </p>
            <p className="mt-8 text-base leading-relaxed text-ink-2">{t.about.bio}</p>
          </div>
        </div>
      </Band>

      <Band tone="paper" innerClassName="py-24 md:py-32">
        <Story />
      </Band>

      <Invite />
    </>
  );
}

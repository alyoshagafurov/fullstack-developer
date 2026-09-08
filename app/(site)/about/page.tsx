import type { Metadata } from 'next';
import Image from 'next/image';
import { Band } from '@/components/ui/Band';
import { Story } from '@/components/about/Story';
import { Invite } from '@/components/sections/Invite';
import { PageOpening } from '@/components/ui/PageOpening';
import { about } from '@/lib/content/about';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Обо мне',
  description:
    'Алишер Гафуров (Alisher Gafurov, aly) — full-stack разработчик из Душанбе, Таджикистан. Как пришёл в разработку, чему учился, с кем работаю и за что не берусь.',
  alternates: { canonical: '/about' },
};

/*
 * What a search engine is told this page is.
 *
 * The Person itself is declared once, in the root layout; this only says that
 * this particular page is that person's profile and points at the same node.
 * Two descriptions of one person, each claiming to be the original, is how a
 * knowledge panel ends up with neither.
 */
const profile = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${site.url}/about#profile`,
  url: `${site.url}/about`,
  name: `${site.name} — ${site.role}`,
  inLanguage: 'ru',
  mainEntity: { '@id': `${site.url}/#person` },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }}
      />

      <PageOpening eyebrow="Обо мне" title={site.name} lede={site.role} />

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div
            data-reveal="image"
            className="group relative aspect-3/2 w-full overflow-hidden bg-ground md:aspect-4/5"
          >
            <Image
              src="/photo/about.webp"
              alt={`${site.name} за работой`}
              fill
              priority
              sizes="(min-width: 768px) 46vw, 92vw"
              className="object-cover object-[55%_35%] transition-transform duration-700 ease-[var(--ease-studio)] group-hover:scale-[1.04]"
            />
          </div>

          <div data-reveal="group">
            <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.35] tracking-[-0.02em]">
              {about.origin}
            </p>
            <p className="mt-8 text-base leading-relaxed text-ink-2">{about.bio}</p>

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

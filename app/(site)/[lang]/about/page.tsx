import type { Metadata } from 'next';
import Image from 'next/image';
import { HallHead } from '@/components/museum/HallHead';
import { Doorway } from '@/components/home/Spaces';
import { site } from '@/lib/content/site';
import { alternatesFor, localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * About him, as a small retrospective: the name over the door, the portrait
 * lit, then a long wall of photographs with their dates, and two statements —
 * why come to him, what he turns down — each with its reasons in the corner.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  return {
    title: t.aboutPage.metaTitle,
    description: t.aboutPage.metaDescription,
    alternates: alternatesFor(lang, '/about'),
  };
}

/* The photographs, in the order of their captions in the dictionary. */
const PHOTOS = [
  { src: '/gallery/work-desk.webp', w: 1200, h: 1600 },
  { src: '/gallery/mma.webp', w: 1200, h: 1600 },
  { src: '/gallery/terrace.webp', w: 1200, h: 1600 },
  { src: '/gallery/gym.webp', w: 900, h: 1600 },
  { src: '/gallery/work-phone.webp', w: 1200, h: 1600 },
  { src: '/gallery/park.webp', w: 1200, h: 1600 },
  { src: '/gallery/hall.webp', w: 1200, h: 1600 },
  { src: '/gallery/mountains.webp', w: 960, h: 1280 },
  { src: '/gallery/mirror.webp', w: 900, h: 1600 },
];

export default async function AboutPage() {
  const { lang, t } = await getDictionary();
  const a = t.about;

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

      <HallHead title={t.person.name.split(' ')} script={t.person.role} note={a.difference} />

      {/* The portrait, and how it started. */}
      <section className="hall grid gap-14 pb-28 md:pb-40 lg:grid-cols-12 lg:items-end">
        <div data-fade className="relative lg:col-span-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[12%] -top-[16%] bottom-[40%] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgb(255_236_204/0.16),transparent_70%)]"
          />
          <div className="exhibit relative aspect-[4/5] overflow-hidden">
            <Image
              src="/photo/about.webp"
              alt={t.person.photoAlt}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover object-[55%_35%]"
            />
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <p className="wall-note max-w-[40ch]">{a.origin}</p>
          <p className="wall-note mt-6 max-w-[40ch]">{a.bio}</p>
          <p className="script mt-10 -rotate-[3deg] text-[clamp(1.5rem,2.4vw,2.25rem)]">{a.offDuty}</p>
        </div>
      </section>

      {/* The long wall of photographs. */}
      <section data-gallery className="relative overflow-hidden bg-wall-2" aria-label={a.label}>
        <div className="flex min-h-[100svh] flex-col justify-center py-24 lg:py-16">
          <ul data-gallery-track className="flex scroll-px-5 items-end gap-6 px-5 md:scroll-px-10 md:gap-[4vw] md:px-10 xl:px-[4.5rem]">
            {PHOTOS.map((photo, index) => {
              const caption = a.spreads[index];
              return (
                <li key={photo.src} className="w-[72vw] shrink-0 sm:w-[44vw] lg:w-[min(26vw,44svh)]">
                  <div className="exhibit overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={caption?.alt ?? ''}
                      width={photo.w}
                      height={photo.h}
                      sizes="(min-width: 1024px) 26vw, 72vw"
                      className="h-auto w-full"
                    />
                  </div>
                  {caption && (
                    <p className="mt-5 flex items-baseline justify-between gap-4">
                      <span className="text-sm text-bone">{caption.title}</span>
                      <span className="wall-label">{caption.when}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Why come to him. */}
      <section className="py-28 md:py-40">
        <div className="hall grid gap-12 lg:grid-cols-12 lg:items-end">
          <h2 data-rise className="hall-title lg:col-span-7">
            <span className="line-mask">
              <span>{a.storyLabels.why}</span>
            </span>
          </h2>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="wall-note">{a.why[0]}</p>
            <p className="wall-note mt-5">{a.why[1]}</p>
          </div>
        </div>
      </section>

      {/* What he turns down. */}
      <section className="bg-wall-2 py-28 md:py-40">
        <div className="hall grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <p className="wall-note">{a.refuse[0]}</p>
            <p className="wall-note mt-5">{a.refuse[1]}</p>
          </div>
          <h2 data-rise className="hall-title lg:col-span-7 lg:col-start-6 lg:text-right">
            <span className="line-mask">
              <span>{a.storyLabels.refuse}</span>
            </span>
          </h2>
        </div>
        <p className="hall script mt-16 -rotate-[2deg] text-[clamp(1.375rem,2.2vw,2rem)] md:mt-24">{a.principle}</p>
      </section>

      <Doorway lang={lang} t={t} />
    </>
  );
}

import { Opening } from '@/components/sections/Opening';
import { Vitrine, type VitrineItem } from '@/components/vitrine/Vitrine';
import { AboutSpread, Manifesto, Marquee, ProcessTrack, StartBand } from '@/components/sections/home';
import { Reviews } from '@/components/reviews/Reviews';
import { Stage } from '@/components/three/Stage';
import { getPublishedCases, getTestimonials, localizeCases } from '@/lib/cases';
import { featuredServices } from '@/lib/content/services';
import { localePath } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/server';

/*
 * The landing page, read as one sequence rather than a stack of sections.
 *
 * In the order a stranger needs it: who he is and what he builds (the
 * opening), the gist in one plain paragraph and three numbers, the work, him,
 * what clients said, how a job goes, and the invitation. The request button
 * floats at the bottom the whole way down.
 *
 * Revalidated rather than fully static: the owner publishes cases and
 * testimonials from the admin, and a publish has to reach the site without a
 * redeploy.
 */
export const revalidate = 300;

export default async function HomePage() {
  const { lang, t } = await getDictionary();
  const [cases, testimonials] = await Promise.all([getPublishedCases(), getTestimonials()]);

  // Featured first, then the rest; the register at /work lists them all.
  const featured = cases.filter((row) => row.featured);
  const stageCases = await localizeCases((featured.length > 0 ? featured : cases).slice(0, 6), lang);

  /*
   * What the vitrine shows: the work, or — on a day with nothing published —
   * the three services he named as his main ones, never invented work.
   */
  const items: VitrineItem[] =
    stageCases.length > 0
      ? stageCases.map((row) => ({
          id: row.id,
          kind: 'case' as const,
          title: row.title,
          caption: [row.client, row.year].filter(Boolean).join(', ') || row.task,
          object: row.objectImage,
          ghost: row.ghostWord,
          href: localePath(lang, `/work/${row.slug}`),
          ctaLabel: t.vitrine.viewProject,
          lang: row.fallback.title ? 'ru' : undefined,
        }))
      : featuredServices.map((service) => ({
          id: service.slug,
          kind: 'service' as const,
          title: t.services.items[service.slug]?.title ?? service.title,
          caption: t.services.items[service.slug]?.tagline ?? service.tagline,
          object: service.object,
          href: localePath(lang, `/services/${service.slug}`),
          ctaLabel: t.common.learnMore,
        }));

  return (
    <>
      <Opening />
      <Marquee />
      <Manifesto />
      <Vitrine items={items} copy={t.vitrine} allHref={localePath(lang, '/work')} />
      <AboutSpread />
      <Reviews items={testimonials.slice(0, 3)} total={testimonials.length} />
      <ProcessTrack />
      <StartBand />

      {/* The closing band's own screen of black, with the knot assembling on
          it: his terms on one side, his facts on the other. */}
      <Stage shape="knot" left={t.process.terms} right={t.about.facts.slice(0, 3)} />
    </>
  );
}

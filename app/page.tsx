import { Vitrine, type VitrineItem } from '@/components/vitrine/Vitrine';
import {
  AboutStudio,
  Manifesto,
  ProcessTrack,
  ServicesShelf,
  StartBand,
  Voices,
} from '@/components/sections/home';
import { getFeaturedCases, getTestimonials } from '@/lib/cases';
import { featuredServices } from '@/lib/content/services';

/*
 * The landing page.
 *
 * Revalidated rather than fully static: the owner publishes cases and
 * testimonials from the admin, and a publish has to reach the site without a
 * redeploy.
 */
export const revalidate = 300;

export default async function HomePage() {
  const [cases, testimonials] = await Promise.all([getFeaturedCases(6), getTestimonials()]);

  /*
   * What the vitrine shows.
   *
   * Cases are the point of the display, but there are none on the day the site
   * launches — the owner adds them from the admin. Rather than open on an empty
   * stage or on invented work, the vitrine shows the three services he named as
   * his main ones, each on its own object. The first published case takes the
   * stage back automatically.
   */
  const items: VitrineItem[] =
    cases.length > 0
      ? cases.map((row) => ({
          id: row.id,
          kind: 'case' as const,
          title: row.title,
          caption: [row.client, row.year].filter(Boolean).join(', ') || row.task,
          object: row.objectImage,
          href: `/work/${row.slug}`,
          ctaLabel: 'Смотреть кейс',
        }))
      : featuredServices.map((service) => ({
          id: service.slug,
          kind: 'service' as const,
          title: service.title,
          caption: service.tagline,
          object: service.object,
          href: `/services/${service.slug}`,
          ctaLabel: 'Подробнее',
        }));

  return (
    <>
      <Vitrine items={items} />
      <Manifesto />
      <ServicesShelf />
      <AboutStudio />
      <ProcessTrack />
      <Voices items={testimonials.slice(0, 3)} total={testimonials.length} />
      <StartBand />
    </>
  );
}

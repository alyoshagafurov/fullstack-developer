import { Opening } from '@/components/sections/Opening';
import { Vitrine, type VitrineItem } from '@/components/vitrine/Vitrine';
import {
  AboutSpread,
  Contacts,
  Manifesto,
  Marquee,
  ProcessTrack,
  ServicesIndex,
  StartBand,
  Voices,
} from '@/components/sections/home';
import { getFeaturedCases, getTestimonials } from '@/lib/cases';
import { featuredServices } from '@/lib/content/services';

/*
 * The landing page, read as one sequence rather than a stack of sections.
 *
 * The rhythm is deliberate and uneven: black, black, white, grey, black,
 * white, grey, black. A visitor scrolling should keep hitting a change of
 * ground and a change of scale, because that is what makes a page feel like an
 * art direction instead of a template.
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
   * Cases are the point of it, but there are none on the day the site launches
   * — the owner adds them from the admin. Rather than open on an empty stage or
   * on invented work, it shows the three services he named as his main ones.
   * The first published case takes the stage back automatically.
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
      <Opening />
      <Marquee />
      <Manifesto />
      <Vitrine items={items} />
      <ServicesIndex />
      <AboutSpread />
      <ProcessTrack />
      <Voices items={testimonials.slice(0, 3)} total={testimonials.length} />
      <StartBand />
      <Contacts />
    </>
  );
}

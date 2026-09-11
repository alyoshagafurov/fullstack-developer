import { Opening } from '@/components/sections/Opening';
import { Vitrine, type VitrineItem } from '@/components/vitrine/Vitrine';
import {
  AboutSpread,
  Manifesto,
  Marquee,
  ProcessTrack,
  StartBand,
} from '@/components/sections/home';
import { Reviews } from '@/components/reviews/Reviews';
import { Stage } from '@/components/three/Stage';
import { about } from '@/lib/content/about';
import { terms } from '@/lib/content/process';
import { getPublishedCases, getTestimonials } from '@/lib/cases';
import { featuredServices } from '@/lib/content/services';

/*
 * The landing page, read as one sequence rather than a stack of sections.
 *
 * The rhythm is deliberate and uneven: every band changes both the ground
 * colour and the type scale, so scrolling feels like turning pages rather than
 * sliding down a template. The middle of the page is the owner's chosen order —
 * the vitrine, then him, then the people he did it for. The register of work
 * lives at /work; repeating it here made the page say the same thing twice.
 *
 * Revalidated rather than fully static: the owner publishes cases and
 * testimonials from the admin, and a publish has to reach the site without a
 * redeploy. The reviews band carries no form of its own: it points at the page
 * that asks for one, a question at a time.
 */
export const revalidate = 300;

export default async function HomePage() {
  const [cases, testimonials] = await Promise.all([getPublishedCases(), getTestimonials()]);

  // Featured first, then the rest. The register at /work lists them all; here
  // the vitrine is the only place the work appears, so it takes the featured
  // ones and falls back to the newest when none is marked.
  const featured = cases.filter((row) => row.featured);
  const stageCases = (featured.length > 0 ? featured : cases).slice(0, 6);

  /*
   * What the vitrine shows.
   *
   * Cases are the point of it, but there are none on the day the site launches
   * — the owner adds them from the admin. Rather than open on an empty stage or
   * on invented work, it shows the three services he named as his main ones.
   * The first published case takes the stage back automatically.
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
      <AboutSpread />
      <Reviews items={testimonials.slice(0, 3)} total={testimonials.length} />
      <ProcessTrack />
      <StartBand />

      {/* The closing band's own screen of black, with the knot assembling on it.
          Its facts are the terms and the plates — the numbers already stand
          higher up the page, in the manifesto. */}
      <Stage shape="knot" left={terms} right={about.facts.slice(0, 3)} />
    </>
  );
}

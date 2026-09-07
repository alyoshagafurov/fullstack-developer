import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Band } from '@/components/ui/Band';
import { Invite } from '@/components/sections/Invite';
import { StudioObject } from '@/components/ui/StudioObject';
import { getService, services } from '@/lib/content/services';

/*
 * One service, one object, three answers: what it is, what the client gets, who
 * it is for. Every line here is the owner's own wording.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.tagline,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((item) => item.slug !== service.slug).slice(0, 6);

  return (
    <>
      <Band tone="ground" innerClassName="pt-36 pb-20 md:pt-44 md:pb-28">
        <nav className="label mb-10">
          <Link href="/services" className="transition-colors hover:text-ink">
            Услуги
          </Link>
          <span className="mx-2 text-ink-3">/</span>
          <span className="text-ink-2">{service.num}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-[1fr_20rem] md:items-center md:gap-16">
          <div>
            <h1 className="max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.04em]">
              {service.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">{service.tagline}</p>
          </div>
          <div className="relative aspect-square w-56 justify-self-start md:w-full md:justify-self-end">
            <StudioObject
              src={service.object}
              alt=""
              priority
              sizes="(min-width: 768px) 20rem, 14rem"
            />
          </div>
        </div>
      </Band>

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          <section>
            <h2 className="label mb-5">Что это</h2>
            <p className="text-base leading-relaxed">{service.tagline}</p>
          </section>
          <section>
            <h2 className="label mb-5">Что вы получаете</h2>
            <p className="text-base leading-relaxed">{service.deliverable}</p>
          </section>
          <section>
            <h2 className="label mb-5">Для кого</h2>
            <p className="text-base leading-relaxed">{service.who}</p>
          </section>
        </div>

        {(service.duration || service.budget) && (
          <dl className="mt-16 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            {service.duration && (
              <div>
                <dt className="label mb-3">Сроки</dt>
                <dd className="text-[clamp(1.25rem,2.4vw,1.75rem)] tracking-[-0.02em]">
                  {service.duration}
                </dd>
              </div>
            )}
            {service.budget && (
              <div>
                <dt className="label mb-3">Бюджет</dt>
                <dd className="text-[clamp(1.25rem,2.4vw,1.75rem)] tracking-[-0.02em]">
                  {service.budget}
                </dd>
              </div>
            )}
          </dl>
        )}
      </Band>

      <Invite />
    </>
  );
}

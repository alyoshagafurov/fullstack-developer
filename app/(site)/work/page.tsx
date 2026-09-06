import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { CTA } from '@/components/ui/CTA';
import { PillLink } from '@/components/ui/Pill';
import { StudioObject } from '@/components/ui/StudioObject';
import { Reviews } from '@/components/reviews/Reviews';
import { getPublishedCases, getTestimonials } from '@/lib/cases';
import { site } from '@/lib/content/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Проекты',
  description: 'Работы, которые я собрал целиком — от идеи и дизайна до сервера и запуска.',
  alternates: { canonical: '/work' },
};

/*
 * The register of work.
 *
 * Rows alternate so the page reads as a walk past a display rather than a grid
 * of equal tiles. With nothing published yet the page says so plainly and
 * offers the services instead: an empty state is honest, invented work is not.
 */
export default async function WorkPage() {
  const [cases, voices] = await Promise.all([getPublishedCases(), getTestimonials()]);

  return (
    <>
      <PageOpening eyebrow="Проекты" title="Работы, собранные целиком" lede={site.difference} />

      {cases.length === 0 ? (
        <Band tone="paper" innerClassName="py-24 md:py-36">
          <div className="max-w-2xl">
            <p className="text-[clamp(1.25rem,2.6vw,1.875rem)] leading-[1.3] tracking-[-0.02em]">
              Кейсы скоро появятся здесь.
            </p>
            <p className="mt-6 text-base leading-relaxed text-ink-2">
              Я собираю их вместе с клиентами и публикую только то, на что есть разрешение. Пока
              посмотрите, что я делаю, или напишите — расскажу про работы лично.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="/services" variant="outline">
                Смотреть услуги
              </PillLink>
              <CTA href="/start">
                {site.heroCta}
              </CTA>
            </div>
          </div>
        </Band>
      ) : (
        <Band tone="paper" innerClassName="py-12 md:py-20">
          <ol className="divide-y divide-line">
            {cases.map((row, index) => {
              /*
               * A case that carries the client's mark runs mark, words, object.
               * That three-part row is its own rhythm, so it does not alternate;
               * without a mark the object leads and the sides swap, as before.
               */
              const logo = row.logoUrl;
              const flip = !logo && index % 2 === 1;
              return (
                <li key={row.id}>
                  <Link
                    href={`/work/${row.slug}`}
                    className={`group grid items-center gap-8 py-12 md:py-16 ${
                      logo
                        ? 'md:grid-cols-[13rem_1fr_13rem] md:gap-12'
                        : flip
                          ? 'md:grid-cols-[1fr_16rem]'
                          : 'md:grid-cols-[16rem_1fr]'
                    }`}
                  >
                    {logo && (
                      <div className="relative h-14 w-40 md:h-24 md:w-full">
                        <Image
                          src={logo}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 13rem, 10rem"
                          className="object-contain object-left transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-1 md:object-center"
                        />
                      </div>
                    )}

                    <div className={`min-w-0 ${logo ? '' : flip ? 'md:order-1' : 'md:order-2'}`}>
                    <p className="label mb-4">
                      {[row.client, row.year].filter(Boolean).join(' · ')}
                    </p>
                    <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-tight tracking-[-0.03em]">
                      {row.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
                      {row.task}
                    </p>
                    {row.technologies.length > 0 && (
                      <p className="mt-5 text-xs tracking-[0.06em] text-ink-3">
                        {row.technologies.join(' · ')}
                      </p>
                    )}
                    </div>

                    <div
                      className={`relative aspect-square w-36 md:w-full ${
                        logo ? '' : `max-md:order-first ${flip ? 'md:order-2' : 'md:order-1'}`
                      }`}
                    >
                      <StudioObject
                        src={row.objectImage}
                        alt=""
                        sizes="(min-width: 768px) 16rem, 9rem"
                        className="transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-translate-y-2"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Band>
      )}

      {/* The people the work was done for, directly under the work itself. */}
      <Reviews items={voices} total={voices.length} />

      <Band tone="paper" innerClassName="py-24 md:py-32">
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.03em]">
          {site.contactInvite}
        </p>
        <CTA href="/start" className="mt-10">
          {site.heroCta}
        </CTA>
      </Band>
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Band } from '@/components/ui/Band';
import { PillLink } from '@/components/ui/Pill';
import { getTestimonials } from '@/lib/cases';
import { site } from '@/lib/content/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Отзывы',
  description: 'Что говорят клиенты о работе.',
  alternates: { canonical: '/reviews' },
};

/*
 * Every testimonial here was entered by the owner from the admin. None is
 * generated, and the page does not exist at all until there is at least one:
 * an empty "what clients say" is worse than no section.
 */
export default async function ReviewsPage() {
  const voices = await getTestimonials();
  if (voices.length === 0) notFound();

  return (
    <>
      <Band tone="ground" innerClassName="pt-36 pb-16 md:pt-44 md:pb-24">
        <p className="label mb-6">Отзывы</p>
        <h1 className="max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.04em]">
          Что говорят клиенты
        </h1>
      </Band>

      <Band tone="paper" innerClassName="py-16 md:py-24">
        <div className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {voices.map((voice) => (
            <article key={voice.id} className="border-t border-line pt-8">
              <blockquote className="text-base leading-relaxed">{voice.text}</blockquote>
              <div className="mt-6 flex items-center gap-3">
                {voice.avatarUrl ? (
                  <Image
                    src={voice.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-shelf text-xs tracking-[0.06em] text-ink-2"
                  >
                    {voice.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? '')
                      .join('')}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm">{voice.name}</p>
                  {(voice.role || voice.company) && (
                    <p className="text-xs text-ink-3">
                      {[voice.role, voice.company].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              {voice.caseSlug && (
                <Link
                  href={`/work/${voice.caseSlug}`}
                  className="label mt-5 inline-flex min-h-11 items-center transition-colors hover:text-ink"
                >
                  Смотреть кейс
                </Link>
              )}
            </article>
          ))}
        </div>
      </Band>

      <Band tone="ground" innerClassName="py-24 md:py-32">
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] tracking-[-0.03em]">
          {site.contactInvite}
        </p>
        <PillLink href="/start" variant="solid" className="mt-10">
          {site.heroCta}
        </PillLink>
      </Band>
    </>
  );
}

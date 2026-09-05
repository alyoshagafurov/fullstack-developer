import type { Metadata } from 'next';
import Image from 'next/image';
import { Band } from '@/components/ui/Band';
import { PageOpening } from '@/components/ui/PageOpening';
import { CTA } from '@/components/ui/CTA';
import { PillLink } from '@/components/ui/Pill';
import { about } from '@/lib/content/about';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Обо мне',
  description: site.difference,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageOpening eyebrow="Обо мне" title={site.name} lede={site.role} />

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div className="relative aspect-3/2 w-full overflow-hidden bg-ground md:aspect-4/5">
            <Image
              src="/photo/portrait-work.webp"
              alt={`${site.name} за работой`}
              fill
              priority
              sizes="(min-width: 768px) 46vw, 92vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.35] tracking-[-0.02em]">
              {about.origin}
            </p>
            <p className="mt-8 text-base leading-relaxed text-ink-2">{about.bio}</p>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8">
              {about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="label mb-2">{fact.label}</dt>
                  <dd className="text-sm leading-snug">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Band>

      <Band tone="shelf" innerClassName="py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-3 md:gap-16">
          <section>
            <h2 className="label mb-6">Чему учился</h2>
            <ul className="space-y-4 text-sm leading-relaxed text-ink-2">
              {about.education.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="label mb-6">Языки</h2>
            <ul className="space-y-3 text-sm">
              {about.languages.map((language) => (
                <li
                  key={language.name}
                  className="flex items-baseline justify-between gap-4 border-b border-line-2 pb-3"
                >
                  <span>{language.name}</span>
                  <span className="text-ink-3">{language.level}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="label mb-6">Вне работы</h2>
            <p className="text-sm leading-relaxed text-ink-2">{about.offDuty}</p>
          </section>
        </div>
      </Band>

      <Band tone="paper" innerClassName="py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <section>
            <h2 className="label mb-6">Почему ко мне</h2>
            <div className="space-y-6">
              {site.why.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="label mb-6">За что не берусь</h2>
            <div className="space-y-6">
              {site.refuse.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-ink-2">
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="mt-10 border-t border-line pt-6 text-base leading-relaxed">
              {about.principle}
            </p>
          </section>
        </div>
      </Band>

      <Band tone="ground" innerClassName="py-24 md:py-32">
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

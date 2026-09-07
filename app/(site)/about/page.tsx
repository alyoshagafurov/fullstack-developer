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
  description: site.difference,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
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

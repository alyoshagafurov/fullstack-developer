'use client';

import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Teaser from '@/components/Teaser';
import PricingTeaser from '@/components/PricingTeaser';
import CTABand from '@/components/CTABand';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n';
import { projects } from '@/lib/projects';

/*
 * Landing — a concise "table of contents": the hero, a stack strip, and a short
 * teaser for each section, each with a button that opens the full dedicated
 * page. The detail lives on /services, /work, /process, /pricing, /about,
 * /contact — the header menu points there too.
 */
export default function Home() {
  const { t } = useI18n();

  return (
    <>
      <Loader />
      <Navbar />
      <main className="relative">
        <Hero />
        <Marquee />

        <Teaser
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          text={t.services.sub}
          bullets={t.services.items.map((s) => s.title)}
          href="/services"
          cta={t.common.more}
        />

        <Teaser
          eyebrow={t.work.eyebrow}
          title={t.work.title}
          text={t.work.sub}
          bullets={projects.map((p) => t.cases[p.slug]?.title).filter(Boolean) as string[]}
          href="/work"
          cta={t.common.more}
          alt
        />

        <Teaser
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          text={t.process.sub}
          bullets={t.process.steps.map((s) => s.t)}
          href="/process"
          cta={t.common.more}
        />

        <PricingTeaser />

        <Teaser
          eyebrow={t.about.eyebrow}
          title={t.about.title}
          text={t.about.p1}
          bullets={t.about.facts.map((f) => `${f.k}: ${f.v}`)}
          href="/about"
          cta={t.common.more}
        />

        <CTABand />
      </main>
      <Footer />
    </>
  );
}

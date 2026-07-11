import type { Metadata } from 'next';
import { ru } from '@/lib/i18n/ru';
import PageShell from '@/components/PageShell';
import About from '@/components/About';
import Stats from '@/components/Stats';
import CTABand from '@/components/CTABand';

export const metadata: Metadata = {
  title: ru.nav.about,
  description: ru.about.p1,
};

export default function AboutPage() {
  return (
    <PageShell>
      <About />
      <Stats />
      <CTABand />
    </PageShell>
  );
}

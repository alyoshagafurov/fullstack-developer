import type { Metadata } from 'next';
import { ru } from '@/lib/i18n/ru';
import PageShell from '@/components/PageShell';
import Projects from '@/components/Projects';
import Testimonials from '@/components/Testimonials';
import CTABand from '@/components/CTABand';

export const metadata: Metadata = {
  title: ru.nav.work,
  description: ru.work.sub,
};

export default function WorkPage() {
  return (
    <PageShell>
      <Projects />
      <Testimonials />
      <CTABand />
    </PageShell>
  );
}

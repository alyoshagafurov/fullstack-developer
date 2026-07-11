import type { Metadata } from 'next';
import { ru } from '@/lib/i18n/ru';
import PageShell from '@/components/PageShell';
import Services from '@/components/Services';
import WhyMe from '@/components/WhyMe';
import TechStack from '@/components/TechStack';
import CTABand from '@/components/CTABand';

export const metadata: Metadata = {
  title: ru.nav.services,
  description: ru.services.sub,
};

export default function ServicesPage() {
  return (
    <PageShell>
      <Services />
      <WhyMe />
      <TechStack />
      <CTABand />
    </PageShell>
  );
}

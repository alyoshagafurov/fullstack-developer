import type { Metadata } from 'next';
import { ru } from '@/lib/i18n/ru';
import PageShell from '@/components/PageShell';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';

export const metadata: Metadata = {
  title: ru.nav.pricing,
  description: ru.pricing.tariffsSub,
};

export default function PricingPage() {
  return (
    <PageShell>
      <Pricing />
      <FAQ />
    </PageShell>
  );
}

import type { Metadata } from 'next';
import { ru } from '@/lib/i18n/ru';
import PageShell from '@/components/PageShell';
import Process from '@/components/Process';
import FAQ from '@/components/FAQ';
import CTABand from '@/components/CTABand';

export const metadata: Metadata = {
  title: ru.nav.process,
  description: ru.process.sub,
};

export default function ProcessPage() {
  return (
    <PageShell>
      <Process />
      <FAQ />
      <CTABand />
    </PageShell>
  );
}

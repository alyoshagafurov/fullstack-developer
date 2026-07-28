import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Process from '@/components/Process';
import FAQ from '@/components/FAQ';
import CTABand from '@/components/CTABand';
import { pageMetadata, breadcrumb } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/process',
  title: 'Процесс работы над проектом',
  description:
    'Как проходит разработка сайта или приложения с Алишером Гафуровым (ALY): от знакомства и планирования до дизайна, разработки, тестирования, запуска и поддержки.',
});

export default function ProcessPage() {
  return (
    <PageShell h1="Процесс разработки сайтов и веб-приложений — Алишер Гафуров (ALY)">
      <JsonLd data={breadcrumb([{ name: 'Главная', path: '/' }, { name: 'Процесс', path: '/process' }])} />
      <Process />
      <FAQ />
      <CTABand />
    </PageShell>
  );
}

import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import { pageMetadata, breadcrumb } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/pricing',
  title: 'Цены и тарифы на разработку',
  description:
    'Прозрачные цены на разработку сайтов, интернет-магазинов, CRM, мобильных приложений и SaaS. От 1 500 сомони. Индивидуальная оценка проекта — Алишер Гафуров (ALY), Душанбе.',
});

export default function PricingPage() {
  return (
    <PageShell h1="Цены на разработку сайтов, приложений, CRM и SaaS — Алишер Гафуров (ALY), Душанбе">
      <JsonLd data={breadcrumb([{ name: 'Главная', path: '/' }, { name: 'Тарифы', path: '/pricing' }])} />
      <Pricing />
      <FAQ />
    </PageShell>
  );
}

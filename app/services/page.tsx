import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Services from '@/components/Services';
import WhyMe from '@/components/WhyMe';
import TechStack from '@/components/TechStack';
import CTABand from '@/components/CTABand';
import { pageMetadata, breadcrumb } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/services',
  title: 'Услуги — разработка сайтов, SaaS и CRM',
  description:
    'Услуги Алишера Гафурова (ALY): разработка сайтов, лендингов, интернет-магазинов, веб-приложений, SaaS и CRM под ключ в Душанбе и по всему миру. Next.js, React, Node.js, TypeScript.',
});

export default function ServicesPage() {
  return (
    <PageShell h1="Услуги веб-разработки — Алишер Гафуров (ALY): сайты, веб-приложения, SaaS и CRM в Душанбе, Таджикистан">
      <JsonLd data={breadcrumb([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }])} />
      <Services />
      <WhyMe />
      <TechStack />
      <CTABand />
    </PageShell>
  );
}

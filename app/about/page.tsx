import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import About from '@/components/About';
import Stats from '@/components/Stats';
import CTABand from '@/components/CTABand';
import { pageMetadata, breadcrumb } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/about',
  title: 'О себе — Full-Stack разработчик',
  description:
    'Алишер Гафуров (Aly) — Full-Stack разработчик и Software Engineer из Душанбе, Таджикистан, основатель ALY. React, Next.js, Node.js, TypeScript. Сайты, веб-приложения, SaaS и CRM.',
});

export default function AboutPage() {
  return (
    <PageShell h1="Об Алишере Гафурове (Aly) — Full-Stack разработчик и Software Engineer, Душанбе, Таджикистан">
      <JsonLd data={breadcrumb([{ name: 'Главная', path: '/' }, { name: 'О себе', path: '/about' }])} />
      <About />
      <Stats />
      <CTABand />
    </PageShell>
  );
}

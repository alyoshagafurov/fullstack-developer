import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Projects from '@/components/Projects';
import Testimonials from '@/components/Testimonials';
import CTABand from '@/components/CTABand';
import { pageMetadata, breadcrumb } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/work',
  title: 'Работы и кейсы — SaaS, CRM, сайты',
  description:
    'Портфолио Алишера Гафурова (ALY): реальные кейсы — SaaS-платформы, CRM, веб-приложения, интернет-магазины и сайты. Задача, решение, стек и результат по каждому проекту.',
});

export default function WorkPage() {
  return (
    <PageShell h1="Портфолио и кейсы Алишера Гафурова (ALY) — веб-разработка, SaaS и CRM, Таджикистан">
      <JsonLd data={breadcrumb([{ name: 'Главная', path: '/' }, { name: 'Работы', path: '/work' }])} />
      <Projects />
      <Testimonials />
      <CTABand />
    </PageShell>
  );
}

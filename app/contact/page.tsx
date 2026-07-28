import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Contact from '@/components/Contact';
import { pageMetadata, breadcrumb } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/contact',
  title: 'Контакты — заказать проект',
  description:
    'Связаться с Алишером Гафуровым (ALY): закажите сайт, веб-приложение, CRM или SaaS. Ответ в течение дня — Telegram, Instagram, email. Душанбе, Таджикистан.',
});

export default function ContactPage() {
  return (
    <PageShell h1="Контакты — заказать разработку сайта или приложения у Алишера Гафурова (ALY)">
      <JsonLd data={breadcrumb([{ name: 'Главная', path: '/' }, { name: 'Контакт', path: '/contact' }])} />
      <Contact />
    </PageShell>
  );
}

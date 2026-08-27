import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import BriefIntro from '@/components/brief/BriefIntro';
import { pageMetadata } from '@/lib/seo';

/*
 * /brief — the Project Brief.
 *
 * NOINDEX ON PURPOSE (Phase 7): the submission boundary exists but no backend
 * stores anything yet, so a brief submitted today cannot be received. Keeping
 * the route out of search — and off the main CTAs — means no real visitor can
 * reach a dead end. Phase 8 wires up storage; drop `robots` then and point the
 * site's CTAs here.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    path: '/brief',
    title: 'Бриф проекта — заказать разработку',
    description:
      'Расскажите о проекте: тип, задача, функциональность, бюджет и сроки. Несколько коротких шагов — и я вернусь с предложением.',
  }),
  robots: { index: false, follow: false },
};

export default function BriefPage() {
  return (
    <PageShell h1="Бриф проекта — заказать разработку сайта, веб-приложения или CRM у Алишера Гафурова (ALY)">
      <BriefIntro />
    </PageShell>
  );
}

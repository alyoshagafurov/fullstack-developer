import type { Metadata } from 'next';
import ProjectBriefFlow from '@/components/brief/ProjectBriefFlow';
import { pageMetadata } from '@/lib/seo';

/*
 * /start-project — the Project Brief.
 *
 * NOINDEX ON PURPOSE (P5): the submission boundary exists and validates, but
 * nothing persists a brief yet, so a submission made today cannot be received.
 * Keeping the route out of search means no one arrives here from Google and
 * hits a dead end. Phase 6 wires up storage; drop `robots` then.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    path: '/start-project',
    title: 'Начать проект — бриф',
    description:
      'Расскажите о проекте: тип, цель, объём, бюджет и сроки. Восемь коротких шагов — и я вернусь с предложением.',
  }),
  robots: { index: false, follow: false },
};

export default function StartProjectPage() {
  return (
    <main id="main">
      <h1 className="sr-only">
        Начать проект с Алишером Гафуровым (ALY) — бриф на разработку
      </h1>
      <ProjectBriefFlow />
    </main>
  );
}

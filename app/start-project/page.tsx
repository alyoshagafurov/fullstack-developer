import type { Metadata } from 'next';
import ProjectBriefFlow from '@/components/brief/ProjectBriefFlow';
import { listPublishedCases } from '@/lib/cases';
import { pageMetadata } from '@/lib/seo';

/*
 * /start-project — the Project Brief.
 *
 * Indexable: a brief is stored by app/api/brief (Prisma) and the owner reads
 * it in the admin, so a visitor arriving here from search is received. The
 * route was noindex while nothing persisted a submission; that is no longer
 * the case.
 */
export const metadata: Metadata = pageMetadata({
  path: '/start-project',
  title: 'Начать проект — бриф',
  description:
    'Расскажите о проекте: тип, цель, объём, бюджет и сроки. Восемь коротких шагов — и я вернусь с предложением.',
});

/* Revalidated hourly: the confirmation offers the work only once there is
   work to see. */
export const revalidate = 3600;

export default async function StartProjectPage() {
  const cases = await listPublishedCases();
  return (
    <main id="main">
      <h1 className="sr-only">
        Начать проект с Алишером Гафуровым (ALY) — бриф на разработку
      </h1>
      <ProjectBriefFlow hasCases={cases.length > 0} />
    </main>
  );
}

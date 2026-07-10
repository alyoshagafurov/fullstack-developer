import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, getProject } from '@/lib/projects';
import CaseView from '@/components/CaseView';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProject(params.slug);
  if (!p) return { title: 'Проект не найден' };
  return {
    title: `${p.title} — кейс`,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary },
  };
}

export default function WorkPage({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  if (!p) notFound();

  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];

  return <CaseView project={p} next={next} />;
}

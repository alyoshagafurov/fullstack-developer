import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, getProject } from '@/lib/projects';
import { ru } from '@/lib/i18n/ru';
import CaseView from '@/components/CaseView';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = ru.cases[params.slug];
  if (!c) return { title: 'Проект не найден' };
  return {
    title: `${c.title} — кейс`,
    description: c.summary,
    openGraph: { title: c.title, description: c.summary },
  };
}

export default function WorkPage({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  if (!p) notFound();

  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];

  return <CaseView project={p} next={next} />;
}

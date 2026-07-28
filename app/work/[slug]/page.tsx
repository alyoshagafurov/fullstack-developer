import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, getProject } from '@/lib/projects';
import { ru } from '@/lib/i18n/ru';
import CaseView from '@/components/CaseView';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, pageMetadata, breadcrumb } from '@/lib/seo';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = ru.cases[params.slug];
  const p = getProject(params.slug);
  if (!c || !p) return { title: 'Проект не найден' };
  return pageMetadata({
    path: `/work/${params.slug}`,
    title: `${c.title} — кейс`,
    description: c.summary,
    ogImage: `${SITE_URL}${p.cover}`,
  });
}

export default function WorkPage({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  const c = ru.cases[params.slug];
  if (!p || !c) notFound();

  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];
  const caseUrl = `${SITE_URL}/work/${p.slug}`;

  const creativeWork = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${caseUrl}#project`,
    name: c.title,
    headline: c.title,
    description: c.summary,
    url: p.liveUrl || caseUrl,
    image: `${SITE_URL}${p.cover}`,
    inLanguage: 'ru',
    dateCreated: p.year,
    genre: c.category,
    keywords: c.stack.join(', '),
    author: { '@id': `${SITE_URL}/#person` },
    creator: { '@id': `${SITE_URL}/#person` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumb([
            { name: 'Главная', path: '/' },
            { name: 'Работы', path: '/work' },
            { name: c.title, path: `/work/${p.slug}` },
          ]),
          creativeWork,
        ]}
      />
      <CaseView project={p} next={next} />
    </>
  );
}

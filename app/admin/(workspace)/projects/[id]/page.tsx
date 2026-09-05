import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getCaseById } from '@/lib/admin/queries';
import { CaseEditor, type CaseValues } from './CaseEditor';

export const dynamic = 'force-dynamic';

/** `/admin/projects/new` creates; any other id edits that case. */
export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const { id } = await params;
  const creating = id === 'new';
  const row = creating ? null : await getCaseById(id);
  if (!creating && !row) notFound();

  const values: CaseValues = {
    id: creating ? '' : id,
    slug: row?.slug ?? '',
    title: row?.title ?? '',
    client: row?.client ?? '',
    year: row?.year ?? String(new Date().getFullYear()),
    task: row?.task ?? '',
    solution: row?.solution ?? '',
    result: row?.result ?? '',
    technologies: row?.technologies.join(', ') ?? '',
    liveUrl: row?.liveUrl ?? '',
    objectImage: row?.objectImage ?? '/objects/laptop.webp',
    ghostWord: row?.ghostWord ?? '',
    screenshots: row?.screenshots.join('\n') ?? '',
    featured: row?.featured ?? false,
    order: row?.order ?? 0,
    published: row?.published ?? false,
  };

  return (
    <div className="space-y-10">
      <header>
        <Link href="/admin/projects" className="label mb-6 inline-block hover:text-ink">
          Кейсы
        </Link>
        <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">
          {creating ? 'Новый кейс' : values.title}
        </h1>
      </header>

      <div className="border-t border-line pt-10">
        <CaseEditor values={values} />
      </div>
    </div>
  );
}

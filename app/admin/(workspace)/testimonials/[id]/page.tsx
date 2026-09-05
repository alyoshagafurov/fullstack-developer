import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getTestimonialById, listCaseOptions } from '@/lib/admin/queries';
import { TestimonialEditor, type TestimonialValues } from './TestimonialEditor';

export const dynamic = 'force-dynamic';

/** `/admin/testimonials/new` creates; any other id edits that testimonial. */
export default async function TestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const { id } = await params;
  const creating = id === 'new';
  const [row, cases] = await Promise.all([
    creating ? Promise.resolve(null) : getTestimonialById(id),
    listCaseOptions(),
  ]);
  if (!creating && !row) notFound();

  const values: TestimonialValues = {
    id: creating ? '' : id,
    name: row?.name ?? '',
    company: row?.company ?? '',
    role: row?.role ?? '',
    text: row?.text ?? '',
    avatarUrl: row?.avatarUrl ?? '',
    caseId: row?.caseId ?? '',
    featured: row?.featured ?? false,
    order: row?.order ?? 0,
    published: row?.published ?? false,
  };

  return (
    <div className="space-y-10">
      <header>
        <Link href="/admin/testimonials" className="label mb-6 inline-block hover:text-ink">
          Отзывы
        </Link>
        <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">
          {creating ? 'Новый отзыв' : values.name}
        </h1>
      </header>

      <div className="border-t border-line pt-10">
        <TestimonialEditor values={values} cases={cases} />
      </div>
    </div>
  );
}

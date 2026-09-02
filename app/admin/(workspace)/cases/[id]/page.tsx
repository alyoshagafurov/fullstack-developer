import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

import CaseEditor from '@/components/admin/CaseEditor';
import { getCase } from '@/lib/cases';

/*
 * /admin/cases/[id] — edit one case.
 *
 * `getCase` deliberately does not filter on `published`: this is the screen
 * where a draft is written, so a draft must be loadable here. The gate is the
 * workspace layout plus the API's own `requireAdmin`, not the query.
 *
 * `params` is a Promise — Next 15 resolves route params lazily.
 */

export const dynamic = 'force-dynamic';

export default async function EditCasePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await getCase(id);
  if (!item) notFound();

  return (
    <>
      <header className="a-head">
        <div>
          <Link
            href="/admin/cases"
            className="mb-3 inline-flex items-center gap-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden />
            Кейсы
          </Link>
          <h1 className="a-title">{item.title}</h1>
        </div>

        {/* Only offered when the case is actually reachable. A "view on site"
            link that 404s because the case is still a draft would be a lie. */}
        {item.published && (
          <a href={`/work/${item.slug}`} target="_blank" rel="noopener noreferrer" className="a-btn">
            На сайте
            <ArrowUpRight size={14} aria-hidden />
          </a>
        )}
      </header>

      <CaseEditor initial={item} />
    </>
  );
}

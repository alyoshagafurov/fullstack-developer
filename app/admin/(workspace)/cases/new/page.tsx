import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import CaseEditor, { BLANK } from '@/components/admin/CaseEditor';

/*
 * /admin/cases/new
 *
 * A separate route rather than a modal or an inline row. Writing a case is a
 * task with its own address: it survives a refresh, it can be left open in a
 * tab, and the browser's back button does the obvious thing.
 */

export const dynamic = 'force-dynamic';

export default function NewCasePage() {
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
          <h1 className="a-title">Новый кейс</h1>
        </div>
      </header>

      <CaseEditor initial={BLANK} />
    </>
  );
}

import Link from 'next/link';
import { Plus } from 'lucide-react';

import { listAllCases } from '@/lib/cases';

/*
 * /admin/cases — the case register.
 *
 * Drafts and published cases in one list, because the owner's question is
 * "what have I got" rather than "what is live". Publication state is a column,
 * not a filter, so an unfinished case cannot be forgotten by being hidden.
 *
 * A server component: the list is read-only, so it ships no JavaScript. The
 * editor is where interactivity lives.
 */

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  const cases = await listAllCases();
  const live = cases.filter((item) => item.published).length;

  return (
    <>
      <header className="a-head">
        <div>
          <span className="a-eyebrow">
            {cases.length === 0 ? 'Кейсы' : `Всего ${cases.length} · опубликовано ${live}`}
          </span>
          <h1 className="a-title">Кейсы</h1>
        </div>
        <Link href="/admin/cases/new" className="a-btn" data-variant="solid">
          <Plus size={14} aria-hidden />
          Новый кейс
        </Link>
      </header>

      <div className="a-panel">
        {cases.length === 0 ? (
          <div className="a-empty">
            <span className="a-empty-mark" aria-hidden />
            <h2 className="a-empty-title">Пока пусто</h2>
            <p className="a-empty-body">
              Добавьте первый кейс — заголовок, описание, технологии, ссылку и скриншоты.
              На странице «Работы» он появится после публикации.
            </p>
            <Link href="/admin/cases/new" className="a-btn mt-2">Добавить кейс</Link>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {cases.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/cases/${item.id}`} className="a-row" data-compact>
                  {/* The cover doubles as the row's identity — a case is a
                      visual thing, and a list of titles alone makes the owner
                      open each one to remember which is which. */}
                  <span className="flex min-w-0 items-center gap-3">
                    {item.cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.cover} alt=""
                        className="h-10 w-16 shrink-0 rounded-[6px] object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="h-10 w-16 shrink-0 rounded-[6px] border border-line"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="a-row-name">{item.title}</span>
                      <span className="a-row-sub block">
                        /{item.slug}
                        {item.technologies.length > 0
                          && ` · ${item.technologies.slice(0, 3).join(', ')}`}
                      </span>
                    </span>
                  </span>

                  <span className="a-row-meta justify-self-end whitespace-nowrap">
                    {item.published ? 'Опубликован' : 'Черновик'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

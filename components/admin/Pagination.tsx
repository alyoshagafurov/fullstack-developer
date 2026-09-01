import Link from 'next/link';

/*
 * Pagination.
 *
 * Links, not buttons — each page is a real URL that can be bookmarked, opened
 * in a new tab and returned to with the back button. Django's page size is 25
 * (settings PAGE_SIZE), and the count comes from its paginated envelope.
 */

export default function Pagination({
  page, count, pageSize = 25, params,
}: {
  page: number;
  count: number;
  pageSize?: number;
  params: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams(params);
    if (target > 1) next.set('page', String(target));
    else next.delete('page');
    const qs = next.toString();
    return `/admin/leads${qs ? `?${qs}` : ''}`;
  };

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, count);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 pt-5"
      aria-label="Страницы списка"
    >
      <p className="text-[12.5px] text-ink-3 m-0">
        {first}–{last} из {count}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="a-btn" rel="prev">Назад</Link>
        ) : (
          <span className="a-btn opacity-40" aria-disabled="true">Назад</span>
        )}

        <span className="text-[12.5px] text-ink-3 px-1 tabular-nums">
          {page} / {pages}
        </span>

        {page < pages ? (
          <Link href={href(page + 1)} className="a-btn" rel="next">Вперёд</Link>
        ) : (
          <span className="a-btn opacity-40" aria-disabled="true">Вперёд</span>
        )}
      </div>
    </nav>
  );
}

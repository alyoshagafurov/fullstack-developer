import Link from 'next/link';

import type { ApiResult } from '@/lib/admin-api/types';

/*
 * The screens that are not the happy path.
 *
 * Each failure mode gets a real explanation, because "something went wrong"
 * on a CRM leaves an operator unable to tell whether a lead is missing or the
 * backend is down — and those demand opposite reactions.
 *
 * Nothing here renders a server message. The `code` values are ours, from the
 * adapter's own union, never text from Django.
 */

export function BackendUnavailable({ code }: { code: string }) {
  const unreachable = code === 'backend_unreachable' || code === 'storage_unavailable';
  return (
    <div className="a-note" data-tone="warn" role="status">
      <h2>{unreachable ? 'Бэкенд недоступен' : 'Бэкенд не подключён'}</h2>
      <p className="mb-[10px]">
        {unreachable
          ? 'Django API не отвечает. Заявки не потеряны — панель просто не может их прочитать.'
          : 'Переменная DJANGO_API_URL не задана, поэтому панели не к чему обращаться.'}
      </p>
      <p className="m-0 text-ink-3">
        Ничего не показано намеренно: пустая таблица выглядела бы как «заявок нет».
      </p>
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="a-note" data-tone="error" role="status">
      <h2>Недостаточно прав</h2>
      <p className="m-0">
        У вашей роли нет доступа к этому разделу. Права выдаёт владелец на стороне Django.
      </p>
    </div>
  );
}

export function NotFound({ reference }: { reference?: string }) {
  return (
    <div className="a-note" role="status">
      <h2>Заявка не найдена</h2>
      <p className="mb-3">
        {reference ? `Номера ${reference} нет в базе.` : 'Такой заявки нет.'}
      </p>
      <Link href="/admin/leads" className="a-btn">К списку заявок</Link>
    </div>
  );
}

export function GenericError({ code }: { code: string }) {
  return (
    <div className="a-note" data-tone="error" role="status">
      <h2>Не удалось загрузить данные</h2>
      <p className="m-0">
        Код: <code className="text-ink-2">{code}</code>
      </p>
    </div>
  );
}

/** Renders whichever notice matches a failed result. */
export function ResultNotice({ result, reference }: {
  result: Exclude<ApiResult<unknown>, { status: 'ok' }>;
  reference?: string;
}) {
  if (result.status === 'unavailable') return <BackendUnavailable code={result.code} />;
  if (result.status === 'forbidden') return <Forbidden />;
  if (result.status === 'notFound') return <NotFound reference={reference} />;
  if (result.status === 'error') return <GenericError code={result.code} />;
  // `unauthenticated` never reaches here: the workspace layout redirects to
  // the login screen before a page renders.
  return <GenericError code="unauthenticated" />;
}

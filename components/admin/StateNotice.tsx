import Link from 'next/link';

import type { ApiResult } from '@/lib/admin-api/types';

/*
 * Everything that is not the happy path.
 *
 * Each failure gets a plain-language explanation and, where one exists, a
 * next step. "Something went wrong" on a CRM leaves an operator unable to
 * tell whether a lead is missing or the backend is down — and those demand
 * opposite reactions.
 *
 * Nothing here renders a server message, a status code or a stack trace. The
 * `code` values are ours, from the adapter's own union; the technical detail
 * stays in the server log where it belongs.
 */

export function EmptyState({
  title, body, action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="a-empty">
      <span className="a-empty-mark" aria-hidden />
      <h2 className="a-empty-title">{title}</h2>
      <p className="a-empty-body">{body}</p>
      {action && <Link href={action.href} className="a-btn mt-2">{action.label}</Link>}
    </div>
  );
}

export function BackendUnavailable({ code }: { code: string }) {
  const unreachable = code === 'backend_unreachable' || code === 'storage_unavailable';
  return (
    <div className="a-note" data-tone="warn" role="status">
      <h2>{unreachable ? 'Сервер заявок не отвечает' : 'Панель не подключена к серверу'}</h2>
      {unreachable ? (
        <>
          <p>
            Заявки на месте — панель просто не смогла их прочитать. Обычно это
            проходит само за минуту.
          </p>
          <p>Если не прошло — обновите страницу или вернитесь чуть позже.</p>
        </>
      ) : (
        <p>
          Адрес сервера не задан в настройках развёртывания, поэтому панели
          некуда обращаться. Это настраивается один раз владельцем.
        </p>
      )}
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="a-note" data-tone="error" role="status">
      <h2>Недостаточно прав</h2>
      <p>
        У вашей роли нет доступа к этому разделу. Права выдаёт владелец —
        обратитесь к нему, если доступ действительно нужен.
      </p>
    </div>
  );
}

export function ReadOnlyPhase() {
  return (
    <div className="a-note" role="status">
      <h2>Режим чтения</h2>
      <p>
        Заявки сейчас записывает публичная форма. Изменение статуса и заметок
        откроется после переноса владения записью.
      </p>
    </div>
  );
}

export function NotFound({ reference }: { reference?: string }) {
  return (
    <div className="a-note" role="status">
      <h2>Заявка не найдена</h2>
      <p>
        {reference
          ? `Номера ${reference} нет в базе. Возможно, в ссылке опечатка.`
          : 'Такой заявки нет. Возможно, в ссылке опечатка.'}
      </p>
      <Link href="/admin/leads" className="a-btn">К списку заявок</Link>
    </div>
  );
}

export function GenericError() {
  return (
    <div className="a-note" data-tone="error" role="status">
      <h2>Не удалось загрузить данные</h2>
      <p>
        Что-то пошло не так на стороне сервера. Попробуйте обновить страницу —
        если повторится, сообщите владельцу.
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
  if (result.status === 'forbidden') {
    return result.code === 'read_only_phase' ? <ReadOnlyPhase /> : <Forbidden />;
  }
  if (result.status === 'notFound') return <NotFound reference={reference} />;
  // `unauthenticated` never reaches here: the workspace layout redirects to
  // the login screen before a page renders.
  return <GenericError />;
}

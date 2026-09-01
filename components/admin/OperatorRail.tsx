'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/admin-api/types';

/*
 * The operator's controls: pipeline status and the private note.
 *
 * The one client component on the detail screen, because these are the only
 * things on it that change. Everything else is rendered on the server.
 *
 * `canChange` is reported by the server and used only to render honestly —
 * showing a viewer a control that always fails would be worse than not
 * showing it. It is NOT the authorisation: Django re-checks
 * `change_projectlead` on every PATCH, and a viewer who re-enabled the button
 * in devtools would get a 403 from the server, which this component then
 * surfaces rather than swallows.
 */

const MESSAGES: Record<string, string> = {
  forbidden: 'У вашей роли нет прав на изменение.',
  unauthenticated: 'Сессия истекла. Войдите заново.',
  notFound: 'Заявка не найдена.',
  backend_unreachable: 'Бэкенд недоступен — изменение не сохранено.',
  storage_unavailable: 'База недоступна — изменение не сохранено.',
  validation: 'Значение не принято сервером.',
  network: 'Нет связи с сервером — изменение не сохранено.',
  read_only_phase: 'Режим чтения — запись пока принадлежит публичной форме.',
};

type Feedback = { tone: 'ok' | 'error'; text: string } | null;

export default function OperatorRail({
  reference, status, internalNote, canChange, readOnlyPhase = false,
}: {
  reference: string;
  status: LeadStatus;
  internalNote: string;
  canChange: boolean;
  /** Writes are off for everyone, not just this role. Different sentence. */
  readOnlyPhase?: boolean;
}) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(status);
  const [note, setNote] = useState(internalNote);
  const [savedNote, setSavedNote] = useState(internalNote);
  const [pending, setPending] = useState<'status' | 'note' | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function save(
    patch: { status?: LeadStatus; internalNote?: string },
    which: 'status' | 'note',
  ) {
    setPending(which);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/leads/${reference}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.ok) {
        const code = String(body?.error ?? 'error');
        setFeedback({ tone: 'error', text: MESSAGES[code] ?? 'Не удалось сохранить.' });
        // Put the control back where the server says it actually is.
        if (which === 'status') setCurrentStatus(status);
        return;
      }

      if (which === 'status') setCurrentStatus(body.status as LeadStatus);
      if (which === 'note') setSavedNote(body.internalNote ?? '');
      setFeedback({ tone: 'ok', text: 'Сохранено' });
      // The register and the dashboard counts are now stale.
      router.refresh();
    } catch {
      setFeedback({ tone: 'error', text: MESSAGES.network });
      if (which === 'status') setCurrentStatus(status);
    } finally {
      setPending(null);
    }
  }

  const noteDirty = note !== savedNote;

  return (
    <div className="a-rail">
      <div className="a-panel mb-6">
        <div className="a-panel-head">
          <h2 className="a-panel-title">Статус</h2>
        </div>
        <div className="p-6 pt-0">
          <label htmlFor="lead-status" className="sr-only">Статус заявки</label>
          <select
            id="lead-status"
            className="a-field"
            value={currentStatus}
            disabled={!canChange || pending !== null}
            onChange={(event) => {
              const next = event.target.value as LeadStatus;
              setCurrentStatus(next);
              save({ status: next }, 'status');
            }}
          >
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>{STATUS_LABEL[value]}</option>
            ))}
          </select>

          {!canChange && (
            <p className="text-[12.5px] text-ink-3 mt-3 mb-0">
              {readOnlyPhase
                ? 'Режим чтения — статус пока меняется на стороне записи.'
                : 'Только просмотр — изменение статуса недоступно вашей роли.'}
            </p>
          )}
          {pending === 'status' && (
            <p className="text-[12.5px] text-ink-3 mt-3 mb-0" role="status">Сохраняем…</p>
          )}
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-head">
          <h2 className="a-panel-title">Внутренняя заметка</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="a-private">
            <span className="a-private-tag">
              <span aria-hidden>●</span> Только для вас
            </span>
            <label htmlFor="lead-note" className="sr-only">Внутренняя заметка</label>
            <textarea
              id="lead-note"
              className="a-field"
              value={note}
              maxLength={4000}
              disabled={!canChange || pending !== null}
              placeholder={canChange ? 'Видна только вам' : 'Заметка пуста'}
              onChange={(event) => setNote(event.target.value)}
              aria-describedby="lead-note-hint"
            />
          </div>

          <p id="lead-note-hint" className="text-[12px] text-ink-3 mt-3 mb-0">
            Не видна клиенту и не возвращается публичным API.
          </p>

          {canChange && (
            <button
              type="button"
              className="a-btn mt-4 w-full"
              data-variant={noteDirty ? 'solid' : undefined}
              disabled={!noteDirty || pending !== null}
              onClick={() => save({ internalNote: note }, 'note')}
            >
              {pending === 'note' ? 'Сохраняем…' : noteDirty ? 'Сохранить заметку' : 'Сохранено'}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <p
          className="a-note mt-5"
          data-tone={feedback.tone === 'error' ? 'error' : undefined}
          role={feedback.tone === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}

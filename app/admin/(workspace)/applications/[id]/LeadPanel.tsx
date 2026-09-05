'use client';

import { useState, useTransition } from 'react';
import {
  addNote,
  addPayment,
  markPaid,
  setDeal,
  setLeadStatus,
  type ActionResult,
} from '@/app/admin/actions';
import {
  currencies,
  currencyLabel,
  leadStatuses,
  money,
  paymentKindLabel,
  paymentKinds,
  statusLabel,
  type LeadStatusName,
} from '@/lib/content/finance';

/*
 * The working column of a lead: status, private note, money.
 *
 * Everything here writes through a server action that checks the session again.
 * The note in particular never leaves this contour: no public route selects it,
 * and the bot is not allowed to forward it to the client it is about.
 */

type Payment = {
  id: string;
  amount: number;
  currency: string;
  kind: string;
  paidAt: string | null;
  dueAt: string | null;
  note: string | null;
};

const field =
  'w-full border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink';

export function LeadPanel({
  leadId,
  status,
  dealAmount,
  dealCurrency,
  payments,
}: {
  leadId: string;
  status: LeadStatusName;
  dealAmount: number | null;
  dealCurrency: string | null;
  payments: Payment[];
}) {
  const [current, setCurrent] = useState<LeadStatusName>(status);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<ActionResult>, ok = '') =>
    start(async () => {
      const result = await fn();
      setMessage(result.status === 'error' ? result.message : ok);
    });

  return (
    <div className="space-y-12">
      <section>
        <p className="label mb-4">Статус</p>
        <div className="flex flex-wrap gap-2">
          {leadStatuses.map((value) => (
            <button
              key={value}
              type="button"
              disabled={pending}
              aria-pressed={current === value}
              onClick={() => {
                const previous = current;
                setCurrent(value);
                run(async () => {
                  const result = await setLeadStatus(leadId, value);
                  if (result.status === 'error') setCurrent(previous);
                  return result;
                }, 'Статус изменён');
              }}
              className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs transition-colors disabled:opacity-50 ${
                current === value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-2 hover:border-ink hover:text-ink'
              }`}
            >
              {statusLabel[value]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="label mb-4">Сумма сделки</p>
        <form
          className="flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            run(
              () =>
                setDeal(
                  leadId,
                  String(form.get('amount') ?? ''),
                  String(form.get('currency') ?? 'TJS'),
                ),
              'Сумма сохранена',
            );
          }}
        >
          <input
            name="amount"
            inputMode="decimal"
            defaultValue={dealAmount ?? ''}
            placeholder="0"
            className={`${field} max-w-32`}
          />
          <select name="currency" defaultValue={dealCurrency ?? 'TJS'} className={`${field} w-28`}>
            {currencies.map((c) => (
              <option key={c} value={c}>
                {currencyLabel[c]}
              </option>
            ))}
          </select>
          <button type="submit" disabled={pending} className="label hover:text-ink">
            Сохранить
          </button>
        </form>
      </section>

      <section>
        <p className="label mb-4">Оплаты</p>

        {payments.length > 0 && (
          <ul className="mb-6 divide-y divide-line border-y border-line">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="tabular text-sm">{money(payment.amount, payment.currency)}</p>
                  <p className="text-xs text-ink-3">
                    {paymentKindLabel[payment.kind as keyof typeof paymentKindLabel]}
                    {payment.paidAt
                      ? ` · получено ${new Date(payment.paidAt).toLocaleDateString('ru-RU')}`
                      : payment.dueAt
                        ? ` · ждём до ${new Date(payment.dueAt).toLocaleDateString('ru-RU')}`
                        : ' · не оплачено'}
                  </p>
                </div>
                {!payment.paidAt && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => markPaid(payment.id), 'Отмечено полученным')}
                    className="label shrink-0 hover:text-ink"
                  >
                    Получено
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const el = event.currentTarget;
            run(async () => {
              const result = await addPayment(leadId, form);
              if (result.status === 'ok') el.reset();
              return result;
            }, 'Оплата добавлена');
          }}
        >
          <div className="flex flex-wrap gap-3">
            <input name="amount" inputMode="decimal" placeholder="сумма" className={`${field} max-w-28`} required />
            <select name="currency" defaultValue="TJS" className={`${field} w-24`}>
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {currencyLabel[c]}
                </option>
              ))}
            </select>
            <select name="kind" defaultValue="STAGE" className={`${field} w-40`}>
              {paymentKinds.map((k) => (
                <option key={k} value={k}>
                  {paymentKindLabel[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs text-ink-3">
              получено
              <input type="date" name="paidAt" className={`${field} block`} />
            </label>
            <label className="text-xs text-ink-3">
              ждём до
              <input type="date" name="dueAt" className={`${field} block`} />
            </label>
          </div>
          <button type="submit" disabled={pending} className="label hover:text-ink">
            Добавить оплату
          </button>
        </form>
      </section>

      <section>
        <p className="label mb-2">Приватная заметка</p>
        <p className="mb-4 text-xs leading-relaxed text-ink-3">
          Видите только вы. Не попадает на сайт и не уходит клиенту через бота.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            run(async () => {
              const result = await addNote(leadId, note);
              if (result.status === 'ok') setNote('');
              return result;
            }, 'Заметка добавлена');
          }}
        >
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border-b border-line bg-transparent pb-2 text-sm outline-none focus:border-ink"
          />
          <button type="submit" disabled={pending || !note.trim()} className="label mt-4 hover:text-ink disabled:opacity-40">
            Сохранить заметку
          </button>
        </form>
      </section>

      {message && (
        <p role="status" className="border-l-2 border-ink pl-4 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}

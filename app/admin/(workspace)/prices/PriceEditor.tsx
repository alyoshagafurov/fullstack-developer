'use client';

import { useState, useTransition } from 'react';
import { savePrices, type ActionResult } from '@/app/admin/actions';

/*
 * Prices, all fourteen on one screen.
 *
 * Fourteen services, one field each: opening fourteen separate pages to change
 * fourteen numbers is not editing, it is data entry. The whole list saves at
 * once, and a field left empty falls back to the price in the content file
 * rather than to nothing — so clearing a field is how the owner undoes a
 * change, and the placeholder shows him what it would go back to.
 */

export type PriceRow = {
  slug: string;
  num: string;
  title: string;
  fallbackPrice: string;
  fallbackDuration: string;
  price: string;
  duration: string;
  note: string;
  hidden: boolean;
};

const field =
  'w-full border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink';

export function PriceEditor({ rows }: { rows: PriceRow[] }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setMessage('');
        setError('');
        start(async () => {
          const result: ActionResult = await savePrices(data);
          if (result.status === 'error') setError(result.message);
          else setMessage('Цены сохранены. На сайте обновятся в течение пяти минут.');
        });
      }}
    >
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.slug} className="py-6">
            <div className="mb-5 flex items-baseline gap-4">
              <span className="tabular text-[0.6875rem] tracking-[0.18em] text-ink-3">
                {row.num}
              </span>
              <span className="text-base">{row.title}</span>
              <label className="ml-auto flex items-center gap-2 text-xs text-ink-2">
                <input
                  type="checkbox"
                  name={`hidden:${row.slug}`}
                  defaultChecked={row.hidden}
                  className="size-4"
                />
                Скрыть
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="label mb-2 block">Цена</span>
                <input
                  name={`price:${row.slug}`}
                  defaultValue={row.price}
                  placeholder={row.fallbackPrice || 'По договорённости'}
                  className={field}
                />
              </label>
              <label className="block">
                <span className="label mb-2 block">Срок</span>
                <input
                  name={`duration:${row.slug}`}
                  defaultValue={row.duration}
                  placeholder={row.fallbackDuration || '—'}
                  className={field}
                />
              </label>
              <label className="block">
                <span className="label mb-2 flex items-baseline gap-3">
                  Примечание
                  <span className="text-ink-3 normal-case tracking-normal">необязательно</span>
                </span>
                <input name={`note:${row.slug}`} defaultValue={row.note} className={field} />
              </label>
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="border-l-2 border-ink pl-4 text-sm">
          {error}
        </p>
      )}
      {message && <p className="text-sm text-ink-2">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-xs font-medium tracking-[0.04em] text-paper disabled:opacity-40"
      >
        {pending ? 'Сохраняю…' : 'Сохранить цены'}
      </button>
    </form>
  );
}

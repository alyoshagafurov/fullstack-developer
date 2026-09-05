'use client';

import { useRef, useState, useTransition } from 'react';
import { addExpense } from '@/app/admin/actions';
import { currencies, currencyLabel, expenseCategories } from '@/lib/content/finance';

/*
 * Adding a cost.
 *
 * The category is a fixed list, not free text: the owner named eleven, and a
 * field that accepts anything would quietly turn his reporting into a pile of
 * near-duplicates a month later.
 */

const field =
  'w-full border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink';

export function ExpenseForm() {
  const form = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      ref={form}
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        start(async () => {
          const result = await addExpense(data);
          setMessage(result.status === 'error' ? result.message : 'Расход записан');
          if (result.status === 'ok') form.current?.reset();
        });
      }}
    >
      <label className="block">
        <span className="label mb-3 block">Что это</span>
        <input name="title" required className={field} placeholder="Домен aly.lat на год" />
      </label>

      <div className="flex flex-wrap gap-3">
        <label className="min-w-28">
          <span className="label mb-3 block">Сумма</span>
          <input name="amount" inputMode="decimal" required className={field} />
        </label>
        <label className="w-24">
          <span className="label mb-3 block">Валюта</span>
          <select name="currency" defaultValue="TJS" className={field}>
            {currencies.map((c) => (
              <option key={c} value={c}>
                {currencyLabel[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-40">
          <span className="label mb-3 block">Дата</span>
          <input type="date" name="spentAt" className={field} />
        </label>
      </div>

      <label className="block">
        <span className="label mb-3 block">Категория</span>
        <select name="category" defaultValue={expenseCategories[0]} className={field}>
          {expenseCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-xs font-medium tracking-[0.04em] text-paper disabled:opacity-40"
      >
        {pending ? 'Записываю…' : 'Записать расход'}
      </button>

      {message && (
        <p role="status" className="text-sm text-ink-2">
          {message}
        </p>
      )}
    </form>
  );
}

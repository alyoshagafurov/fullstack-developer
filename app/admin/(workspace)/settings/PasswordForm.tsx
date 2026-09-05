'use client';

import { useActionState } from 'react';
import { changePassword, type ActionResult } from '@/app/admin/actions';

const field =
  'w-full border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink';

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    changePassword,
    null,
  );

  return (
    <form action={action} className="max-w-sm space-y-6">
      <label className="block">
        <span className="label mb-3 block">Текущий пароль</span>
        <input name="current" type="password" autoComplete="current-password" required className={field} />
      </label>

      <label className="block">
        <span className="label mb-3 block">Новый пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className={field}
        />
      </label>

      <label className="block">
        <span className="label mb-3 block">Ещё раз</span>
        <input
          name="repeat"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className={field}
        />
      </label>

      {state?.status === 'error' && (
        <p role="alert" className="border-l-2 border-ink pl-4 text-sm">
          {state.message}
        </p>
      )}
      {state?.status === 'ok' && (
        <p role="status" className="text-sm text-ink-2">
          Пароль изменён.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 items-center rounded-full bg-ink px-5 text-xs font-medium tracking-[0.04em] text-paper disabled:opacity-40"
      >
        {pending ? 'Меняю…' : 'Сменить пароль'}
      </button>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import { login, setupAdmin, type ActionResult } from '@/app/admin/actions';

/*
 * One form, two jobs.
 *
 * While the account table is empty this claims the admin; afterwards it signs
 * in. Doing it this way means the first password is chosen by the owner in his
 * own browser and never travels through a chat, an email or a config file.
 */

const field =
  'w-full border-b border-line bg-transparent pb-3 text-base outline-none transition-colors focus:border-ink';

export function AccessForm({ setup }: { setup: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    setup ? setupAdmin : login,
    null,
  );

  return (
    <form action={action} className="w-full max-w-sm">
      <p className="label mb-8">{setup ? 'Первый вход' : 'Вход'}</p>

      <h1 className="mb-10 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-[-0.03em]">
        {setup ? 'Задайте пароль' : 'Админка'}
      </h1>

      {setup && (
        <p className="mb-10 text-sm leading-relaxed text-ink-2">
          Аккаунта ещё нет. Придумайте пароль — он сохранится только в виде хеша, восстановить его
          будет нельзя.
        </p>
      )}

      <div className="space-y-8">
        <label className="block">
          <span className="label mb-4 block">Почта</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            required
            className={field}
          />
        </label>

        <label className="block">
          <span className="label mb-4 block">{setup ? 'Новый пароль' : 'Пароль'}</span>
          <input
            name="password"
            type="password"
            autoComplete={setup ? 'new-password' : 'current-password'}
            required
            minLength={setup ? 10 : undefined}
            className={field}
          />
        </label>

        {setup && (
          <label className="block">
            <span className="label mb-4 block">Ещё раз</span>
            <input
              name="repeat"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              className={field}
            />
          </label>
        )}
      </div>

      {state?.status === 'error' && (
        <p role="alert" className="mt-8 border-l-2 border-ink pl-4 text-sm leading-relaxed">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-12 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-[0.8125rem] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
      >
        {pending ? 'Проверяю…' : setup ? 'Создать аккаунт' : 'Войти'}
      </button>
    </form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/*
 * Sign in.
 *
 * The credentials go to this app's own route handler, which forwards them to
 * Django server-side. Nothing is stored in the browser: no token, no session,
 * no "remember me" flag in localStorage. The only thing the browser ends up
 * holding is an httpOnly cookie it cannot read.
 */

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Неверный логин или пароль.',
  rate_limited: 'Слишком много попыток. Подождите несколько минут.',
  backend_unreachable: 'Бэкенд недоступен. Попробуйте позже.',
  backend_not_configured: 'Бэкенд не подключён — вход невозможен.',
  no_session_issued: 'Бэкенд не выдал сессию. Обратитесь к администратору.',
  network: 'Не удалось связаться с сервером.',
};

export default function LoginForm({ expired }: { expired: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    let code: string | null = null;
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: String(form.get('username') ?? ''),
          password: String(form.get('password') ?? ''),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.ok) code = String(body?.error ?? 'invalid_credentials');
    } catch {
      code = 'network';
    }

    if (code) {
      setError(MESSAGES[code] ?? 'Не удалось войти.');
      setPending(false);
      return;
    }

    // The gate reads the session on the server, so the route must be
    // re-rendered rather than merely navigated to.
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {expired && !error && (
        <p className="a-note mb-6" role="status">
          Сессия истекла. Войдите заново.
        </p>
      )}

      {error && (
        <p className="a-note mb-6" data-tone="error" role="alert">
          {error}
        </p>
      )}

      <div className="mb-5">
        <label htmlFor="login-username" className="a-label">Логин</label>
        <input
          id="login-username"
          name="username"
          type="text"
          className="a-field"
          autoComplete="username"
          required
          disabled={pending}
        />
      </div>

      <div className="mb-7">
        <label htmlFor="login-password" className="a-label">Пароль</label>
        <input
          id="login-password"
          name="password"
          type="password"
          className="a-field"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </div>

      <button type="submit" className="a-btn w-full" data-variant="solid" disabled={pending}>
        {pending ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}

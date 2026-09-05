import { redirect } from 'next/navigation';
import { AccessForm } from './AccessForm';
import { adminState, currentAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Already signed in? There is nothing to do here.
  if (await currentAdmin()) redirect('/admin');

  const state = await adminState();

  if (state === 'unavailable') {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-20">
        <div className="w-full max-w-md">
          <p className="label mb-8">Админка</p>
          <h1 className="mb-8 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-[-0.03em]">
            База недоступна
          </h1>
          <p className="text-sm leading-relaxed text-ink-2">
            Войти нельзя, пока приложение не видит базу данных. Проверьте переменную
            <code className="mx-1.5 bg-shelf px-1.5 py-0.5 text-xs">DATABASE_URL</code>
            в настройках проекта на Vercel — она нужна и для Production, и для Preview.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-ink-3">
            Для входа понадобится ещё
            <code className="mx-1.5 bg-shelf px-1.5 py-0.5 text-xs">ADMIN_SESSION_SECRET</code>
            длиной не меньше 32 символов: ею подписывается сессия.
          </p>
          <p className="mt-10 text-sm text-ink-3">
            Публичный сайт от этого не страдает и работает как обычно.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-20">
      <AccessForm setup={state === 'setup'} />
    </div>
  );
}

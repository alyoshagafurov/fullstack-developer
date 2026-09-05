import { redirect } from 'next/navigation';
import { AccessForm } from './AccessForm';
import { adminState, currentAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Already signed in? There is nothing to do here.
  if (await currentAdmin()) redirect('/admin');

  const state = await adminState();

  if (state === 'unavailable') {
    /*
     * Name the actual cause rather than "something went wrong".
     *
     * Only presence is reported, never a value: a connection string carries the
     * database password, and a diagnostic screen is a page anyone can open.
     */
    const missing = [
      !process.env.DATABASE_URL && 'DATABASE_URL',
      (process.env.ADMIN_SESSION_SECRET ?? '').length < 32 && 'ADMIN_SESSION_SECRET',
    ].filter(Boolean) as string[];

    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-20">
        <div className="w-full max-w-md">
          <p className="label mb-8">Админка</p>
          <h1 className="mb-8 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight tracking-[-0.03em]">
            {missing.length > 0 ? 'Не хватает настроек' : 'База не отвечает'}
          </h1>

          {missing.length > 0 ? (
            <>
              <p className="text-sm leading-relaxed text-ink-2">
                В окружении не заданы переменные. Добавьте их в настройках проекта на Vercel, в
                разделе Environment Variables, для Production и Preview:
              </p>
              <ul className="mt-5 space-y-2">
                {missing.map((name) => (
                  <li key={name}>
                    <code className="bg-shelf px-2 py-1 text-xs">{name}</code>
                  </li>
                ))}
              </ul>
              {missing.includes('ADMIN_SESSION_SECRET') && (
                <p className="mt-5 text-xs leading-relaxed text-ink-3">
                  Секрет — любая случайная строка от 32 символов. Ею подписывается cookie сессии.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-ink-2">
              Переменные на месте, но подключиться к базе не вышло. Проверьте, что проект в Neon не
              на паузе и строка подключения ведёт на действующую базу.
            </p>
          )}

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

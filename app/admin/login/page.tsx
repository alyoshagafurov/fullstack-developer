import Link from 'next/link';
import { redirect } from 'next/navigation';

import LoginForm from '@/components/admin/LoginForm';
import { BackendUnavailable } from '@/components/admin/StateNotice';
import Logo from '@/components/ui/Logo';
import { fetchCurrentUser, isBackendConfigured } from '@/lib/admin-api';
import { readSession } from '@/lib/admin-api/session';

/*
 * Sign in.
 *
 * Sits outside the (workspace) group on purpose — it is the one admin screen
 * that must render without a session, and putting it inside the gate would
 * make it redirect to itself.
 */

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { expired?: string };
}) {
  const configured = isBackendConfigured();

  // Already signed in? Don't make them type it again.
  if (configured) {
    const session = readSession();
    if (session) {
      const me = await fetchCurrentUser(session);
      if (me.status === 'ok') redirect('/admin');
    }
  }

  return (
    <div className="min-h-[100svh] grid place-items-center px-5 py-16">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="a-brand mb-10" aria-label="ALY — на сайт">
          <Logo className="h-[15px] w-auto" />
          <span className="a-brand-tag">Панель</span>
        </Link>

        <h1 className="a-title mb-2">Вход</h1>
        <p className="text-ink-3 text-[13.5px] mb-8">
          Внутренняя панель управления заявками.
        </p>

        {configured ? (
          <LoginForm expired={searchParams.expired === '1'} />
        ) : (
          <BackendUnavailable code="backend_not_configured" />
        )}
      </div>
    </div>
  );
}

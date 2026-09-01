import { redirect } from 'next/navigation';

import Sidebar from '@/components/admin/Sidebar';
import { BackendUnavailable, ResultNotice } from '@/components/admin/StateNotice';
import { fetchCurrentUser, fetchSummary, isBackendConfigured } from '@/lib/admin-api';
import { readSession } from '@/lib/admin-api/session';

/*
 * The gate.
 *
 * Every admin screen is inside this layout, so every admin screen is behind
 * this check. It runs on the server, on every request, and it asks Django
 * rather than trusting the cookie: a cookie proves someone once logged in,
 * not that the session is still valid or that the account still has a role.
 *
 * This is not the only thing protecting the data — Django re-checks
 * authentication and permissions on every call the pages then make. Hiding a
 * screen is not authorisation, and nothing here is relied upon as if it were.
 */

// Never prerendered or cached: the answer depends on who is asking.
export const dynamic = 'force-dynamic';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="a-shell">
      <div />
      <main id="main" className="a-main">
        <div className="a-wrap">{children}</div>
      </main>
    </div>
  );
}

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  // Without a backend there is nobody to authenticate against. Say so rather
  // than bouncing the operator to a login form that cannot possibly work.
  if (!isBackendConfigured()) {
    return (
      <Frame>
        <header className="a-head">
          <div>
            <span className="a-eyebrow">Панель</span>
            <h1 className="a-title">Не настроено</h1>
          </div>
        </header>
        <BackendUnavailable code="backend_not_configured" />
      </Frame>
    );
  }

  const session = await readSession();
  if (!session) redirect('/admin/login');

  const me = await fetchCurrentUser(session);

  // Expired or revoked — send them back to sign in again.
  if (me.status === 'unauthenticated') redirect('/admin/login?expired=1');

  if (me.status !== 'ok') {
    return (
      <Frame>
        <header className="a-head">
          <h1 className="a-title">Панель</h1>
        </header>
        <ResultNotice result={me} />
      </Frame>
    );
  }

  // Authenticated but holding no role at all: Django would refuse every read
  // anyway, so the honest thing is to say why rather than show empty screens.
  if (!me.data.user.permissions.viewLeads) {
    return (
      <Frame>
        <header className="a-head">
          <div>
            <span className="a-eyebrow">{me.data.user.username}</span>
            <h1 className="a-title">Панель</h1>
          </div>
        </header>
        <div className="a-note" data-tone="error" role="status">
          <h2>Доступ не выдан</h2>
          <p>
            Учётная запись существует, но не входит ни в одну из ролей.
            Обратитесь к владельцу — доступ выдаётся вручную.
          </p>
        </div>
      </Frame>
    );
  }

  // The badge count. Shares one request with Overview via React's cache, and
  // a failure here must never block the shell — the badge simply stays off.
  const summary = await fetchSummary();
  const newCount = summary.status === 'ok' ? summary.data.byStatus.NEW ?? 0 : 0;

  return (
    <div className="a-shell">
      <Sidebar user={me.data.user} newCount={newCount} />
      <main id="main" className="a-main">
        <div className="a-wrap">
          {/* Said once, at the top of every screen, rather than only on the
              control that is off. An operator should learn the system's state
              before they try to change something and fail. */}
          {!me.data.writesEnabled && (
            <p className="a-note mb-6" role="status">
              Режим чтения — заявки пишет публичная форма. Изменение статуса и
              заметок пока недоступно.
            </p>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

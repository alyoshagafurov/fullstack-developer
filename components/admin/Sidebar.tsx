'use client';

import { Inbox, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import type { AdminUser } from '@/lib/admin-api/types';

/*
 * The rail.
 *
 * Three zones, separated because they are three different kinds of thing:
 * who this is (brand), where you can go (navigation), and who you are
 * (account, with the way out). Signing out sits below a rule rather than at
 * the end of the nav list — it is not a destination.
 *
 * A client component for one reason: `aria-current` needs the active route,
 * and a server layout cannot read the pathname. It holds no data and no
 * session; everything it shows arrives as a prop from the server.
 *
 * Below 1024 the rail becomes a horizontal bar rather than a drawer. Two
 * destinations do not justify a hamburger, a focus trap and an overlay.
 */

const LINKS = [
  { href: '/admin', label: 'Обзор', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Заявки', icon: Inbox, exact: false },
] as const;

export default function Sidebar({
  user,
  newCount = 0,
}: {
  user: AdminUser;
  /** Unanswered briefs. Shown on Заявки only when there are any. */
  newCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  async function signOut() {
    setLeaving(true);
    // The session cookies are httpOnly, so only the server can clear them.
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  }

  const initials = user.username.slice(0, 2);
  const roleLabel = user.role === 'ADMIN' ? 'Полный доступ' : 'Только просмотр';

  return (
    <div className="a-side">
      <div className="a-side-head">
        <Link href="/admin" className="a-brand" aria-label="ALY — панель управления">
          <span className="a-brand-mark" aria-hidden>AL</span>
          <span className="a-brand-text">
            <span className="a-brand-name">ALY</span>
            <span className="a-brand-sub">Панель</span>
          </span>
        </Link>
      </div>

      <p className="a-nav-label">Разделы</p>

      <nav className="a-nav" aria-label="Разделы панели">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          const badge = link.href === '/admin/leads' && newCount > 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="a-nav-item"
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="a-nav-ico" aria-hidden strokeWidth={1.75} />
              {link.label}
              {badge && (
                <span className="a-nav-badge">
                  {newCount}
                  <span className="sr-only"> новых заявок</span>
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={signOut}
          disabled={leaving}
          className="a-nav-item a-nav-signout"
        >
          <LogOut className="a-nav-ico" aria-hidden strokeWidth={1.75} />
          {leaving ? 'Выходим…' : 'Выйти'}
        </button>
      </nav>

      <div className="a-side-foot hidden lg:block">
        <div className="a-who">
          <span className="a-who-avatar" aria-hidden>{initials}</span>
          <span className="a-who-text">
            <span className="a-who-name">{user.username}</span>
            <span className="a-who-role">{roleLabel}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={leaving}
          className="a-btn w-full"
          data-variant="quiet"
        >
          <LogOut size={15} aria-hidden strokeWidth={1.75} />
          {leaving ? 'Выходим…' : 'Выйти'}
        </button>
      </div>
    </div>
  );
}

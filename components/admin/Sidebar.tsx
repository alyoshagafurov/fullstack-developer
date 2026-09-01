'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import Logo from '@/components/ui/Logo';
import type { AdminUser } from '@/lib/admin-api/types';

/*
 * Navigation.
 *
 * A client component for one reason: `aria-current` needs the active route,
 * and a server layout cannot read the pathname. It holds no data and no
 * session — the operator's name arrives as a prop from the server.
 *
 * Below 1024 the rail becomes a horizontal bar rather than a drawer. Two
 * destinations do not justify a hamburger, a focus trap and an overlay.
 */

const LINKS = [
  { href: '/admin', label: 'Обзор', exact: true },
  { href: '/admin/leads', label: 'Заявки', exact: false },
];

export default function Sidebar({ user }: { user: AdminUser }) {
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

  return (
    <div className="a-side">
      <div className="a-side-head">
        <Link href="/admin" className="a-brand" aria-label="ALY — панель">
          <Logo className="h-4 w-auto" />
          <span className="a-brand-tag">Панель</span>
        </Link>
        <span className="a-brand-tag lg:hidden border-0 pl-0">{user.username}</span>
      </div>

      <nav className="a-nav" aria-label="Разделы панели">
        {LINKS.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className="a-nav-item"
            aria-current={isActive(link.href, link.exact) ? 'page' : undefined}
          >
            <span className="a-nav-index" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
            {link.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={signOut}
          disabled={leaving}
          className="a-nav-item a-nav-signout"
        >
          <span className="a-nav-index" aria-hidden>03</span>
          {leaving ? 'Выходим…' : 'Выйти'}
        </button>
      </nav>

      <div className="a-side-foot hidden lg:block">
        <p className="a-who">
          <strong>{user.username}</strong>
          <br />
          {user.role === 'ADMIN' ? 'Полный доступ' : 'Только просмотр'}
        </p>
        <button
          type="button"
          onClick={signOut}
          disabled={leaving}
          className="a-btn w-full"
        >
          {leaving ? 'Выходим…' : 'Выйти'}
        </button>
      </div>
    </div>
  );
}

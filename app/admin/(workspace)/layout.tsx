import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { logout } from '@/app/admin/actions';
import { requireAdmin } from '@/lib/auth';

/*
 * The workspace shell: everything behind the session, and nothing else.
 *
 * The guard here is convenience, not security — every page and every action
 * checks for itself. This exists so a logged-out visitor lands on the login
 * screen instead of an error, and so the navigation is written once.
 */

const NAV = [
  { href: '/admin', label: 'Обзор' },
  { href: '/admin/applications', label: 'Заявки' },
  { href: '/admin/finance', label: 'Финансы' },
  { href: '/admin/projects', label: 'Кейсы' },
  { href: '/admin/testimonials', label: 'Отзывы' },
  { href: '/admin/settings', label: 'Настройки' },
];

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
      <nav
        aria-label="Разделы админки"
        className="shrink-0 border-b border-line bg-paper px-5 py-4 lg:w-56 lg:border-r lg:border-b-0 lg:px-6 lg:py-8"
      >
        <Link href="/" className="mb-8 hidden items-center lg:flex" aria-label="На сайт">
          <Logo className="h-5 w-auto" />
        </Link>

        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center whitespace-nowrap px-3 text-sm text-ink-2 transition-colors hover:text-ink lg:w-full lg:px-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden border-t border-line pt-6 lg:block">
          <p className="label mb-3 break-all">{gate.user.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center text-sm text-ink-3 transition-colors hover:text-ink"
            >
              Выйти
            </button>
          </form>
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-5 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}

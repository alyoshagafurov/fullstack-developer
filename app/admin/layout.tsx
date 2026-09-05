import type { Metadata } from 'next';

/*
 * The admin root exists only to keep this section out of every index.
 *
 * The session guard and the navigation live one level down, in the (workspace)
 * group, so that /admin/login can render without either.
 */
export const metadata: Metadata = {
  title: 'Админка',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ground">{children}</div>;
}

import type { Metadata } from 'next';

import './admin.css';

/*
 * The outer admin frame.
 *
 * Deliberately does no authentication. The login screen lives under /admin
 * too, and a gate here would redirect it to itself forever. The gate is one
 * level down, in (workspace)/layout.tsx, which every real admin screen sits
 * inside and the login screen does not.
 */

export const metadata: Metadata = {
  title: 'ALY — панель',
  // An internal tool has no business in search results, and a preview card
  // for it would be a small information leak.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminFrame({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}

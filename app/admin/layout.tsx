import type { Metadata } from 'next';
import '@fontsource-variable/onest';
import '../globals.css';
import { site } from '@/lib/content/site';

/*
 * The admin's own document.
 *
 * It used to borrow <html> from app/layout.tsx. That layout is gone: the public
 * site moved under a `[lang]` segment and now owns its own root layout, so each
 * part of the app — the site, the admin, the Mini App — writes its own <html>.
 * The admin is Russian and never indexed.
 *
 * The session guard and the navigation live one level down, in the (workspace)
 * group, so that /admin/login can render without either.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Админка', template: `%s — ${site.brand}` },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-ground">{children}</div>
      </body>
    </html>
  );
}

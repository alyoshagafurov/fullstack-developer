import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { Grain } from '@/components/ui/Grain';

/*
 * The public site's shell.
 *
 * The marketing header and footer live here rather than in the root layout so
 * that /admin does not inherit them. Before this split the admin login screen
 * carried the site navigation across the top — "Проекты, Услуги, Обо мне" over
 * a password field — which read as a broken page.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
      >
        К содержанию
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Grain />
    </>
  );
}

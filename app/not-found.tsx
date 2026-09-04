import Link from 'next/link';

import Action from '@/components/ui/Action';
import Logo from '@/components/ui/Logo';
import Rail from '@/components/ui/Rail';

/*
 * 404 — built from the same primitives as the rest of the site, so a wrong URL
 * still lands somewhere that looks like the brand.
 */
export default function NotFound() {
  return (
    <main id="main" className="shell relative flex min-h-[100svh] flex-col justify-center py-24">
      <Link href="/" aria-label="aly — на главную" className="mb-12 inline-flex min-h-[44px] items-center self-start">
        <Logo className="h-8 w-auto" />
      </Link>

      <Rail label="Ошибка">404</Rail>
      <h1 className="display text-d-xl text-ink">404</h1>
      <p className="mt-6 max-w-[40ch] text-[16px] leading-[1.6] text-ink-2">
        Страница не найдена. Возможно, ссылка устарела или её больше нет.
      </p>

      <div className="mt-10">
        <Action href="/" variant="solid">На главную</Action>
      </div>
    </main>
  );
}

import Logo from '@/components/ui/Logo';
import Action from '@/components/ui/Action';

/*
 * 404 — built from the same primitives as the rest of the site, so a wrong URL
 * still lands somewhere that looks like the brand.
 */
export default function NotFound() {
  return (
    <main id="main" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute inset-x-0 top-0 h-[50vh] opacity-30
                   [mask-image:radial-gradient(60%_60%_at_50%_10%,#000,transparent)]"
      />
      <div className="shell relative">
        <a href="/" aria-label="ALY" className="inline-block mb-14 opacity-90 hover:opacity-100 transition-opacity">
          <Logo className="h-5 w-auto" />
        </a>

        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-signal mb-6">Error 404</p>
        <h1 className="display text-d-xl text-ink leading-[0.9] mb-8">404</h1>
        <p className="text-lead text-ink-2 max-w-sm mb-12">
          Страница не найдена. Возможно, ссылка устарела или её больше нет.
        </p>

        <Action href="/" variant="solid">На главную</Action>
      </div>
    </main>
  );
}

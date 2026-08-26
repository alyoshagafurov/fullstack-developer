import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <main id="main" className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6">
      {/* Giant faint logo watermark — the real wordmark */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute w-[86%] md:w-[52%] aspect-[720/405] bg-[url('/aly-logo.png')] bg-contain bg-no-repeat bg-center opacity-[0.05]"
      />

      <div className="relative z-10 flex flex-col items-center gap-7">
        <Logo className="h-9 w-auto" />
        <div className="display text-ink text-[22vw] md:text-[9rem] leading-none tabular-nums">404</div>
        <p className="text-ink-2 text-lg max-w-sm leading-relaxed">
          Страница не найдена. Возможно, ссылка устарела или её больше нет.
        </p>
        <Link href="/" data-hover className="btn btn-primary !rounded-xl">
          <ArrowLeft size={17} /> На главную
        </Link>
      </div>
    </main>
  );
}

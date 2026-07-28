import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AlyMark from '@/components/AlyMark';

export default function NotFound() {
  return (
    <main id="main" className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6">
      {/* Giant faint logo watermark */}
      <AlyMark
        variant="outline"
        strokeWidth={1.2}
        className="pointer-events-none select-none absolute w-[86%] md:w-[52%] text-white/[0.05]"
      />

      <div className="relative z-10 flex flex-col items-center gap-7">
        <AlyMark title="ALY" className="h-10 w-auto text-white" />
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

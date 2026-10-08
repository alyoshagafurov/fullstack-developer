import { Logo } from '@/components/ui/Logo';

/*
 * The Mini App's own loading state: the wordmark, breathing, in place of
 * "Загружаю…" or a blank screen. It answers the same question either way —
 * "something is happening" — in the one mark the rest of the app already
 * carries, rather than borrowed system type.
 *
 * The wordmark file is cut for a light ground (see components/ui/Logo.tsx)
 * and inverted here, exactly as Header.tsx inverts it for its own dark band —
 * every screen this splash appears on is the Mini App's black.
 *
 * `full` centers it in most of the viewport, for a screen with nothing else
 * yet — the admin shell before Telegram's SDK has settled. Without it, the
 * splash sits in the more modest space a tab's own first fetch had: the nav
 * and tabs are already on screen above it, so filling 60% of the viewport
 * would shove them off the fold for no reason.
 */
export function AlySplash({ full = false }: { full?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center ${full ? 'min-h-[60svh]' : 'py-16'}`}
    >
      <Logo className={`aly-breathe w-auto invert ${full ? 'h-12' : 'h-8'}`} priority={full} />
      <span className="sr-only">Загрузка</span>
    </div>
  );
}

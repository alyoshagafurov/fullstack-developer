import Link from 'next/link';
import { Lines } from '@/components/museum/Lines';
import { ArrowIcon } from '@/components/museum/Icons';

/*
 * The opening of an inner page: the hall's name as large as the room allows,
 * the curator's note in brass under it, and the small label in the corner for
 * whoever wants more. The way back sits in that corner too, as a quiet link
 * rather than a label over the title.
 */
export function HallHead({
  title,
  script,
  note,
  back,
  children,
  size = 'hall',
}: {
  title: string | readonly string[];
  script?: string;
  note?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
  size?: 'hall' | 'room';
}) {
  const lines = typeof title === 'string' ? [title] : title;

  return (
    <section
      data-lit
      className="relative isolate overflow-hidden"
      style={{ '--lx': '24', '--ly': '20' } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at calc(var(--lx) * 1%) calc(var(--ly) * 1%), rgb(255 236 204 / 0.12), transparent 50%)',
        }}
      />
      <div className="hall flex min-h-[62svh] flex-col justify-end pt-32 pb-14 md:min-h-[70svh] md:pt-40 md:pb-20">
        <h1 className={size === 'hall' ? 'hall-title' : 'hall-title text-[clamp(2.75rem,8vw,8rem)]'}>
          <Lines lines={lines} />
        </h1>
        {script && (
          <p className="script mt-3 ml-1 -rotate-[3deg] text-[clamp(1.5rem,3vw,2.75rem)]">{script}</p>
        )}

        {(note || children || back) && (
          <div className="mt-12 flex flex-col gap-8 md:mt-16 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap items-center gap-3">{children}</div>
            <div className="md:text-right">
              {note && <div className="wall-note md:ml-auto">{note}</div>}
              {back && (
                <Link href={back.href} className="link-quiet mt-5 inline-flex items-center gap-2 text-sm">
                  <ArrowIcon className="size-3.5 rotate-180" />
                  {back.label}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {/* A floor strip along the foot of every room's first wall. */}
      <div aria-hidden className="led absolute inset-x-0 bottom-0 h-px opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-8 h-16 bg-[radial-gradient(ellipse_55%_100%_at_30%_0%,rgb(255_190_120/0.16),transparent_70%)]"
      />
    </section>
  );
}

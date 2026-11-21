import Link from 'next/link';
import { ChevronIcon } from '@/components/museum/Icons';

/*
 * The opening of an inner page, the way an Apple page opens: the name of the
 * page, one quiet line, the actions, and — small — the way back and any note.
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
  const text = typeof title === 'string' ? title : title.join(' ');

  return (
    <section className="bg-wall-2 pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="hall text-center">
        {back && (
          <Link href={back.href} className="link-more mb-6 text-sm">
            <ChevronIcon className="size-2.5 rotate-180" />
            {back.label}
          </Link>
        )}
        <h1 className={size === 'hall' ? 'hall-title' : 'hall-title text-[clamp(2.25rem,5.6vw,4.5rem)]'}>{text}</h1>
        {script && <p className="lead-line mx-auto mt-3 max-w-2xl text-bone-2">{script}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
        {note && <div className="wall-note mx-auto mt-8 max-w-xl">{note}</div>}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowIcon } from '@/components/museum/Icons';

/*
 * The opening of an inner page, in the voice of the home page: warm paper, the
 * page's name in the wide heavy type, one quiet line, the actions, and the way
 * back as a small link.
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
    <section className="pt-32 pb-14 md:pt-40 md:pb-20">
      <div className="hall">
        {back && (
          <Link href={back.href} className="link-quiet mb-8 inline-flex items-center gap-2 text-sm">
            <ArrowIcon className="size-3.5 rotate-180" />
            {back.label}
          </Link>
        )}
        <h1 data-rise className={size === 'hall' ? 'hall-title' : 'hall-title text-[clamp(2rem,5.6vw,5rem)]'}>
          <span className="line-mask">
            <span>{text}</span>
          </span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            {script && <p className="lead-line max-w-xl">{script}</p>}
            {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
          </div>
          {note && <div className="wall-note md:text-right">{note}</div>}
        </div>
      </div>
    </section>
  );
}

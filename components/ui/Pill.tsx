import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/*
 * The only button shape on the site.
 *
 * Both references control everything through the same small round pill: the
 * black one carries the single real action on a screen, the outline one carries
 * everything else. Nothing here is a rectangle with a 16px radius.
 */

type Variant = 'solid' | 'outline' | 'quiet';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap ' +
  'font-medium transition-[background-color,color,border-color,opacity] duration-200 ' +
  'ease-[var(--ease-studio)] disabled:opacity-40 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  solid: 'bg-ink text-paper hover:bg-ink-2',
  outline: 'border border-line-2 text-ink hover:border-ink hover:bg-ink hover:text-paper',
  quiet: 'text-ink-2 hover:text-ink',
};

// 44px minimum on both sizes: a touch target is not a place to save space.
const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-4 text-[0.75rem] tracking-[0.06em]',
  md: 'min-h-12 px-6 text-[0.8125rem] tracking-[0.04em]',
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Pill({
  variant = 'outline',
  size = 'md',
  className = '',
  children,
  ...rest
}: Common & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function PillLink({
  href,
  variant = 'outline',
  size = 'md',
  className = '',
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className'>) {
  const external = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (external) {
    return (
      <a href={href} className={cls} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

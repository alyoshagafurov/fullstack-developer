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
  'transition-[background-color,color,border-color,opacity] duration-200 ' +
  'ease-[var(--ease-studio)] disabled:opacity-40 disabled:pointer-events-none';

/*
 * `solid` is the one shape on the site that has to be unmistakably a button.
 *
 * Everything else here is a hairline and a letterspaced label, which is right
 * for navigation and wrong for the action the page exists to produce. So the
 * filled variant is heavier and taller than the others rather than the same
 * pill in a different colour.
 */
const variants: Record<Variant, string> = {
  solid: 'bg-ink text-paper font-semibold hover:bg-ink-2',
  outline:
    'border border-line-2 text-ink font-medium hover:border-ink hover:bg-ink hover:text-paper',
  quiet: 'text-ink-2 font-medium hover:text-ink',
};

// 44px minimum everywhere: a touch target is not a place to save space.
const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-5 text-[0.8125rem]',
  md: 'min-h-14 px-8 text-[0.875rem]',
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

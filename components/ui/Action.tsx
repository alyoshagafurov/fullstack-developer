'use client';

import Link from 'next/link';

/*
 * The only button/link in the system.
 *
 * Four variants, and the signal colour appears in exactly one of them — that
 * is how the palette rule ("teal means something happens here") is enforced
 * structurally rather than by discipline.
 *
 * Renders <Link> for internal routes, <a> for external, <button> otherwise.
 */

type Variant = 'solid' | 'signal' | 'ghost' | 'text';

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  external?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  'aria-label'?: string;
};

const VARIANTS: Record<Variant, string> = {
  /* Light block on the dark canvas — the loudest thing on the page. */
  solid: 'bg-ink text-base hover:bg-white',
  /* The signal. Primary conversion only. */
  signal: 'bg-signal text-base-deep hover:bg-signal-deep',
  /* Quiet, bordered — secondary paths. */
  ghost: 'border border-line-2 text-ink hover:border-ink hover:bg-ink/[0.04]',
  /* Inline, no chrome. */
  text: 'text-signal hover:text-ink px-0 py-0',
};

export default function Action({
  children, href, onClick, variant = 'solid', className = '',
  external, type = 'button', disabled, ...rest
}: Props) {
  const chrome = variant === 'text' ? '' : 'px-6 py-3.5 rounded-full';
  const cls =
    `inline-flex items-center justify-center gap-2.5 font-medium text-[0.9375rem] ` +
    `transition-colors duration-200 ease-out outline-none ` +
    `${chrome} ${VARIANTS[variant]} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`;

  if (href && href.startsWith('/')) {
    return <Link href={href} className={cls} onClick={onClick} {...rest}>{children}</Link>;
  }
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>
      {children}
    </button>
  );
}

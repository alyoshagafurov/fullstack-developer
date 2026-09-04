'use client';

import Link from 'next/link';

/*
 * The only button/link in the system.
 *
 * Four variants, and the one colour appears in exactly one of them: `signal`
 * is the primary conversion — the copper control — and it is used once per
 * screen. `solid` is warm white for a secondary block, `ghost` is a control
 * drawn as a lit edge, `text` is inline.
 *
 * States are light, not colour: hovering brings up a ring of light around
 * the control, focus adds the offset outline, pressing settles it by a
 * pixel. See `.act` in globals.css.
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
  solid: 'act bg-ink text-base hover:bg-ink-bright',
  signal: 'act bg-copper text-base hover:bg-copper-bright active:bg-copper-deep',
  ghost: 'act act-ghost text-ink',
  text: 'lnk text-ink hover:text-copper px-0 py-0',
};

export default function Action({
  children, href, onClick, variant = 'solid', className = '',
  external, type = 'button', disabled, ...rest
}: Props) {
  const chrome = variant === 'text' ? '' : 'min-h-[48px] px-6';
  const cls =
    `inline-flex items-center justify-center gap-2.5 text-[14px] font-medium tracking-[0.01em] ` +
    `outline-none ${chrome} ${VARIANTS[variant]} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`;

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

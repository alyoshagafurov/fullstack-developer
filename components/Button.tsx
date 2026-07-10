'use client';

import { useRef, MouseEvent } from 'react';

/*
 * Premium CTA button.
 *  • variants: primary (white) / ghost (bordered)
 *  • ripple on click
 *  • subtle magnetic pull toward the cursor (desktop)
 *  • carries a custom-cursor label via data-cursor
 * Renders an <a> when `href` is provided, otherwise a <button>.
 */

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  className?: string;
  cursorLabel?: string;
  external?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  cursorLabel,
  external,
  type = 'button',
  disabled,
}: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const ripple = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const span = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    span.className = 'ripple';
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(span);
    setTimeout(() => span.remove(), 620);
  };

  // Subtle magnetic pull
  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia('(max-width: 768px)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  const cls = `btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`;
  const handleClick = (e: MouseEvent) => {
    ripple(e);
    onClick?.();
  };

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor={cursorLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={cls}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor={cursorLabel}
      className={cls}
    >
      {children}
    </button>
  );
}

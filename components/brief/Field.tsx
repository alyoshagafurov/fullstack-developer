'use client';

import { useId } from 'react';

/*
 * One labelled input in the brief — text or multiline.
 *
 * The label is a real <label for>, the hint and the error are wired through
 * aria-describedby, and the error carries role="alert" so a screen reader
 * announces it the moment it appears. Focus is a warm bronze border rather
 * than a browser outline, matching the rest of the Dark Luxury system.
 */

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: string;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'email' | 'url';
  maxLength?: number;
  /** Shows "123 / 2000" once the visitor is close to the limit. */
  counter?: boolean;
  autoFocus?: boolean;
  inputMode?: 'text' | 'email' | 'url';
  autoComplete?: string;
};

export default function Field({
  label, value, onChange, placeholder, hint, error, optional,
  multiline, rows = 4, type = 'text', maxLength, counter, autoFocus,
  inputMode, autoComplete,
}: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;

  const base =
    'w-full rounded-xl border bg-white/[0.02] px-4 py-3.5 text-ink text-[15px] placeholder:text-muted ' +
    'outline-none transition-colors duration-200 focus:bg-white/[0.04] ' +
    (error
      ? 'border-accent/70 focus:border-accent'
      : 'border-line focus:border-accent/55');

  const nearLimit = !!maxLength && value.length > maxLength * 0.75;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label htmlFor={id} className="label text-[10px] text-ink-2">
          {label}
          {optional && <span className="ml-2 text-muted normal-case tracking-normal">({optional})</span>}
        </label>
        {counter && nearLimit && (
          <span className="text-[11px] tabular-nums text-muted">
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          className={`${base} resize-none leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          className={base}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="mt-2 text-[12.5px] text-muted leading-relaxed">{hint}</p>
      )}
      {error && (
        <p id={errId} role="alert" className="mt-2 text-[12.5px] text-accent leading-relaxed">{error}</p>
      )}
    </div>
  );
}

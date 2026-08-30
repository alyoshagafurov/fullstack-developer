'use client';

import { useId, useRef } from 'react';

/*
 * The two controls the brief is built from.
 *
 * Choice — an editorial selection, not a <select>. Options are hairline rows
 * with a hung number and a rule that fills with the signal colour when picked.
 * It exposes a real radiogroup to assistive tech and uses roving tabindex, so
 * the whole brief is answerable from the keyboard.
 *
 * Field — a labelled input or textarea. The <label> is bound with htmlFor/id,
 * the hint and the error are wired through aria-describedby, and the error
 * carries role="alert" so it is announced the moment it appears.
 */

/* ── Choice ────────────────────────────────────────────────────────────── */

export type Option<T extends string> = { value: T; label: string };

export function Choice<T extends string>({
  legend, options, value, onChange, error, columns = 2,
}: {
  legend: string;
  options: Option<T>[];
  value: T | '';
  onChange: (v: T) => void;
  error?: string;
  columns?: 1 | 2;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const errId = useId();

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const last = options.length - 1;
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[data-opt]')[next]?.focus();
  };

  const anySelected = options.some((o) => o.value === value);

  return (
    <div>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={legend}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errId : undefined}
        className={`grid ${columns === 2 ? 'sm:grid-cols-2 sm:gap-x-10' : ''} border-t border-line`}
      >
        {options.map((o, i) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              data-opt
              role="radio"
              aria-checked={on}
              tabIndex={on || (!anySelected && i === 0) ? 0 : -1}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group relative flex items-baseline gap-5 border-b border-line py-4 text-left
                         outline-none transition-colors duration-200
                         focus-visible:ring-1 focus-visible:ring-signal/70 focus-visible:ring-offset-4
                         focus-visible:ring-offset-base"
            >
              <span
                className={`shrink-0 font-mono text-[0.625rem] transition-colors duration-200
                            ${on ? 'text-signal' : 'text-ink-3 group-hover:text-ink-2'}`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`display text-[clamp(1.05rem,1.5vw,1.5rem)] leading-tight transition-colors duration-200
                            ${on ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}
              >
                {o.label}
              </span>
              {/* the rule fills to mark the selection */}
              <span
                aria-hidden
                className={`absolute left-0 -bottom-px h-px w-full origin-left bg-signal
                            transition-transform duration-300 ease-out
                            ${on ? 'scale-x-100' : 'scale-x-0'}`}
              />
            </button>
          );
        })}
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-3 text-micro text-signal">{error}</p>
      )}
    </div>
  );
}

/* ── Field ─────────────────────────────────────────────────────────────── */

export function Field({
  label, value, onChange, placeholder, error, optional, multiline, rows = 5,
  type = 'text', maxLength, counter, autoComplete, inputMode, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  optional?: string;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'email' | 'url';
  maxLength?: number;
  counter?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'url' | 'tel';
  required?: boolean;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const nearLimit = !!maxLength && value.length > maxLength * 0.75;

  const base =
    'w-full bg-transparent border-b px-0 py-3 text-ink text-lead placeholder:text-ink-3 ' +
    'outline-none transition-colors duration-200 ' +
    (error ? 'border-signal' : 'border-line focus:border-signal/60');

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <label htmlFor={id} className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-3">
          {label}
          {required && <span aria-hidden="true"> *</span>}
          {optional && <span className="ml-2 normal-case tracking-normal">({optional})</span>}
        </label>
        {counter && nearLimit && (
          <span className="font-mono text-[0.625rem] tabular-nums text-ink-3">
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
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errId : undefined}
          className={`${base} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errId : undefined}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={base}
        />
      )}

      {error && (
        <p id={errId} role="alert" className="mt-2 text-micro text-signal">{error}</p>
      )}
    </div>
  );
}

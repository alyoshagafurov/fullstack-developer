'use client';

import { useId, useRef } from 'react';

import { Led } from '@/components/ui/Panel';

/*
 * The two controls the brief is built from.
 *
 * Choice — an editorial selection, not a <select>. Each option is a low panel
 * with a lit edge: the pointer brightens it, the picked one is held on and
 * its mark turns copper. It exposes a real radiogroup to assistive tech and
 * uses roving tabindex, so the whole brief is answerable from the keyboard.
 *
 * Field — a labelled input or textarea set into a panel whose bottom edge
 * lights while the field has focus and stays lit while it has an error. The
 * <label> is bound with htmlFor/id, the error is wired through
 * aria-describedby and carries role="alert" so it is announced the moment it
 * appears.
 */

/* ── Choice ────────────────────────────────────────────────────────────── */

export type Option<T extends string> = { value: T; label: string };

export function Choice<T extends string>({
  legend, options, value, onChange, error, columns = 2, required,
}: {
  legend: string;
  options: Option<T>[];
  value: T | '';
  onChange: (v: T) => void;
  error?: string;
  columns?: 1 | 2;
  required?: boolean;
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
        aria-required={required || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errId : undefined}
        className={`grid gap-2 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}
      >
        {options.map((o, i) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              data-opt
              data-light=""
              role="radio"
              aria-checked={on}
              tabIndex={on || (!anySelected && i === 0) ? 0 : -1}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`lit panel group flex min-h-[64px] items-baseline gap-4 px-5 py-4 text-left ${
                on ? 'panel-raised' : ''
              }`}
            >
              <Led className={`led-flat ${on ? 'led-on' : ''}`} />
              <span
                aria-hidden
                className={`mt-2 h-[6px] w-[6px] shrink-0 ${on ? 'bg-copper' : 'bg-edge-2 group-hover:bg-ink-3'}`}
              />
              <span
                className={`display text-[clamp(1rem,0.9rem+0.5vw,1.2rem)] leading-tight ${
                  on ? 'text-ink' : 'text-ink-2 group-hover:text-ink'
                }`}
              >
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-3 text-[13px] text-copper">
          {error}
        </p>
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

  const control =
    'block w-full bg-transparent px-5 pb-4 pt-1 text-[17px] leading-[1.5] text-ink ' +
    'placeholder:text-ink-3 outline-none';

  return (
    <div>
      <div data-light="" className="lit panel field">
        <div className="flex items-baseline justify-between gap-4 px-5 pb-1 pt-4">
          <label htmlFor={id} className="label">
            {label}
            {required && <span aria-hidden="true"> *</span>}
            {optional && <span className="ml-2 normal-case tracking-normal">({optional})</span>}
          </label>
          {counter && nearLimit && (
            <span className="text-[11px] tabular-nums text-ink-3">
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
            className={`${control} resize-y`}
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
            className={control}
          />
        )}

        <Led at="bottom" className={`led-flat ${error ? 'led-on' : ''}`} />
      </div>

      {error && (
        <p id={errId} role="alert" className="mt-2 text-[13px] text-copper">
          {error}
        </p>
      )}
    </div>
  );
}

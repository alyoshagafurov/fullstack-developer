'use client';

import { useRef } from 'react';
import { Check } from 'lucide-react';

/*
 * The brief's choice control — single or multiple.
 *
 * Rendered as real radios/checkboxes to the accessibility tree (not a list of
 * unlabelled buttons), with roving arrow-key movement inside the group so the
 * whole brief can be completed from the keyboard. Selection is bronze: a warm
 * border and a faint wash, never a filled block.
 */

export type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  name: string;
  options: Option<T>[];
  /** Single-select passes a string, multi-select an array. */
  value: T | '' | T[];
  onChange: (next: T | T[]) => void;
  multi?: boolean;
  columns?: 1 | 2 | 3;
  /** Wired to the step's error text so screen readers announce it. */
  describedBy?: string;
  invalid?: boolean;
  label: string;
};

export default function OptionGrid<T extends string>({
  name, options, value, onChange, multi = false, columns = 2, describedBy, invalid, label,
}: Props<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const selected = (v: T) => (multi ? (value as T[]).includes(v) : value === v);

  const toggle = (v: T) => {
    if (!multi) return onChange(v);
    const list = value as T[];
    onChange(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  /* Arrow keys move between options; Home/End jump to the ends. */
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
    const btns = groupRef.current?.querySelectorAll<HTMLButtonElement>('[data-opt]');
    btns?.[next]?.focus();
  };

  const cols = columns === 1 ? '' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <div
      ref={groupRef}
      role={multi ? 'group' : 'radiogroup'}
      aria-label={label}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={`grid gap-2.5 ${cols}`}
    >
      {options.map((o, i) => {
        const on = selected(o.value);
        return (
          <button
            key={o.value}
            type="button"
            data-opt
            data-hover
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            name={name}
            /* Roving tabindex: one stop per group, arrows do the rest. */
            tabIndex={on || (!options.some((x) => selected(x.value)) && i === 0) ? 0 : -1}
            onClick={() => toggle(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`group relative flex items-center gap-3 text-left rounded-xl border px-4 py-3.5 text-[15px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
              on
                ? 'border-accent/60 bg-accent/[0.09] text-ink'
                : 'border-line bg-white/[0.02] text-ink-2 hover:text-ink hover:border-line-2 hover:bg-white/[0.05]'
            }`}
          >
            <span
              aria-hidden
              className={`shrink-0 grid place-items-center transition-all duration-200 ${
                multi ? 'w-[18px] h-[18px] rounded-[5px]' : 'w-[18px] h-[18px] rounded-full'
              } border ${on ? 'border-accent bg-accent/90 text-[#16130F]' : 'border-line-2 text-transparent'}`}
            >
              {multi ? <Check size={12} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

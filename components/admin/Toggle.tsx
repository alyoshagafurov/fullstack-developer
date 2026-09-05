'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/app/admin/actions';

/*
 * Draft / Published, as one switch.
 *
 * Optimistic, but it rolls back when the server refuses. A publish control that
 * lies about its state is worse than one that is slow: the owner would believe
 * a case is live when it is not.
 */
export function Toggle({
  id,
  published,
  action,
  labels = ['Черновик', 'Опубликован'],
}: {
  id: string;
  published: boolean;
  action: (id: string) => Promise<ActionResult>;
  labels?: [string, string];
}) {
  const [on, setOn] = useState(published);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={pending}
        onClick={() => {
          const next = !on;
          setOn(next);
          setError('');
          start(async () => {
            const result = await action(id);
            if (result.status === 'error') {
              setOn(!next);
              setError(result.message);
            }
          });
        }}
        className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50 ${
          on ? 'border-ink bg-ink' : 'border-line-2 bg-transparent'
        }`}
      >
        <span
          className={`ml-0.5 block size-5 rounded-full transition-transform duration-200 ease-[var(--ease-studio)] ${
            on ? 'translate-x-5 bg-paper' : 'translate-x-0 bg-ink-3'
          }`}
        />
      </button>
      <span className="text-sm text-ink-2">{on ? labels[1] : labels[0]}</span>
      {error && <span className="text-xs text-ink">{error}</span>}
    </div>
  );
}

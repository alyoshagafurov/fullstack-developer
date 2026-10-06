'use client';

import { useCallback, useRef, useState } from 'react';
import { useTelegram } from '@/components/mini/telegram';

/*
 * The panel's only way to the server.
 *
 * Every call carries the launch signature and goes to the one guarded route.
 * The page itself knows nothing: it is rendered with no data at all, so that
 * anybody who opens /mini/admin without a signature gets an empty shell. That
 * is a deliberate shape rather than an accident of how the data loads — a
 * server component here would have handed a stranger the register.
 *
 * Two answers matter besides the data. A 401 means the launch has gone stale,
 * which happens by design after an hour, and the only cure is reopening the
 * window — so it is surfaced as a state the shell can speak about rather than
 * swallowed into "something went wrong". And `expiresAt` comes back on every
 * success, so the panel can say when that is about to happen instead of letting
 * the owner discover it mid-edit.
 */

export type AdminError = { message: string; expired: boolean };

export function useAdminApi() {
  const { app, inside } = useTelegram();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  /* Read through a ref inside `call`, so the signature never goes stale. */
  const initData = useRef('');
  initData.current = app?.initData ?? '';

  const call = useCallback(
    async <T,>(command: string, payload: Record<string, unknown> = {}): Promise<T> => {
      const response = await fetch('/api/mini/admin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ initData: initData.current, command, payload }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        data?: T;
        error?: string;
        expiresAt?: number;
      };

      if (response.status === 401) {
        setExpired(true);
        throw { message: body.error ?? 'Откройте админку заново.', expired: true } as AdminError;
      }
      if (!response.ok) {
        throw { message: body.error ?? 'Не получилось.', expired: false } as AdminError;
      }

      if (typeof body.expiresAt === 'number') setExpiresAt(body.expiresAt);
      return body.data as T;
    },
    [],
  );

  return { call, expired, expiresAt, inside, app };
}

export function errorText(error: unknown): string {
  return (error as AdminError)?.message ?? 'Не получилось.';
}

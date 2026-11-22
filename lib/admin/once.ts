import 'server-only';
import type { OpResult } from '@/lib/admin/ops';

/*
 * Creating a record exactly once.
 *
 * A phone on a bad connection sends a request, never hears back, and sends it
 * again. When the caller supplies an operation ID, that ID becomes the row's
 * primary key: the second create collides on it, and the collision is checked
 * against what is already stored. The same request again is a success that
 * changed nothing; a different request under a used ID is refused, so an ID can
 * never quietly stand for two different payments.
 *
 * Without an operation ID (the Mini App, which retries nothing) the row gets
 * the usual generated key.
 */

export const OPERATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function operationId(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'string' && OPERATION_ID.test(value) ? value.toLowerCase() : null;
}

export async function createOnce<T>(
  create: () => Promise<unknown>,
  existing: () => Promise<T | null>,
  same: (row: T) => boolean,
): Promise<OpResult & { replayed?: boolean }> {
  try {
    await create();
    return { status: 'ok' };
  } catch (error) {
    if ((error as { code?: string })?.code !== 'P2002') throw error;
    const row = await existing();
    if (row && same(row)) return { status: 'ok', replayed: true };
    return { status: 'error', message: 'Этот идентификатор операции уже использован для другой записи' };
  }
}

/** "1500", "1500.5", "1500,50" — a positive amount with at most two decimals, as a fixed string. */
export function moneyString(value: unknown): string | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim().replace(',', '.') : '';
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n.toFixed(2) : null;
}

/*
 * The gate for everything the admin writes that is NOT a lead.
 *
 * Cases live in Prisma, which the Next.js server owns directly — there is no
 * Django round trip on the write path. That is convenient, and it is exactly
 * why this file exists: without it a route could reach the database having
 * only checked that a cookie was present.
 *
 * A cookie proves someone signed in once. It does not prove the session is
 * still valid, that the account still exists, or that it holds a role. So the
 * guard asks Django on every call, the same way the workspace layout does, and
 * Django's answer is the authority.
 *
 * Note what is deliberately NOT consulted: `writesEnabled`. That flag governs
 * whether Django may write ProjectLead while Prisma still owns that table. It
 * says nothing about cases, which Next has owned from the start — reusing it
 * here would switch off case editing for a reason that does not apply to it.
 */

import { fetchCurrentUser } from '@/lib/admin-api';
import { readSession } from '@/lib/admin-api/session';
import type { AdminUser } from '@/lib/admin-api/types';

/*
 * Discriminated on a string, not a boolean.
 *
 * tsconfig has `strict: false`, and without strictNullChecks TypeScript will
 * not narrow a union on `!result.ok` — it keeps the whole union and every
 * field access on the failure branch is an error. String discriminants narrow
 * regardless, which is why `ApiResult` in ./types.ts is already shaped this
 * way. Matching it keeps one idiom in the codebase instead of two.
 */
export type GuardResult =
  | { status: 'ok'; user: AdminUser }
  | { status: 'refused'; code: number; error: string };

/**
 * Resolve the caller, or the reason they are refused.
 *
 * Editing a case is an owner action, so it takes the ADMIN role. A VIEWER may
 * read the admin but may not publish to the public site.
 */
export async function requireAdmin(): Promise<GuardResult> {
  const session = await readSession();
  if (!session) return { status: 'refused', code: 401, error: 'unauthenticated' };

  const me = await fetchCurrentUser(session);

  if (me.status === 'unauthenticated') {
    return { status: 'refused', code: 401, error: 'unauthenticated' };
  }
  if (me.status !== 'ok') {
    // The backend is unreachable or refusing. Fail closed: an editor that
    // keeps working while it cannot verify who is using it is not an editor,
    // it is an open door.
    return {
      status: 'refused',
      code: me.status === 'unavailable' ? 503 : 403,
      error: me.status,
    };
  }
  if (me.data.user.role !== 'ADMIN') {
    return { status: 'refused', code: 403, error: 'forbidden' };
  }

  return { status: 'ok', user: me.data.user };
}

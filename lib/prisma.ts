import { PrismaClient } from '@prisma/client';

/*
 * The database handle.
 *
 * `getPrisma()` returns null when DATABASE_URL is not configured. That is a
 * deliberate, checkable state rather than a crash: the API answers 503 and the
 * brief tells the visitor plainly that it was not saved. Nothing is faked, and
 * the build never depends on a database being reachable.
 *
 * One client per process. Each PrismaClient opens its own pool, and Next's dev
 * server re-evaluates modules on every edit, so the instance is parked on
 * globalThis outside production to avoid exhausting connections.
 *
 * Serverless note: on Vercel each function instance gets its own pool, so
 * DATABASE_URL should carry `connection_limit=1` (and `pgbouncer=true` when
 * pointing at a pooler such as Neon or Supabase).
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      // Never `query` in production — brief bodies would end up in logs.
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

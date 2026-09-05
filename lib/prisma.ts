import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

/*
 * One client per process, talking to Neon through a driver adapter.
 *
 * Prisma 7 takes the connection through an adapter rather than a URL in the
 * schema. On Neon that means no query engine binary in the deployment, which is
 * what keeps cold starts short on Vercel.
 *
 * Next reloads modules on every edit in development, and a fresh PrismaClient
 * per reload exhausts the Neon connection pool within minutes. Holding the
 * instance on globalThis survives the reload; in production the module is
 * evaluated once and the global is never read.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Thrown lazily rather than at import time: a missing URL must not stop the
    // build, only the reads that actually need the database, and every one of
    // those is already wrapped in `safely` below.
    throw new Error('DATABASE_URL is not set');
  }

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Run a database read the page can live without.
 *
 * This site shares its database with the previous build, and the new tables may
 * not exist yet in a given environment. A missing table must degrade to an
 * empty section, never to a 500 on the landing page. Only the error class is
 * logged: these rows carry client contact details and never belong in logs.
 */
export async function safely<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[db] ${label} failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
    return fallback;
  }
}

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

let client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  client = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

/**
 * The client, built on first use rather than on import.
 *
 * This matters on a preview deployment that has no DATABASE_URL: building the
 * client at module scope threw during the build itself, before any page could
 * run, and the whole deployment failed with an error that named an env var and
 * nothing else. Behind this proxy the same missing variable surfaces inside the
 * query — which on every public path is already wrapped in `safely`, so the
 * section renders empty and the site still ships.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    /*
     * The real client, never the proxy, is what `getClient` stores on the
     * global and what is read here. An earlier version also put this proxy on
     * the global "to survive reloads" — after which `getClient` returned the
     * proxy, whose trap called `getClient`, which returned the proxy, until the
     * stack ran out. Every query in development died with a RangeError while
     * production, which never reads the global, was fine.
     */
    const target = getClient();
    const value = Reflect.get(target, property) as unknown;
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

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

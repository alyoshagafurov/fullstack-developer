import { prisma } from '@/lib/prisma';

/*
 * Turning a submitted brief into a stored lead.
 *
 * Two things matter beyond writing the row: the client gets a number they can
 * quote back, and the endpoint cannot be used to flood the owner's inbox.
 */

/**
 * A human-readable reference: ALY-2026-014.
 *
 * Derived from the count of leads in the current year, which two simultaneous
 * submissions can read identically. The unique index on `ref` is what actually
 * guarantees uniqueness; the caller retries on that collision rather than
 * pretending the race cannot happen.
 */
export async function createLeadRef(): Promise<string> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);

  const count = await prisma.lead.count({ where: { createdAt: { gte: startOfYear } } });
  return `ALY-${year}-${String(count + 1).padStart(3, '0')}`;
}

/**
 * Best-effort per-address throttle.
 *
 * Deliberately in memory: a portfolio takes a handful of briefs a week, and a
 * shared store would be more moving parts than the problem deserves. The honest
 * limitation is that serverless runs several instances, so a determined sender
 * gets a few more attempts than the number below suggests. `withinEmailQuota`
 * is the check that holds across instances, because it counts database rows.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

export function withinRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    attempts.set(key, recent);
    return false;
  }

  recent.push(now);
  attempts.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (attempts.size > 500) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
  }

  return true;
}

/** No more than three briefs from one address in a day. Survives restarts. */
export async function withinEmailQuota(email: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.lead.count({
    where: { email: email.toLowerCase(), createdAt: { gte: since } },
  });
  return count < 3;
}

/**
 * A submission counts as automated when the hidden field carries a value or the
 * form was completed faster than a person could read it.
 */
export function looksAutomated(website: string | undefined, startedAt: number | undefined): boolean {
  if (website) return true;
  if (typeof startedAt === 'number' && Date.now() - startedAt < 4000) return true;
  return false;
}

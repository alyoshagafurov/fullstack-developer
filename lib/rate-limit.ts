/*
 * A small fixed-window rate limiter.
 *
 * HONEST LIMITATION: this counts in the memory of one server instance. On
 * Vercel each concurrent lambda has its own memory, so the effective limit is
 * per-instance, not global — a determined attacker spread across instances
 * gets more than `limit` requests. It raises the cost of casual spam and form
 * bots, which is what a public brief endpoint actually faces, and it adds no
 * infrastructure.
 *
 * A real distributed limit needs shared state (Upstash Redis, Vercel KV).
 * `checkRateLimit` is the seam: swap its body for a Redis INCR + EXPIRE and
 * every caller keeps working unchanged.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Drop expired buckets so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets — surfaced as Retry-After. */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 } = {},
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client identity. Vercel sets x-forwarded-for; the left-most
 * entry is the original client. Falls back to a constant so the limiter still
 * degrades to "shared bucket" rather than failing open per request.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

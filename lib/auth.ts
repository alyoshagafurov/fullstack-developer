import 'server-only';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma, safely } from '@/lib/prisma';

/*
 * Admin access.
 *
 * One account, one cookie. The cookie carries the user id, an expiry and an
 * HMAC over both; nothing is stored server-side, and nothing in it can be
 * edited by the holder without breaking the signature.
 *
 * Two rules this file exists to enforce:
 *   - every admin page and every admin action calls `requireAdmin` itself.
 *     Middleware is a convenience, not a guard: a route that forgets its own
 *     check is a route that leaks the owner's clients.
 *   - a wrong email and a wrong password produce the same answer, so the login
 *     screen cannot be used to discover which addresses exist.
 */

const COOKIE = 'aly_session';
const MAX_AGE_S = 60 * 60 * 24 * 7;
const BCRYPT_COST = 12;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET is missing or too short');
  }
  return value;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Buffer.from(mac).toString('base64url');
}

/** Constant-time compare, so a signature cannot be guessed byte by byte. */
function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function startSession(userId: string): Promise<void> {
  const expires = Date.now() + MAX_AGE_S * 1000;
  const payload = `${userId}.${expires}`;
  const value = `${payload}.${await sign(payload)}`;

  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_S,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export type AdminUser = { id: string; email: string };

/** The current admin, or null. Never throws: callers decide what absence means. */
export async function currentAdmin(): Promise<AdminUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [userId, expiresRaw, mac] = parts;

  const expected = await sign(`${userId}.${expiresRaw}`);
  if (!sameString(mac, expected)) return null;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  return safely(
    'currentAdmin',
    () => prisma.adminUser.findUnique({ where: { id: userId }, select: { id: true, email: true } }),
    null,
  );
}

/**
 * The guard every admin page and action calls first.
 *
 * Returns a result rather than throwing, because the caller usually wants to
 * redirect rather than render an error, and a thrown value is easy to catch by
 * accident somewhere up the tree.
 */
export type Guard = { status: 'ok'; user: AdminUser } | { status: 'refused' };

export async function requireAdmin(): Promise<Guard> {
  const user = await currentAdmin();
  return user ? { status: 'ok', user } : { status: 'refused' };
}

/** True while nobody has claimed the admin yet, which opens the setup screen. */
export async function needsSetup(): Promise<boolean> {
  const count = await safely('needsSetup', () => prisma.adminUser.count(), 1);
  return count === 0;
}

/*
 * Login attempts, held in memory.
 *
 * Same trade as the brief endpoint: serverless spreads this over instances, so
 * it slows a guesser down rather than stopping one outright. bcrypt at cost 12
 * is the real defence, since it makes every guess expensive wherever it lands.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, number[]>();

export function loginAllowed(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return false;
  }
  recent.push(now);
  attempts.set(key, recent);
  return true;
}

/*
 * Where the Django session lives.
 *
 * SERVER ONLY. Importing `next/headers` makes that structural rather than a
 * convention — a client component that imported this would fail to build.
 *
 * The browser never receives Django's session cookie. It receives two
 * httpOnly cookies scoped to this app, and the Next.js server copies their
 * values onto its own request to Django. So a compromised page script cannot
 * read the session, and nothing in devtools shows a backend credential.
 *
 * Two cookies rather than one because Django needs both, and for different
 * reasons: `sessionid` identifies the operator, `csrftoken` proves the
 * mutating request was issued deliberately.
 */

import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'aly_admin_sid';
export const CSRF_COOKIE = 'aly_admin_csrf';

/** Django's own cookie names, which is what the upstream request must carry. */
export const DJANGO_SESSION_COOKIE = 'sessionid';
export const DJANGO_CSRF_COOKIE = 'csrftoken';

export interface AdminSession {
  sessionId: string;
  csrfToken: string;
}

/**
 * Async since Next 15: `cookies()` returns a promise now, because the request
 * store is resolved lazily rather than being ambient. Every caller awaits.
 */
export async function readSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  const csrfToken = jar.get(CSRF_COOKIE)?.value ?? '';
  if (!sessionId) return null;
  return { sessionId, csrfToken };
}

/**
 * Cookie options shared by both. `httpOnly` is the point of the whole design;
 * `sameSite: 'lax'` stops a third-party page from driving the admin through
 * the browser's ambient credentials, which is the CSRF surface that actually
 * exists here (Django's own is server-to-server).
 */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/** Two weeks, matching Django's default session age. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

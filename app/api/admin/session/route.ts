import { NextResponse } from 'next/server';

import { apiBaseUrl, readSetCookie } from '@/lib/admin-api';
import {
  CSRF_COOKIE, DJANGO_CSRF_COOKIE, DJANGO_SESSION_COOKIE,
  SESSION_COOKIE, SESSION_MAX_AGE, cookieOptions, readSession,
} from '@/lib/admin-api/session';

/*
 * The session boundary.
 *
 * This is the only place a password is handled, and it never leaves the
 * server: the browser posts it here, this route forwards it to Django over a
 * server-to-server request, and what comes back — Django's session id — is
 * stored in an httpOnly cookie the page script cannot read.
 *
 * So there is no token in localStorage, no Django cookie in the browser, and
 * nothing in devtools that would let someone replay a backend call directly.
 *
 * Nothing here logs the body. A password in a log is a password in a backup.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 4 * 1024;

export async function POST(req: Request) {
  const base = apiBaseUrl();
  if (!base) {
    return NextResponse.json({ ok: false, error: 'backend_not_configured' }, { status: 501 });
  }

  if (!(req.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'unsupported_media_type' }, { status: 415 });
  }

  const rawText = await req.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const username = typeof raw.username === 'string' ? raw.username.trim().slice(0, 150) : '';
  const password = typeof raw.password === 'string' ? raw.password.slice(0, 256) : '';
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'backend_unreachable' }, { status: 503 });
  }

  if (upstream.status === 429) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }
  if (!upstream.ok) {
    // Django already collapses "no such user" and "wrong password" into one
    // answer; keep it that way on the way out.
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }

  const body = await upstream.json().catch(() => null);
  const sessionId = readSetCookie(upstream, DJANGO_SESSION_COOKIE);
  if (!sessionId || !body?.ok) {
    return NextResponse.json({ ok: false, error: 'no_session_issued' }, { status: 502 });
  }

  const csrfToken =
    readSetCookie(upstream, DJANGO_CSRF_COOKIE) ?? String(body.csrfToken ?? '');

  // Only the username and role cross back — never the session, never a token.
  const response = NextResponse.json({ ok: true, user: body.user });
  response.cookies.set(SESSION_COOKIE, sessionId, cookieOptions(SESSION_MAX_AGE));
  response.cookies.set(CSRF_COOKIE, csrfToken, cookieOptions(SESSION_MAX_AGE));
  return response;
}

export async function DELETE() {
  const base = apiBaseUrl();
  const session = await readSession();

  // Best effort: tell Django to flush the session too, so signing out is not
  // merely local. A failure here still clears the cookies below.
  if (base && session?.sessionId) {
    const jar = [`${DJANGO_SESSION_COOKIE}=${session.sessionId}`];
    if (session.csrfToken) jar.push(`${DJANGO_CSRF_COOKIE}=${session.csrfToken}`);
    try {
      await fetch(`${base}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: jar.join('; '),
          'X-CSRFToken': session.csrfToken,
          Referer: base,
        },
        cache: 'no-store',
      });
    } catch {
      /* the local cookies are cleared regardless */
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', cookieOptions(0));
  response.cookies.set(CSRF_COOKIE, '', cookieOptions(0));
  return response;
}

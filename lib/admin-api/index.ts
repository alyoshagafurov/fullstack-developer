/*
 * The admin API adapter.
 *
 * SERVER ONLY — it reaches Django, and nothing it touches may cross into the
 * browser bundle. The whole point of this file is that the browser talks to
 * Next.js and Next.js talks to Django, so a Django credential never leaves
 * the server.
 *
 * It is also the isolation layer the transition needs: every admin screen
 * imports from here and nowhere else, so when Django's shape changes, or when
 * Prisma is finally removed, exactly one module has to move.
 *
 * WHEN THE BACKEND IS NOT CONFIGURED it returns `unavailable`. It does not
 * fall back to fixtures, invent a lead, or pretend a mutation succeeded — the
 * same posture as `getPrisma()` returning null and /api/brief answering 501.
 * A CRM that shows imaginary leads is worse than one that shows none.
 */

import { revalidatePath } from 'next/cache';

import {
  DJANGO_CSRF_COOKIE, DJANGO_SESSION_COOKIE, readSession, type AdminSession,
} from './session';
import type {
  AdminSessionInfo, AdminUser, ApiResult, LeadDetail, LeadRow, LeadStatus,
  LeadSummary, Paged,
} from './types';

export * from './types';

/** Base URL of the Django API, e.g. https://api.aly.lat. Unset until deployed. */
export function apiBaseUrl(): string | null {
  const raw = process.env.DJANGO_API_URL?.trim();
  return raw ? raw.replace(/\/+$/, '') : null;
}

export function isBackendConfigured(): boolean {
  return apiBaseUrl() !== null;
}

const TIMEOUT_MS = 10_000;

/**
 * One request to Django, with the operator's session attached.
 *
 * Never throws. Every failure is a value the caller must handle, because a
 * thrown error inside a server component renders an error page that tells the
 * operator nothing about whether their change was saved.
 */
async function request<T>(
  path: string,
  init: RequestInit & { session?: AdminSession | null } = {},
): Promise<ApiResult<T>> {
  const base = apiBaseUrl();
  if (!base) return { status: 'unavailable', code: 'backend_not_configured' };

  const { session = readSession(), ...rest } = init;

  const headers = new Headers(rest.headers);
  headers.set('Accept', 'application/json');

  if (session?.sessionId) {
    const jar = [`${DJANGO_SESSION_COOKIE}=${session.sessionId}`];
    if (session.csrfToken) {
      jar.push(`${DJANGO_CSRF_COOKIE}=${session.csrfToken}`);
      // Django compares the header against the cookie; both must be present
      // on an authenticated unsafe request or SessionAuthentication rejects it.
      headers.set('X-CSRFToken', session.csrfToken);
    }
    headers.set('Cookie', jar.join('; '));
    // Django checks Referer on HTTPS CSRF-protected requests.
    headers.set('Referer', base);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...rest,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
  } catch {
    // DNS, refused, timed out. The operator learns the backend is unreachable
    // — not a stack trace, and not an empty table that looks like "no leads".
    return { status: 'unavailable', code: 'backend_unreachable' };
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401) return { status: 'unauthenticated' };
  if (response.status === 403) {
    // Django says which kind of refusal this is; the read-only phase is not
    // the same event as a viewer overreaching, and the UI says so.
    const body = await response.json().catch(() => null);
    return { status: 'forbidden', code: String(body?.error ?? 'forbidden') };
  }
  if (response.status === 404) return { status: 'notFound' };
  if (response.status === 503) return { status: 'unavailable', code: 'storage_unavailable' };

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { status: 'error', code: String(body?.error ?? `http_${response.status}`) };
  }

  if (response.status === 204) return { status: 'ok', data: undefined as T };

  const data = await response.json().catch(() => null);
  if (data === null) return { status: 'error', code: 'malformed_response' };
  return { status: 'ok', data: data as T };
}

/* ── Auth ────────────────────────────────────────────────────────────── */

export async function fetchCurrentUser(
  session?: AdminSession | null,
): Promise<ApiResult<AdminSessionInfo>> {
  const result = await request<{
    ok: boolean;
    user: AdminUser;
    server?: { writesEnabled?: boolean };
  }>('/api/v1/auth/me', { session });

  if (result.status !== 'ok') return result;
  return {
    status: 'ok',
    data: {
      user: result.data.user,
      // Absent means off. A backend too old to report the flag is a backend
      // whose write state is unknown, and unknown must not read as "allowed".
      writesEnabled: result.data.server?.writesEnabled === true,
    },
  };
}

/** Pull one cookie's value out of a Set-Cookie header. */
export function readSetCookie(response: Response, name: string): string | null {
  // `getSetCookie` is the only way to see every Set-Cookie; a plain `get`
  // folds them into one string and mangles values containing a comma.
  const source = response.headers as unknown as { getSetCookie?: () => string[] };
  const all = typeof source.getSetCookie === 'function'
    ? source.getSetCookie()
    : [response.headers.get('set-cookie') ?? ''];

  for (const entry of all) {
    for (const part of entry.split(/,(?=[^;]+?=)/)) {
      const match = part.trim().match(new RegExp(`^${name}=([^;]*)`));
      if (match) return match[1];
    }
  }
  return null;
}

/** A CSRF token plus the cookie Django expects alongside it. */
export async function fetchCsrf(): Promise<{ token: string; cookie: string } | null> {
  const base = apiBaseUrl();
  if (!base) return null;
  try {
    const response = await fetch(`${base}/api/v1/auth/csrf`, { cache: 'no-store' });
    if (!response.ok) return null;
    const body = await response.json();
    const token = String(body.csrfToken ?? '');
    return { token, cookie: readSetCookie(response, DJANGO_CSRF_COOKIE) ?? token };
  } catch {
    return null;
  }
}

/* ── Leads ───────────────────────────────────────────────────────────── */

export interface LeadQuery {
  page?: number;
  status?: string;
  projectType?: string;
  q?: string;
  ordering?: string;
}

export async function fetchLeads(query: LeadQuery = {}): Promise<ApiResult<Paged<LeadRow>>> {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.status) params.set('status', query.status);
  if (query.projectType) params.set('projectType', query.projectType);
  if (query.q) params.set('q', query.q);
  if (query.ordering) params.set('ordering', query.ordering);
  const qs = params.toString();
  return request<Paged<LeadRow>>(`/api/v1/admin/leads/${qs ? `?${qs}` : ''}`);
}

/** Counts per stage — one grouped query rather than seven list calls. */
export async function fetchSummary(): Promise<ApiResult<LeadSummary>> {
  return request<LeadSummary>('/api/v1/admin/leads/summary/');
}

const REFERENCE = /^ALY-\d{4}-[A-Z0-9]{5}$/;

export async function fetchLead(reference: string): Promise<ApiResult<LeadDetail>> {
  // Guard the path segment rather than trusting the route param: the
  // reference format is known exactly, and anything else is not a lookup.
  if (!REFERENCE.test(reference)) return { status: 'notFound' };
  return request<LeadDetail>(`/api/v1/admin/leads/${reference}/`);
}

/**
 * The only mutation the admin can perform.
 *
 * Deliberately narrow: status and the internal note, nothing else. The server
 * enforces the same restriction through `read_only_fields`, so this signature
 * documents the rule rather than being the rule.
 */
export async function updateLead(
  reference: string,
  patch: { status?: LeadStatus; internalNote?: string },
): Promise<ApiResult<LeadDetail>> {
  if (!REFERENCE.test(reference)) return { status: 'notFound' };

  const result = await request<LeadDetail>(`/api/v1/admin/leads/${reference}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (result.status === 'ok') {
    revalidatePath('/admin');
    revalidatePath('/admin/leads');
    revalidatePath(`/admin/leads/${reference}`);
  }
  return result;
}

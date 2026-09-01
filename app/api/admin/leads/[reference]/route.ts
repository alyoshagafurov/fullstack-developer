import { NextResponse } from 'next/server';

import { updateLead } from '@/lib/admin-api';
import { readSession } from '@/lib/admin-api/session';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/admin-api/types';

/*
 * The only mutation the admin UI can make.
 *
 * Two fields, both operator-owned: the pipeline status and the private note.
 * Everything the visitor submitted is immutable, and this route could not
 * change it even if asked — Django's serializer marks those `read_only`, so
 * the restriction is enforced where it counts and merely restated here.
 *
 * There is no DELETE handler. No role holds `delete_projectlead`, and adding
 * a route that would only ever return 403 would suggest the capability exists.
 *
 * Authorisation is NOT decided here. This forwards the operator's session and
 * lets Django answer; a viewer's PATCH comes back 403 from the server, not
 * from a hidden button.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 8 * 1024;
const MAX_NOTE = 4000;

const STATUS_FOR: Record<string, number> = {
  unauthenticated: 401,
  forbidden: 403,
  notFound: 404,
  unavailable: 503,
  error: 502,
};

export async function PATCH(req: Request, props: { params: Promise<{ reference: string }> }) {
  const params = await props.params;
  if (!(await readSession())) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
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

  // Build the patch from an allow-list. Anything else the caller sent —
  // `email`, `reference`, a status spelled creatively — is simply not copied.
  const patch: { status?: LeadStatus; internalNote?: string } = {};

  if ('status' in raw) {
    const value = raw.status;
    if (typeof value !== 'string' || !(LEAD_STATUSES as readonly string[]).includes(value)) {
      return NextResponse.json(
        { ok: false, error: 'validation', fieldErrors: { status: 'pickOne' } },
        { status: 422 },
      );
    }
    patch.status = value as LeadStatus;
  }

  if ('internalNote' in raw) {
    const value = raw.internalNote;
    if (typeof value !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'validation', fieldErrors: { internalNote: 'invalid' } },
        { status: 422 },
      );
    }
    patch.internalNote = value.slice(0, MAX_NOTE);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'nothing_to_update' }, { status: 400 });
  }

  const result = await updateLead(params.reference, patch);

  if (result.status === 'ok') {
    // Only the two fields that could have changed go back. The note is
    // included because the operator just wrote it, not because it is safe to
    // broadcast — this response is only ever read by an authenticated admin.
    return NextResponse.json({
      ok: true,
      status: result.data.status,
      internalNote: result.data.internalNote,
      updatedAt: result.data.updatedAt,
    });
  }

  const code =
    result.status === 'unavailable' || result.status === 'error' ? result.code
    : result.status === 'forbidden' ? (result.code ?? 'forbidden')
    : result.status;

  return NextResponse.json(
    { ok: false, error: code },
    { status: STATUS_FOR[result.status] ?? 502 },
  );
}

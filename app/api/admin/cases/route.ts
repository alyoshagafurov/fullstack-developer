import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-api/guard';
import { createCase, parseCaseInput } from '@/lib/cases-write';

/*
 * POST /api/admin/cases — create a case.
 *
 * Authorisation is the first thing that happens, and it is not decided here:
 * `requireAdmin` asks Django who the caller is on every request. A hidden
 * button in the UI is not a permission, and this route assumes nothing about
 * what the client rendered.
 *
 * On success the public pages are revalidated, so a newly published case shows
 * on /work immediately rather than after the next deploy.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.code });
  }

  if (!(req.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'unsupported_media_type' }, { status: 415 });
  }

  const rawText = await req.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const parsed = parseCaseInput(body);
  if (parsed.status === 'invalid') {
    return NextResponse.json(
      { ok: false, error: 'validation', fieldErrors: parsed.fieldErrors },
      { status: 422 },
    );
  }

  const result = await createCase(parsed.value);
  if (result.status === 'failed') {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.code });
  }

  revalidatePath('/work');
  revalidatePath(`/work/${result.slug}`);
  revalidatePath('/admin/cases');

  return NextResponse.json({ ok: true, id: result.id, slug: result.slug }, { status: 201 });
}

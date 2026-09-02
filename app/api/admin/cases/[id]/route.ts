import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-api/guard';
import { deleteCase, parseCaseInput, updateCase } from '@/lib/cases-write';

/*
 * PATCH / DELETE /api/admin/cases/[id]
 *
 * A case is the owner's own writing, so unlike a lead it may be edited and
 * removed. Both verbs go through `requireAdmin` first; a VIEWER is refused by
 * the server, not by a missing button.
 *
 * PATCH takes the whole record rather than a partial patch. The editor always
 * holds the complete case in its form state, and a field-by-field merge would
 * make "cleared this field" and "did not send this field" indistinguishable.
 *
 * `params` is a Promise — Next 15 resolves route params lazily.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 64 * 1024;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, props: Ctx) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.code });
  }

  const { id } = await props.params;

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

  const result = await updateCase(id, parsed.value);
  if (result.status === 'failed') {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.code });
  }

  revalidatePath('/work');
  revalidatePath(`/work/${result.slug}`);
  revalidatePath('/admin/cases');

  return NextResponse.json({ ok: true, id: result.id, slug: result.slug });
}

export async function DELETE(_req: Request, props: Ctx) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.code });
  }

  const { id } = await props.params;
  const result = await deleteCase(id);
  if (result.status === 'failed') {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.code });
  }

  revalidatePath('/work');
  revalidatePath(`/work/${result.slug}`);
  revalidatePath('/admin/cases');

  return NextResponse.json({ ok: true });
}

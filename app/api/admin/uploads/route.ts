import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-api/guard';

/*
 * POST /api/admin/uploads — one screenshot into Vercel Blob.
 *
 * It lives at /uploads rather than under /cases because `cases/upload` would
 * sit beside `cases/[id]`, and a route whose meaning depends on Next resolving
 * a static segment before a dynamic one is a route waiting to be misread.
 *
 * The response is a URL, and that URL is all the caller gets. The editor puts
 * it in the form's screenshot list; nothing is written to the database here,
 * so an upload that is never saved leaves an orphan blob rather than a
 * half-written case.
 *
 * Content type is checked against an allow-list rather than trusted. The
 * browser sets it, so it is a claim, not a fact — but combined with the
 * extension we derive ourselves it stops a blob being served as HTML, which
 * would be stored XSS.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (gate.status === 'refused') {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.code });
  }

  // The store is created in the Vercel dashboard, which injects the token. Say
  // so plainly instead of failing with a library error the owner cannot act on.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'blob_not_configured' }, { status: 501 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'empty_file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  const extension = ALLOWED[file.type];
  if (!extension) {
    return NextResponse.json({ ok: false, error: 'unsupported_media_type' }, { status: 415 });
  }

  // The stored name is ours, never the client's. An uploaded filename can
  // carry path separators and its own extension, and neither belongs in a key
  // we are about to serve from.
  const key = `cases/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  try {
    const blob = await put(key, file, {
      access: 'public',
      contentType: file.type,
      // Blob would otherwise append a random suffix; the key is already unique.
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true, url: blob.url }, { status: 201 });
  } catch {
    // No detail: an upstream storage message can name buckets and tokens.
    return NextResponse.json({ ok: false, error: 'upload_failed' }, { status: 502 });
  }
}

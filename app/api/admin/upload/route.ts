import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdmin } from '@/lib/auth';

/*
 * Screenshot uploads for cases, straight from the browser into Vercel Blob.
 *
 * The browser asks here for a one-off token, then talks to Blob directly, so
 * a 10 MB screenshot never passes through a function with a 4.5 MB body limit.
 * The token is only ever issued to a signed-in admin, only for images, and
 * only under `cases/`.
 */

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Плохой запрос' }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const gate = await requireAdmin();
        if (gate.status === 'refused') throw new Error('Нужно войти заново');
        if (!pathname.startsWith('cases/')) throw new Error('Файлы кейсов лежат только в cases/');
        return {
          allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 12 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // The editor keeps the URL in its own state and saves it with the case.
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = String((error as Error)?.message ?? '');
    const friendly = /token/i.test(message)
      ? 'Хранилище не подключено: Vercel → Storage → Blob → Connect to project'
      : message || 'Не удалось загрузить';
    return NextResponse.json({ error: friendly }, { status: 400 });
  }
}

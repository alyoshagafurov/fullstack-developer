import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { body, json, owner, route } from '@/lib/mobile/server';

/*
 * A picture for a case, from ALY OS, into the same Blob store the site's
 * images already live in (under `cases/`). The phone shrinks and compresses it
 * first; the body limit here keeps under Vercel's 4.5 MB request cap.
 *
 * The answer is the public URL, which the app then saves into the case like
 * any other field. The file is only checked to be the image it claims to be.
 */

export const runtime = 'nodejs';

const TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  'image/png': { ext: 'png', magic: (b) => b.subarray(0, 4).toString('hex') === '89504e47' },
  'image/webp': { ext: 'webp', magic: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
};

export async function POST(req: Request) {
  return route(async () => {
    await owner(req);
    const input = (await body(req, 4_400_000)) as { contentType?: unknown; data?: unknown; name?: unknown } | null;
    const type = typeof input?.contentType === 'string' ? TYPES[input.contentType] : undefined;
    if (!type || typeof input?.data !== 'string') return json({ error: 'Нужна картинка JPEG, PNG или WebP' }, 400);
    const bytes = Buffer.from(input.data, 'base64');
    if (bytes.length < 16 || bytes.length > 3_200_000 || !type.magic(bytes)) return json({ error: 'Файл не похож на картинку или слишком большой' }, 400);
    if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: 'Хранилище картинок не подключено на сервере' }, 503);

    const base = (typeof input.name === 'string' ? input.name : '')
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || randomUUID().slice(0, 8);
    const blob = await put(`cases/${base}.${type.ext}`, bytes, { access: 'public', addRandomSuffix: true, contentType: input.contentType as string });
    return json({ url: blob.url });
  });
}

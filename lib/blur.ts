import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/*
 * A tiny blurred copy of a local image, inlined into the page, so a screen
 * shows the site's colours the instant it appears and the real picture
 * fades in over it instead of popping into an empty box.
 */
const cache = new Map<string, Promise<string | undefined>>();

export function blurOf(src: string | null | undefined): Promise<string | undefined> {
  if (!src || !src.startsWith('/')) return Promise.resolve(undefined);
  let hit = cache.get(src);
  if (!hit) {
    hit = readFile(path.join(process.cwd(), 'public', src))
      .then((buf) => sharp(buf).resize(16).webp({ quality: 40 }).toBuffer())
      .then((b) => `data:image/webp;base64,${b.toString('base64')}`)
      .catch(() => undefined);
    cache.set(src, hit);
  }
  return hit;
}

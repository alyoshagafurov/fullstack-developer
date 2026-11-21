import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/*
 * The colour a project brings with it. Read from its own screenshot: the
 * dominant colour becomes the page behind it (pushed very dark or very light
 * so text stays readable), the most vivid mid-tone becomes its accent.
 * A project added in the admin gets its colour without anyone choosing one.
 */

export type CaseColour = { bg: string; ink: string; accent: string; dark: boolean };

export const NEUTRAL: CaseColour = { bg: '#f2f0eb', ink: '#121212', accent: '#121212', dark: false };

const cache = new Map<string, Promise<CaseColour>>();

export function caseColour(src: string | null | undefined): Promise<CaseColour> {
  if (!src) return Promise.resolve(NEUTRAL);
  let hit = cache.get(src);
  if (!hit) {
    hit = compute(src).catch(() => {
      cache.delete(src);
      return NEUTRAL;
    });
    cache.set(src, hit);
  }
  return hit;
}

async function load(src: string): Promise<Buffer> {
  if (src.startsWith('/')) return readFile(path.join(process.cwd(), 'public', src));
  const res = await fetch(src, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(String(res.status));
  return Buffer.from(await res.arrayBuffer());
}

async function compute(src: string): Promise<CaseColour> {
  const buffer = await load(src);
  const image = sharp(buffer).removeAlpha();
  const { dominant } = await image.clone().stats();
  const { data } = await image.clone().resize(32, 32, { fit: 'cover' }).raw().toBuffer({ resolveWithObject: true });

  const [h, s, l] = toHsl(dominant.r, dominant.g, dominant.b);
  const dark = l < 0.55;
  const bg = dark
    ? toHex(h, Math.min(s, 0.5), Math.min(Math.max(l, 0.08), 0.15))
    : toHex(h, Math.min(s, 0.3), Math.min(Math.max(l, 0.9), 0.95));

  let best: [number, number, number] | null = null;
  let bestScore = 0;
  for (let i = 0; i < data.length; i += 3) {
    const [ph, ps, pl] = toHsl(data[i], data[i + 1], data[i + 2]);
    if (pl < 0.25 || pl > 0.75) continue;
    const score = ps * (1 - Math.abs(pl - 0.5));
    if (score > bestScore) {
      bestScore = score;
      best = [ph, ps, pl];
    }
  }
  const accent = best && bestScore > 0.15 ? toHex(best[0], Math.min(best[1], 0.75), dark ? 0.62 : 0.4) : dark ? '#f4f2ee' : '#121212';

  return { bg, ink: dark ? '#f4f2ee' : '#121212', accent, dark };
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function toHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

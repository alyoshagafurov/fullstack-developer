import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/*
 * The raw Instagram Messaging API: signature verification and sending,
 * nothing else. "Instagram API with Instagram Login" — the route Meta
 * introduced in 2024 that needs no Facebook Page, just the Instagram
 * professional account itself. graph.instagram.com, not graph.facebook.com.
 */

const API_VERSION = 'v25.0';

export function igAccessToken(): string | undefined {
  return process.env.INSTAGRAM_ACCESS_TOKEN || undefined;
}

export function igAppSecret(): string | undefined {
  return process.env.INSTAGRAM_APP_SECRET || undefined;
}

export function igVerifyToken(): string | undefined {
  return process.env.INSTAGRAM_VERIFY_TOKEN || undefined;
}

/**
 * Meta signs every webhook body with the app secret. Checked against the RAW
 * body — the caller must read it with `request.text()` before `JSON.parse`,
 * the same ordering the Telegram webhook's secret header check uses.
 */
export function verifyInstagramSignature(rawBody: string, header: string | null): boolean {
  const secret = igAppSecret();
  if (!secret || !header) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Sends once and retries twice more with a growing pause — same shape as
 * `sendWithRetry` in lib/telegram/api.ts, and the same reason: a failure
 * never throws past here and never logs the message text.
 */
export async function sendInstagramMessage(igsid: string, text: string): Promise<boolean> {
  const token = igAccessToken();
  if (!token) return false;

  const pauses = [0, 600, 1800];
  for (let attempt = 0; attempt < pauses.length; attempt += 1) {
    if (pauses[attempt]) await new Promise((r) => setTimeout(r, pauses[attempt]));
    try {
      const response = await fetch(`https://graph.instagram.com/${API_VERSION}/me/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipient: { id: igsid }, message: { text } }),
      });
      if (response.ok) return true;
      // An expired token or a recipient outside the 24h window will not
      // recover on retry.
      if (response.status === 401 || response.status === 403) {
        console.warn(`[instagram] send refused: HTTP ${response.status} (check INSTAGRAM_ACCESS_TOKEN)`);
        return false;
      }
      if (attempt === pauses.length - 1) {
        console.error(`[instagram] send failed: HTTP ${response.status}`);
      }
    } catch (error) {
      if (attempt === pauses.length - 1) {
        console.error(`[instagram] send failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
      }
    }
  }
  return false;
}

import 'server-only';
import { adminGrant, type AdminGrant } from '@/lib/auth';
import { adminIds, isAdmin } from '@/lib/telegram/api';
import { verifyInitData, type MiniAppUser } from '@/lib/telegram/miniapp';

/*
 * The door into the owner's data from inside Telegram.
 *
 * The site's own admin takes a password and keeps a cookie. This one takes the
 * signature Telegram puts on every Mini App launch, checks it on every single
 * request, and keeps nothing. That is not a stylistic preference:
 *
 *   A cookie would not arrive. Telegram Web runs a Mini App in an iframe on
 *   web.telegram.org, which makes this page's site-for-cookies opaque, so a
 *   SameSite=Lax cookie is sent neither with the frame nor with a fetch from
 *   inside it. It would work on every phone and fail silently on the laptop —
 *   the same shape of bug the headers in next.config.mjs were just fixed for.
 *
 *   And a cookie would be worth stealing. Trading an hour-long signature for a
 *   week-long session makes one intercepted launch into the password: the whole
 *   admin, from any browser, long after the window was closed. Checking the
 *   signature on every request keeps what a theft buys equal to what was taken.
 *
 * What is behind this door is worth more than what is behind /api/lead, so the
 * window is an hour rather than a day. `auth_date` is stamped when the window
 * opens and never refreshes, so the number really answers "how long is one
 * sitting": long enough to read the leads and move three statuses, short enough
 * that a captured string is not a key to the business until tomorrow.
 */

export const ADMIN_MAX_AGE_SECONDS = 60 * 60;

export type MiniAdminPass = {
  ok: true;
  user: MiniAppUser;
  /** Proof for lib/admin/ops.ts that a door was passed. Carries nothing. */
  grant: AdminGrant;
  /** When this launch stops being accepted, so the panel can say so first. */
  expiresAt: number;
};

export type MiniAdminRefusal = {
  ok: false;
  status: 401 | 429;
  /** What the panel shows. Never why — see the note on `requireMiniAdmin`. */
  message: string;
};

/*
 * Attempts that failed, by caller.
 *
 * Held in memory, like every other limiter here, with the same honest
 * limitation: serverless spreads this over instances, so it slows a caller
 * rather than stopping one. Its job is smaller than that anyway — keeping a
 * stranger from filling the log with rejections, and from hammering this
 * endpoint to see how long different refusals take.
 *
 * Only failures are counted. The owner tapping through his own leads must never
 * meet a limiter: the one in lib/lead.ts allows five an hour, and borrowing it
 * here would lock him out of his own admin on the sixth tap, with a message
 * about briefs.
 */
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 20;
const failures = new Map<string, number[]>();

function recentFailures(key: string): number[] {
  const now = Date.now();
  const recent = (failures.get(key) ?? []).filter((at) => now - at < FAIL_WINDOW_MS);
  failures.set(key, recent);

  if (failures.size > 500) {
    for (const [other, times] of failures) {
      if (times.every((at) => now - at >= FAIL_WINDOW_MS)) failures.delete(other);
    }
  }

  return recent;
}

function noteFailure(key: string): void {
  const recent = recentFailures(key);
  recent.push(Date.now());
  failures.set(key, recent);
}

/*
 * One line a minute per subject, not one per attempt.
 *
 * A log that can be flooded is a log nobody reads, and this one is the only
 * place a wrong TELEGRAM_ADMIN_IDS ever becomes visible.
 */
const LOG_EVERY_MS = 60 * 1000;
const lastLogged = new Map<string, number>();

function sayOnce(subject: string, line: string): void {
  const now = Date.now();
  if (now - (lastLogged.get(subject) ?? 0) < LOG_EVERY_MS) return;
  lastLogged.set(subject, now);
  console.warn(line);
}

/*
 * There used to be a notice here: the first command of every new window sent
 * the owner «🔓 Админка открыта · 14:05» in Telegram. It was meant as the one
 * defence against a signature somebody else was holding — a thief cannot stop
 * the owner's phone from buzzing about a window he did not open.
 *
 * The owner turned it off. He opens the panel many times a day, so the notice
 * arrived many times a day, and a message that comes with every ordinary
 * action stops being read long before the one time it would matter. If it is
 * ever wanted back, the cheaper version is to notify only when a launch comes
 * from a Telegram client the panel has not seen before — not on every window.
 */

/**
 * Who is calling, proved.
 *
 * Both failures answer 401 with the same sentence. A separate 403 for "the
 * signature is good but you are not the owner" would confirm to whoever sent it
 * that the string is live and whose it is — a free oracle, paid for with
 * nothing. The distinction stays in the log, where it is useful.
 */
export function requireMiniAdmin(
  initData: unknown,
  caller: string,
): MiniAdminPass | MiniAdminRefusal {
  if (recentFailures(caller).length >= MAX_FAILURES) {
    return { ok: false, status: 429, message: 'Слишком часто. Подождите немного.' };
  }

  if (typeof initData !== 'string' || !initData) {
    noteFailure(caller);
    return refusal();
  }

  const check = verifyInitData(initData, ADMIN_MAX_AGE_SECONDS);
  if (!check.ok) {
    noteFailure(caller);
    sayOnce(`sig:${caller}`, `[mini-admin] подпись отклонена: ${check.reason}`);
    return refusal();
  }

  if (!isAdmin(check.user.id)) {
    noteFailure(caller);
    /*
     * The one place a Telegram id reaches a log, and the reason it does:
     * without it the owner cannot tell "my id is missing from
     * TELEGRAM_ADMIN_IDS" from "a stranger is knocking", and cannot learn which
     * number to put in the variable. Everywhere else the id stays out, because
     * a log that records it on every request is a record of where he has been.
     */
    sayOnce(
      `not-admin:${check.user.id}`,
      `[mini-admin] не владелец: id=${check.user.id}, админов настроено ${adminIds().size}`,
    );
    return refusal();
  }

  return {
    ok: true,
    user: check.user,
    grant: adminGrant(),
    expiresAt: check.authDate.getTime() + ADMIN_MAX_AGE_SECONDS * 1000,
  };
}

function refusal(): MiniAdminRefusal {
  return { ok: false, status: 401, message: 'Откройте админку заново.' };
}

/** The refusal as a response. One sentence out; the reason stays in the log. */
export function refuseMini(refused: MiniAdminRefusal): Response {
  return Response.json({ error: refused.message }, { status: refused.status });
}

/**
 * Who is asking, for the limiter.
 *
 * Vercel sets `x-forwarded-for` and strips any copy the client supplied, so the
 * first entry is the real caller there. Locally it is absent and everyone
 * shares one bucket, which is right for one developer.
 */
export function callerKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return `mini-admin:${forwarded?.split(',')[0]?.trim() || 'local'}`;
}

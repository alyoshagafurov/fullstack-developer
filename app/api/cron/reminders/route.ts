import { timingSafeEqual } from 'node:crypto';
import { claimReminder, pruneOldReminders, tasksDueForReminder } from '@/lib/admin/tasks';
import { adminIds, botToken, escapeHtml, sendWithRetry } from '@/lib/telegram/api';

/*
 * The owner's own alarm clock.
 *
 * Nothing inside the Mini App ever ticks on its own — the panel only runs
 * while he is looking at it, and a reminder has to arrive whether he is or
 * not. So something outside the app has to call this route on a schedule,
 * and the route itself decides what, if anything, is due right now.
 *
 * That something is deliberately not Vercel's own Cron Jobs. On the Hobby
 * tier a cron can run at most once a day, and asking for anything more
 * frequent fails the whole deployment at build time rather than quietly
 * running at the wrong cadence — a bad trade for a feature that needs
 * roughly once a minute. A free external pinger (cron-job.org or similar),
 * hitting this URL on whatever tier the project is on, works the same way
 * everywhere and never risks the deployment. Setup is in the chat, not here.
 *
 * The secret is checked before anything else runs, exactly like the
 * Telegram webhook's own door in app/api/telegram/webhook/route.ts.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sameSecret(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** What the bot sends. The hour range, so he reads what he is meant to be doing, not just when it started. */
function reminderText(task: { title: string; note: string | null; startHour: number; endHour: number }): string {
  const range = `${String(task.startHour).padStart(2, '0')}:00–${String(task.endHour % 24).padStart(2, '0')}:00`;
  const lines = [`⏰ <b>${escapeHtml(task.title)}</b>`, `Сегодня, ${range}`];
  if (task.note) lines.push(escapeHtml(task.note));
  return lines.join('\n');
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('Not configured', { status: 503 });

  if (!sameSecret(request.headers.get('x-cron-secret'), secret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admins = adminIds();
  /*
   * Nobody to tell: stop before claiming anything. A claim is permanent for
   * that occurrence — the unique taskId+day row is the whole point — so
   * claiming a reminder nobody can be sent (no admin configured, or no bot
   * token) would lose it for the rest of the day even once the
   * configuration is fixed, rather than simply trying again next tick.
   */
  if (admins.size === 0 || !botToken()) {
    return Response.json({ sent: 0, skipped: 0, failed: 0, configured: false });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const due = await tasksDueForReminder(new Date());

    for (const task of due) {
      try {
        // Claim before send: a second tick racing this one loses the insert
        // and skips, rather than the owner reading the same message twice.
        const claimed = await claimReminder(task.id, task.day);
        if (!claimed) {
          skipped += 1;
          continue;
        }
        await Promise.all([...admins].map((id) => sendWithRetry(id, reminderText(task))));
        sent += 1;
      } catch (error) {
        // One task's failure must not stop the rest of this tick.
        failed += 1;
        console.error(`[cron] task failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
      }
    }

    if (Math.random() < 0.05) await pruneOldReminders();
  } catch (error) {
    console.error(`[cron] reminders failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
    return Response.json({ error: 'failed' }, { status: 500 });
  }

  return Response.json({ sent, skipped, failed });
}

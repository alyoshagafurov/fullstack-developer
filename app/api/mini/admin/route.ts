import { commands, str } from '@/lib/admin/commands';
import { callerKey, refuseMini, requireMiniAdmin } from '@/lib/telegram/mini-admin';

/*
 * The owner's admin, as Telegram reaches it.
 *
 * One route, one guard, one list of what may be done. The note at the top of
 * lib/auth.ts asks that every admin surface check for itself rather than lean
 * on something upstream, and a single handler is the strictest reading of that:
 * there is exactly one place the check can be forgotten, and a command cannot
 * be added past it, because a command is an entry in a table that is only read
 * once the guard has returned.
 *
 * POST for everything, the reads included. `initData` is a signature and the
 * name of a living person, and a GET would put it in a query string — which
 * means an access log, a Referer header and the browser's history. That is also
 * why it is never echoed back and never written to a log.
 *
 * The page that calls this holds no data of its own. It is a client component
 * with nothing server-rendered, so a stranger who opens /mini/admin gets markup
 * and no leads. Read that as a rule rather than a description: the moment
 * app/(mini) imports lib/admin/queries or lib/prisma, the panel has leaked.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * What a command may do lives in lib/admin/commands.ts, shared with ALY OS's
 * door; this file is only the Telegram door in front of it.
 */

/* ---------------------------------------------------------------- door -- */

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const pass = requireMiniAdmin(body?.initData, callerKey(request));
  if (!pass.ok) return refuseMini(pass);

  const name = str(body?.command, 40);
  if (!Object.hasOwn(commands, name)) {
    return Response.json({ error: 'Неизвестная команда' }, { status: 400 });
  }

  try {
    const data = await commands[name](pass.grant, (body?.payload ?? {}) as Record<string, unknown>);
    /*
     * `expiresAt` rides along on every answer so the panel can warn before the
     * launch goes stale rather than meeting a 401 mid-sentence. The signature
     * is stamped once when the window opens and never refreshes, so this number
     * only ever counts down.
     */
    return Response.json({ data, expiresAt: pass.expiresAt });
  } catch (error) {
    // Class only. The rows this handler touches are the owner's clients.
    console.error(`[mini-admin] ${name} failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
    return Response.json({ error: 'Не получилось. Попробуйте ещё раз.' }, { status: 500 });
  }
}

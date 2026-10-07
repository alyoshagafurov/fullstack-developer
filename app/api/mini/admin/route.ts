import { getLead, getOverview, listLeads } from '@/lib/admin/queries';
import { addIncome, deleteIncome, listIncome, todayInDushanbe } from '@/lib/admin/income';
import {
  addTask,
  deleteTask,
  listTasks,
  toggleTask,
  updateTask,
  type TaskInput,
} from '@/lib/admin/tasks';
import { getRates } from '@/lib/rates';
import { flagReplied, moveLead, writeNote, type OpResult } from '@/lib/admin/ops';
import { periods, type PeriodId } from '@/lib/content/finance';
import {
  callerKey,
  refuseMini,
  requireMiniAdmin,
  type MiniAdminPass,
} from '@/lib/telegram/mini-admin';

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

type Command = (pass: MiniAdminPass, payload: Record<string, unknown>) => Promise<unknown>;

const str = (value: unknown, limit = 200): string =>
  typeof value === 'string' ? value.slice(0, limit) : '';

const period = (value: unknown): PeriodId => {
  const id = str(value, 20);
  return (periods as readonly { id: string }[]).some((p) => p.id === id)
    ? (id as PeriodId)
    : 'month';
};

/** Prisma returns money as Decimal, which JSON renders as an object. */
const amount = (value: { toString(): string } | null | undefined): number | null =>
  value === null || value === undefined ? null : Number(value.toString());

/*
 * What a command may do, named one by one.
 *
 * `Object.create(null)` rather than a literal: a plain object inherits
 * `constructor`, `toString` and the rest, so `commands['constructor']` would
 * sail past a truthiness check and be called as though it were one of these.
 */
const commands: Record<string, Command> = Object.create(null);

/* ------------------------------------------------------------- reading -- */

commands.overview = async (_pass, payload) => {
  const { weekly: _weekly, ...rest } = await getOverview(period(payload.period));
  // The twelve-week chart stays on the desktop: twelve bars at 375px are not a
  // chart, they are a texture.
  return rest;
};

/**
 * The register.
 *
 * Deliberately narrower than the web admin's table: no email, no company. This
 * is the one call that returns many people at once, so it returns the least it
 * can, and contact details wait for `lead` — one client at a time.
 */
commands.leads = async (_pass, payload) => {
  const result = await listLeads({
    q: str(payload.q, 80),
    status: str(payload.status, 20),
    page: Number(payload.page) || 1,
  });

  return {
    total: result.total,
    page: result.page,
    pages: result.pages,
    rows: result.rows.map((row) => ({
      id: row.id,
      ref: row.ref,
      name: row.name,
      projectType: row.projectType,
      budget: row.budget,
      status: row.status,
      createdAt: row.createdAt,
      firstRepliedAt: row.firstRepliedAt,
    })),
  };
};

commands.lead = async (_pass, payload) => {
  const lead = await getLead(str(payload.id, 40));
  if (!lead) return null;

  return {
    ...lead,
    dealAmount: amount(lead.dealAmount),
    payments: lead.payments.map((p) => ({ ...p, amount: amount(p.amount) })),
  };
};

/**
 * Everything the money screen draws from: every entry he has made, and today's
 * rates to convert them with.
 *
 * Sent whole rather than pre-summed, because the screen switches the currency
 * it totals in on a tap, and a round trip per tap would make the one control he
 * asked for the slowest thing on the screen. A freelancer's ledger is a few
 * hundred rows at most; the cap in listIncome is two thousand.
 *
 * `rates` is null when the source is down, and the screen then totals each
 * currency on its own rather than inventing a conversion.
 */
commands.money = async (pass) => {
  const [rows, rates] = await Promise.all([listIncome(pass.grant), getRates()]);
  return {
    rows,
    rates: rates ? { perUsd: rates.perUsd, updatedAt: rates.updatedAt } : null,
    today: todayInDushanbe(),
  };
};

/* ------------------------------------------------------------ changing -- */

commands['lead:status'] = async (pass, payload): Promise<OpResult> =>
  moveLead(pass.grant, str(payload.id, 40), str(payload.to, 20));

commands['lead:note'] = async (pass, payload): Promise<OpResult> =>
  writeNote(pass.grant, str(payload.id, 40), str(payload.body, 5000));

commands['lead:replied'] = async (pass, payload): Promise<OpResult> =>
  flagReplied(pass.grant, str(payload.id, 40));

commands['income:add'] = async (pass, payload): Promise<OpResult> =>
  addIncome(pass.grant, {
    amount: payload.amount,
    currency: payload.currency,
    day: payload.day,
    note: payload.note,
  });

commands['income:delete'] = async (pass, payload): Promise<OpResult> =>
  deleteIncome(pass.grant, str(payload.id, 40));

/**
 * Everything the calendar screen draws from: every task he has written, done
 * or not. Sent whole, like `money` above — the same reasoning applies at the
 * same scale, a to-do list being if anything shorter than a ledger.
 */
commands.tasks = async (pass) => ({ rows: await listTasks(pass.grant), today: todayInDushanbe() });

const taskInput = (payload: Record<string, unknown>): TaskInput => ({
  title: payload.title,
  note: payload.note,
  dayFrom: payload.dayFrom,
  dayTo: payload.dayTo,
  startHour: payload.startHour,
  endHour: payload.endHour,
  leadMinutes: payload.leadMinutes,
});

commands['task:add'] = async (pass, payload): Promise<OpResult> =>
  addTask(pass.grant, taskInput(payload));

commands['task:update'] = async (pass, payload): Promise<OpResult> =>
  updateTask(pass.grant, str(payload.id, 40), taskInput(payload));

commands['task:delete'] = async (pass, payload): Promise<OpResult> =>
  deleteTask(pass.grant, str(payload.id, 40));

commands['task:toggle'] = async (pass, payload): Promise<OpResult> =>
  toggleTask(pass.grant, str(payload.id, 40), payload.active);

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
    const data = await commands[name](pass, (body?.payload ?? {}) as Record<string, unknown>);
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

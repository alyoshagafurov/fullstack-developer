import 'server-only';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import type { OpResult } from '@/lib/admin/ops';
import { todayInDushanbe } from '@/lib/admin/income';
import { reminderPresets } from '@/lib/content/schedule';

/*
 * The owner's own to-do list, with the bot standing in for an alarm clock.
 *
 * He writes a task by the hour: a title, which hour of the day it starts and
 * ends, which day — or which span of days, for something that runs for a
 * while — and, if he wants one, how long before it starts the bot should
 * message him. A daily chore is the same row with no end date.
 *
 * Like everything behind the two admin doors, each operation takes an
 * `AdminGrant` it never reads; see lib/auth.ts. `tasksDueForReminder` and
 * `claimReminder` are the one exception, and say why where they are defined.
 */

export type TaskRow = {
  id: string;
  title: string;
  note: string | null;
  /** YYYY-MM-DD, a calendar day — see `toDay`. */
  dayFrom: string;
  /** null means "every day from dayFrom on", his daily chores. */
  dayTo: string | null;
  /** 0–23. */
  startHour: number;
  /** 1–24, always after startHour: a task never crosses midnight. */
  endHour: number;
  /** Minutes before startHour the bot messages him. null means no reminder. */
  leadMinutes: number | null;
  /** Doubles as done/paused. */
  active: boolean;
};

/* ------------------------------------------------------------- the table -- */

/*
 * Created here, by the application, the first time it is needed — never by
 * `prisma migrate` or `db push`, which this shared database cannot take; see
 * the note at the top of schema.prisma and the longer one in income.ts.
 */
let ensured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  ensured ??= (async () => {
    for (const sql of [
      `CREATE TABLE IF NOT EXISTS "aly_task" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "note" TEXT,
        "dayFrom" TIMESTAMP(3) NOT NULL,
        "dayTo" TIMESTAMP(3),
        "startHour" INTEGER NOT NULL,
        "endHour" INTEGER NOT NULL,
        "leadMinutes" INTEGER,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "aly_task_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "aly_task_hours_check" CHECK (
          "startHour" >= 0 AND "startHour" <= 23 AND
          "endHour" >= 1 AND "endHour" <= 24 AND
          "endHour" > "startHour"
        )
      )`,
      `CREATE INDEX IF NOT EXISTS "aly_task_dayFrom_idx" ON "aly_task"("dayFrom")`,
      `CREATE TABLE IF NOT EXISTS "aly_task_reminder_sent" (
        "id" TEXT NOT NULL,
        "taskId" TEXT NOT NULL,
        "day" TIMESTAMP(3) NOT NULL,
        "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "aly_task_reminder_sent_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "aly_task_reminder_sent_taskId_day_key" ON "aly_task_reminder_sent"("taskId", "day")`,
    ]) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (error) {
        console.warn(
          `[tasks] ensureTable: ${(error as Error)?.constructor?.name ?? 'Error'} (likely a concurrent create)`,
        );
        // Caching success regardless of outcome would turn one genuine DDL
        // failure — not just the benign concurrent-create race this warning
        // assumes — into a table missing its unique index forever, with
        // claimReminder() silently losing the atomicity it depends on.
        // Clearing the cache lets the next call try again.
        ensured = null;
      }
    }
  })();
  return ensured;
}

/* ------------------------------------------------------------------ days -- */

/* Same convention as income.ts: a calendar day is midnight UTC of that day,
   read back by its UTC date, so it never slides between the owner's phone
   and the server. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string' || !DAY.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  // Rejects 2026-02-31, which Date would quietly roll into March.
  return !Number.isNaN(date.getTime()) && toDay(date) === value ? date : null;
}

function parseHour(value: unknown, min: number, max: number): number | null {
  // `Number(null)`, `Number('')` and `Number(false)` are all 0, which a
  // min of 0 (startHour) would wrongly accept as a real hour. Only a number
  // or a non-blank numeric string is a candidate at all.
  if (typeof value !== 'number' && !(typeof value === 'string' && value.trim() !== '')) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/**
 * Dushanbe is UTC+5, every day of the year — the country has not observed a
 * seasonal change since 1991, so there is no DST rule to get wrong. That
 * makes a wall-clock-to-UTC conversion a fixed, honest subtraction rather
 * than something that needs a timezone library: a Dushanbe hour is always
 * five less than the UTC hour that names the same instant.
 *
 * `Date.UTC` normalizes out-of-range fields on its own — an hour of -2 or a
 * minute of -90 rolls into the previous day exactly as it should — which is
 * what lets a reminder due before midnight Dushanbe time land on the correct
 * UTC day without this function doing that arithmetic by hand.
 */
export function dushanbeInstant(day: string, hour: number, minute: number): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour - 5, minute));
}

/* ------------------------------------------------------------ operations -- */

export async function listTasks(_: AdminGrant): Promise<TaskRow[]> {
  await ensureTable();
  const rows = await prisma.task.findMany({
    orderBy: [{ dayFrom: 'desc' }, { startHour: 'asc' }],
    take: 2000,
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    note: row.note,
    dayFrom: toDay(row.dayFrom),
    dayTo: row.dayTo ? toDay(row.dayTo) : null,
    startHour: row.startHour,
    endHour: row.endHour,
    leadMinutes: row.leadMinutes,
    active: row.active,
  }));
}

export type TaskInput = {
  title: unknown;
  note: unknown;
  dayFrom: unknown;
  dayTo: unknown;
  startHour: unknown;
  endHour: unknown;
  leadMinutes: unknown;
};

type Parsed = {
  title: string;
  note: string | null;
  dayFrom: Date;
  dayTo: Date | null;
  startHour: number;
  endHour: number;
  leadMinutes: number | null;
};

function validate(input: TaskInput): { value: Parsed } | { error: string } {
  const title = typeof input.title === 'string' ? input.title.trim().slice(0, 120) : '';
  if (!title) return { error: 'Название не может быть пустым' };

  const dayFrom = parseDay(input.dayFrom);
  if (!dayFrom) return { error: 'Проверьте дату начала' };

  let dayTo: Date | null = null;
  // Empty / absent dayTo is the daily-chore case: no end date at all.
  if (typeof input.dayTo === 'string' && input.dayTo.trim()) {
    dayTo = parseDay(input.dayTo);
    if (!dayTo) return { error: 'Проверьте дату окончания' };
    if (dayTo < dayFrom) return { error: 'Дата окончания раньше даты начала' };
  }

  const startHour = parseHour(input.startHour, 0, 23);
  if (startHour === null) return { error: 'Час начала — число от 0 до 23' };

  const endHour = parseHour(input.endHour, 1, 24);
  if (endHour === null || endHour <= startHour) {
    return { error: 'Час окончания должен быть позже часа начала' };
  }

  let leadMinutes: number | null = null;
  if (input.leadMinutes !== null && input.leadMinutes !== undefined && input.leadMinutes !== '') {
    const n = Number(input.leadMinutes);
    if (!(reminderPresets as readonly number[]).includes(n)) {
      return { error: 'Выберите время напоминания из списка' };
    }
    leadMinutes = n;
  }

  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 500) : '';

  return { value: { title, note: note || null, dayFrom, dayTo, startHour, endHour, leadMinutes } };
}

export async function addTask(_: AdminGrant, input: TaskInput): Promise<OpResult> {
  const parsed = validate(input);
  if ('error' in parsed) return { status: 'error', message: parsed.error };

  await ensureTable();
  await prisma.task.create({ data: parsed.value });
  return { status: 'ok' };
}

export async function updateTask(_: AdminGrant, id: unknown, input: TaskInput): Promise<OpResult> {
  if (typeof id !== 'string' || !id) return { status: 'error', message: 'Задача не найдена' };

  const parsed = validate(input);
  if ('error' in parsed) return { status: 'error', message: parsed.error };

  await ensureTable();
  const result = await prisma.task.updateMany({ where: { id }, data: parsed.value });
  return result.count > 0 ? { status: 'ok' } : { status: 'error', message: 'Задача не найдена' };
}

export async function deleteTask(_: AdminGrant, id: unknown): Promise<OpResult> {
  if (typeof id !== 'string' || !id) return { status: 'error', message: 'Задача не найдена' };
  await ensureTable();
  const result = await prisma.task.deleteMany({ where: { id } });
  return result.count > 0 ? { status: 'ok' } : { status: 'error', message: 'Задача не найдена' };
}

export async function toggleTask(_: AdminGrant, id: unknown, active: unknown): Promise<OpResult> {
  if (typeof id !== 'string' || !id) return { status: 'error', message: 'Задача не найдена' };
  await ensureTable();
  const result = await prisma.task.updateMany({ where: { id }, data: { active: Boolean(active) } });
  return result.count > 0 ? { status: 'ok' } : { status: 'error', message: 'Задача не найдена' };
}

/** How many of his tasks fall on today, in Dushanbe. For the /start briefing. */
export async function todaysTaskCount(): Promise<number> {
  await ensureTable();
  const today = parseDay(todayInDushanbe());
  if (!today) return 0;
  return prisma.task.count({
    where: { active: true, dayFrom: { lte: today }, OR: [{ dayTo: null }, { dayTo: { gte: today } }] },
  });
}

/* ------------------------------------------------------- cron, no door -- */

export type DueTask = {
  id: string;
  title: string;
  note: string | null;
  /** The occurrence this reminder belongs to — today, in Dushanbe. */
  day: string;
  startHour: number;
  endHour: number;
};

/**
 * Tasks whose reminder is due at `now` — not behind an `AdminGrant`.
 *
 * This is read by `/api/cron/reminders` after that route checks its own
 * secret, not through either admin door. Asking the cron route to produce a
 * grant it has no real check behind would be a prop, not a guard, so this one
 * function in the file is deliberately ungated; every other export above
 * still takes one.
 *
 * Only today's occurrence is ever considered, which is also what keeps a
 * pinger that was down for a while from waking up to a backlog: a task whose
 * window ran yesterday is simply not looked at today.
 */
export async function tasksDueForReminder(now: Date): Promise<DueTask[]> {
  await ensureTable();
  const today = todayInDushanbe();
  const todayDate = parseDay(today);
  if (!todayDate) return [];

  const rows = await prisma.task.findMany({
    where: {
      active: true,
      leadMinutes: { not: null },
      dayFrom: { lte: todayDate },
      OR: [{ dayTo: null }, { dayTo: { gte: todayDate } }],
    },
    select: { id: true, title: true, note: true, startHour: true, endHour: true, leadMinutes: true },
  });

  return rows
    .filter((row) => dushanbeInstant(today, row.startHour, -(row.leadMinutes as number)) <= now)
    .map((row) => ({
      id: row.id,
      title: row.title,
      note: row.note,
      day: today,
      startHour: row.startHour,
      endHour: row.endHour,
    }));
}

/**
 * The atomic "right to send" for one occurrence: true the first time a day's
 * reminder is claimed, false if something already claimed it. Call this
 * before sending, never after — the same order `BotUpdate` relies on for a
 * redelivered Telegram update.
 */
export async function claimReminder(taskId: string, day: string): Promise<boolean> {
  const date = parseDay(day);
  if (!date) return false;
  await ensureTable();
  try {
    await prisma.taskReminderSent.create({ data: { taskId, day: date } });
    return true;
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') return false;
    throw error;
  }
}

/** Rows older than a month are of no further use. Called now and then, not every tick. */
export async function pruneOldReminders(): Promise<void> {
  await prisma.taskReminderSent
    .deleteMany({ where: { day: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } })
    .catch(() => undefined);
}

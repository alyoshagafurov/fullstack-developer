import 'server-only';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import { currencies, type Currency } from '@/lib/content/finance';
import type { OpResult } from '@/lib/admin/ops';

/*
 * The owner's own record of what he earned.
 *
 * He asked for it by hand: he types how much, in which of his three currencies,
 * on which day, and where it came from. Most of what a freelancer is paid never
 * passed through a lead in this database, so tying income to `Payment` — which
 * requires a lead — would have meant inventing leads to hang money on.
 *
 * Like everything behind the two admin doors, each operation takes an
 * `AdminGrant` it never reads; see lib/auth.ts.
 */

export type IncomeRow = {
  id: string;
  amount: number;
  currency: Currency;
  /** The calendar day, as YYYY-MM-DD. A day, not an instant: see `toDay`. */
  day: string;
  note: string | null;
};

/* ------------------------------------------------------------- the table -- */

/*
 * The table is created here, by the application, the first time it is needed.
 *
 * Not by `prisma db push`, which would make the database match schema.prisma
 * exactly — and this database is shared with the previous version of the site,
 * whose tables are not in that schema. Push would drop them. These two
 * statements can only ever create, and only when the thing is missing: they
 * never alter or remove anything, so running them a second time, or against a
 * database that already has the table, does nothing at all.
 *
 * The SQL is what `prisma migrate diff` prints for the `Income` model, with
 * `IF NOT EXISTS` added. Change one, change the other.
 *
 * Once per server instance. Two instances starting at the same moment can race
 * to create the same table, and Postgres then rejects the loser on a catalog
 * constraint; that is caught, because the winner has done the work.
 */
let ensured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  ensured ??= (async () => {
    for (const sql of [
      `CREATE TABLE IF NOT EXISTS "aly_income" (
        "id" TEXT NOT NULL,
        "amount" DECIMAL(12,2) NOT NULL,
        "currency" TEXT NOT NULL,
        "receivedAt" TIMESTAMP(3) NOT NULL,
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "aly_income_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE INDEX IF NOT EXISTS "aly_income_receivedAt_idx" ON "aly_income"("receivedAt")`,
    ]) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (error) {
        console.warn(
          `[income] ensureTable: ${(error as Error)?.constructor?.name ?? 'Error'} (likely a concurrent create)`,
        );
      }
    }
  })();
  return ensured;
}

/* ------------------------------------------------------------------ days -- */

/*
 * A date he picks is a calendar day, not a moment. It is stored as midnight UTC
 * of that day and read back by its UTC date, so «6 октября» is 6 October on
 * every server and every phone. Storing local midnight in Dushanbe would put it
 * on 5 October in UTC, and the day would slide depending on who looked.
 */
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today in Dushanbe, which is the owner's today. */
export function todayInDushanbe(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dushanbe' }).format(new Date());
}

function parseDay(value: string): Date | null {
  if (!DAY.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  // Rejects 2026-02-31, which Date would quietly roll into March.
  return !Number.isNaN(date.getTime()) && toDay(date) === value ? date : null;
}

/** «1 500,50», «1500.5», «1 500» — the ways a person types an amount. */
function parseAmount(value: unknown): number | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value : '';
  const cleaned = raw.replace(/[\s ]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  // DECIMAL(12,2) holds up to 9 999 999 999.99.
  return amount > 0 && amount < 1e10 ? amount : null;
}

/* ------------------------------------------------------------ operations -- */

export async function listIncome(_: AdminGrant): Promise<IncomeRow[]> {
  await ensureTable();
  const rows = await prisma.income.findMany({
    orderBy: [{ receivedAt: 'desc' }, { createdAt: 'desc' }],
    take: 2000,
  });
  return rows.map((row) => ({
    id: row.id,
    amount: Number(row.amount.toString()),
    currency: row.currency as Currency,
    day: toDay(row.receivedAt),
    note: row.note,
  }));
}

export async function addIncome(
  _: AdminGrant,
  input: { amount: unknown; currency: unknown; day: unknown; note: unknown },
): Promise<OpResult> {
  const amount = parseAmount(input.amount);
  if (amount === null) {
    return { status: 'error', message: 'Сумма — число больше нуля, например 1500 или 1500,50' };
  }

  const currency = String(input.currency ?? '') as Currency;
  if (!(currencies as readonly string[]).includes(currency)) {
    return { status: 'error', message: 'Выберите валюту' };
  }

  // No date chosen means today — his today, in Dushanbe.
  const day = typeof input.day === 'string' && input.day.trim() ? input.day.trim() : todayInDushanbe();
  const receivedAt = parseDay(day);
  if (!receivedAt) return { status: 'error', message: 'Проверьте дату' };
  if (day > todayInDushanbe()) return { status: 'error', message: 'Эта дата ещё не наступила' };
  if (receivedAt.getUTCFullYear() < 2000) return { status: 'error', message: 'Проверьте год' };

  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 300) : '';

  await ensureTable();
  await prisma.income.create({
    data: { amount: amount.toFixed(2), currency, receivedAt, note: note || null },
  });
  return { status: 'ok' };
}

export async function deleteIncome(_: AdminGrant, id: unknown): Promise<OpResult> {
  if (typeof id !== 'string' || !id) return { status: 'error', message: 'Запись не найдена' };
  await ensureTable();
  const result = await prisma.income.deleteMany({ where: { id } });
  return result.count > 0 ? { status: 'ok' } : { status: 'error', message: 'Запись не найдена' };
}

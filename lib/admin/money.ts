import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import type { OpResult } from '@/lib/admin/ops';
import { createOnce, moneyString, operationId } from '@/lib/admin/once';
import { currencies, expenseCategories, paymentKinds } from '@/lib/content/finance';
import { todayInDushanbe } from '@/lib/admin/income';

/*
 * The business's money as aly.lat records it: what a deal is worth, the
 * payments on it, and what was spent. Income without a lead lives in
 * income.ts. Amounts travel as strings with their currency, never as floats.
 */

const currency = z.enum(currencies);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const toDay = (value: string) => new Date(`${value}T12:00:00Z`);

/** The agreed price of a lead's project, or none. */
export async function setDeal(_: AdminGrant, leadId: string, amount: unknown, cur: unknown): Promise<OpResult> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return { status: 'error', message: 'Заявка не найдена' };
  if (amount === null || amount === '') {
    await prisma.lead.update({ where: { id: leadId }, data: { dealAmount: null, dealCurrency: null } });
    return { status: 'ok' };
  }
  const value = moneyString(amount);
  const c = currency.safeParse(cur);
  if (!value) return { status: 'error', message: 'Сумма — число больше нуля' };
  if (!c.success) return { status: 'error', message: 'Выберите валюту' };
  await prisma.lead.update({ where: { id: leadId }, data: { dealAmount: value, dealCurrency: c.data } });
  return { status: 'ok' };
}

const paymentInput = z.object({
  leadId: z.string().min(1).max(40),
  operationID: z.unknown().optional(),
  amount: z.unknown(),
  currency,
  kind: z.enum(paymentKinds).optional().default('STAGE'),
  received: z.boolean(),
  dueAt: day.nullable().optional(),
  note: z.string().trim().max(1000).optional().default(''),
});

export async function addPayment(_: AdminGrant, raw: unknown): Promise<OpResult> {
  const parsed = paymentInput.safeParse(raw);
  if (!parsed.success) return { status: 'error', message: 'Проверьте платёж' };
  const v = parsed.data;
  const amount = moneyString(v.amount);
  if (!amount) return { status: 'error', message: 'Сумма — число больше нуля' };
  const id = operationId(v.operationID);
  if (id === null) return { status: 'error', message: 'Некорректный идентификатор операции' };
  const lead = await prisma.lead.findUnique({ where: { id: v.leadId }, select: { id: true } });
  if (!lead) return { status: 'error', message: 'Заявка не найдена' };

  const data = {
    leadId: v.leadId,
    amount,
    currency: v.currency,
    kind: v.kind,
    paidAt: v.received ? new Date() : null,
    dueAt: v.dueAt ? toDay(v.dueAt) : null,
    note: v.note || null,
  };
  return createOnce(
    () => prisma.payment.create({ data: id ? { id, ...data } : data }),
    () => (id ? prisma.payment.findUnique({ where: { id } }) : Promise.resolve(null)),
    (row) => row.leadId === data.leadId && row.amount.toFixed(2) === amount && row.currency === data.currency,
  );
}

/** Received or not, as the end state: repeating it changes nothing. */
export async function setPaymentReceived(_: AdminGrant, id: string, received: unknown): Promise<OpResult> {
  if (typeof received !== 'boolean') return { status: 'error', message: 'Укажите, получен ли платёж' };
  const row = await prisma.payment.findUnique({ where: { id }, select: { paidAt: true } });
  if (!row) return { status: 'error', message: 'Платёж не найден' };
  if (received !== (row.paidAt !== null)) {
    await prisma.payment.update({ where: { id }, data: { paidAt: received ? new Date() : null } });
  }
  return { status: 'ok' };
}

export async function deletePayment(_: AdminGrant, id: string): Promise<OpResult> {
  await prisma.payment.deleteMany({ where: { id } });
  return { status: 'ok' };
}

/** Every payment on every lead, newest first, with whose it is. */
export async function listPayments(_: AdminGrant) {
  const rows = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: { lead: { select: { id: true, ref: true, name: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    leadId: p.lead.id,
    leadRef: p.lead.ref,
    leadName: p.lead.name,
    amount: p.amount.toFixed(2),
    currency: p.currency,
    kind: p.kind,
    paidAt: p.paidAt,
    dueAt: p.dueAt,
    note: p.note,
  }));
}

/* ------------------------------------------------------------- expenses -- */

const expenseInput = z.object({
  operationID: z.unknown().optional(),
  title: z.string().trim().min(1, 'Назовите расход').max(200),
  amount: z.unknown(),
  currency,
  category: z.enum(expenseCategories).optional().default(expenseCategories[expenseCategories.length - 1]),
  day: day.optional(),
  note: z.string().trim().max(500).optional().default(''),
  leadId: z.string().max(40).nullable().optional(),
});

export async function listExpenses(_: AdminGrant) {
  const rows = await prisma.expense.findMany({ orderBy: [{ spentAt: 'desc' }, { createdAt: 'desc' }], take: 2000 });
  return rows.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount.toFixed(2),
    currency: e.currency,
    category: e.category,
    day: e.spentAt.toISOString().slice(0, 10),
    note: e.note,
    leadId: e.leadId,
  }));
}

export async function addExpense(_: AdminGrant, raw: unknown): Promise<OpResult> {
  const parsed = expenseInput.safeParse(raw);
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Проверьте расход' };
  const v = parsed.data;
  const amount = moneyString(v.amount);
  if (!amount) return { status: 'error', message: 'Сумма — число больше нуля' };
  const id = operationId(v.operationID);
  if (id === null) return { status: 'error', message: 'Некорректный идентификатор операции' };
  const spent = v.day ?? todayInDushanbe();
  if (spent > todayInDushanbe()) return { status: 'error', message: 'Эта дата ещё не наступила' };

  const data = {
    title: v.title,
    amount,
    currency: v.currency,
    category: v.category,
    spentAt: toDay(spent),
    note: v.note || null,
    leadId: v.leadId || null,
  };
  return createOnce(
    () => prisma.expense.create({ data: id ? { id, ...data } : data }),
    () => (id ? prisma.expense.findUnique({ where: { id } }) : Promise.resolve(null)),
    (row) => row.title === data.title && row.amount.toFixed(2) === amount && row.currency === data.currency,
  );
}

export async function deleteExpense(_: AdminGrant, id: string): Promise<OpResult> {
  await prisma.expense.deleteMany({ where: { id } });
  return { status: 'ok' };
}

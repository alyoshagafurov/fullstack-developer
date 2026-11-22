import 'server-only';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import { getLead, getOverview, listLeads, listTestimonials } from '@/lib/admin/queries';
import { addIncome, deleteIncome, listIncome, todayInDushanbe } from '@/lib/admin/income';
import { addTask, deleteTask, listTasks, toggleTask, updateTask, type TaskInput } from '@/lib/admin/tasks';
import { flagReplied, moveLead, writeNote } from '@/lib/admin/ops';
import {
  deleteCase,
  deleteReview,
  getCaseAdmin,
  listCasesAdmin,
  listPrices,
  orderCases,
  saveCase,
  savePrices,
  saveReview,
  setCasePublished,
  setReviewPublished,
} from '@/lib/admin/content';
import { addExpense, addPayment, deleteExpense, deletePayment, listExpenses, listPayments, setDeal, setPaymentReceived } from '@/lib/admin/money';
import { readBotStatus, syncBot } from '@/lib/admin/bot';
import { getRates } from '@/lib/rates';
import { periods, stageTarget, stages, type PeriodId, type Stage } from '@/lib/content/finance';

/*
 * Everything the owner can do, in one table, shared by both doors.
 *
 * The Telegram panel (`/api/mini/admin`, signed by Telegram's initData) and
 * ALY OS (`/api/mobile/v1/admin`, a Bearer session) each check who is asking
 * in their own way and then look a command up here. A command is only ever
 * reached through a door that has already returned an `AdminGrant`, which
 * cannot be made any other way.
 *
 * `Object.create(null)`: a plain object inherits `constructor` and the rest,
 * and `commands['constructor']` must not look like a command.
 */

export type Command = (grant: AdminGrant, payload: Record<string, unknown>) => Promise<unknown>;

export const str = (value: unknown, limit = 200): string => (typeof value === 'string' ? value.slice(0, limit) : '');

const period = (value: unknown): PeriodId => {
  const id = str(value, 20);
  return (periods as readonly { id: string }[]).some((p) => p.id === id) ? (id as PeriodId) : 'month';
};

/** Prisma returns money as Decimal; it leaves here as a fixed two-place string. */
const money = (value: { toFixed(n: number): string } | null | undefined): string | null =>
  value === null || value === undefined ? null : value.toFixed(2);

export const commands: Record<string, Command> = Object.create(null);

/* ------------------------------------------------------------- reading -- */

commands.overview = async (_grant, payload) => {
  const [{ weekly: _weekly, ...rest }, reviews] = await Promise.all([
    getOverview(period(payload.period)),
    prisma.testimonial.count({ where: { published: false } }),
  ]);
  return { ...rest, reviews };
};

/** The register: the least each row needs; contact details wait for `lead`. */
commands.leads = async (_grant, payload) => {
  const result = await listLeads({ q: str(payload.q, 80), status: str(payload.status, 20), page: Number(payload.page) || 1 });
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
      telegram: Boolean(row.telegramChatId),
    })),
  };
};

commands.lead = async (_grant, payload) => {
  const lead = await getLead(str(payload.id, 40));
  if (!lead) return null;
  const { trackingToken: _token, ...rest } = lead;
  return {
    ...rest,
    telegram: Boolean(lead.telegramChatId),
    dealAmount: money(lead.dealAmount),
    payments: lead.payments.map((p) => ({ ...p, amount: money(p.amount) })),
  };
};

/** Every income entry and today's rates; the screen totals on its own. */
commands.money = async (grant) => {
  const [rows, rates] = await Promise.all([listIncome(grant), getRates()]);
  return { rows, rates: rates ? { perUsd: rates.perUsd, updatedAt: rates.updatedAt } : null, today: todayInDushanbe() };
};

commands.tasks = async (grant) => ({ rows: await listTasks(grant), today: todayInDushanbe() });

/** Every review, the ones waiting for him first. */
commands.reviews = async () => {
  const rows = await listTestimonials();
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company,
      role: r.role,
      text: r.text,
      rating: r.rating,
      gender: r.gender,
      source: r.source,
      featured: r.featured,
      order: r.order,
      caseId: r.caseId,
      caseTitle: r.case?.title ?? null,
      published: r.published,
      createdAt: r.createdAt,
    }))
    .sort((a, b) => Number(a.published) - Number(b.published));
};

commands.cases = (grant) => listCasesAdmin(grant);
commands.case = (grant, payload) => getCaseAdmin(grant, str(payload.id, 40));
commands.prices = (grant) => listPrices(grant);
commands.expenses = (grant) => listExpenses(grant);
commands.payments = (grant) => listPayments(grant);
commands['bot:status'] = (grant) => readBotStatus(grant);

/* ------------------------------------------------------------ changing -- */

/** A stage (`new` / `work` / `done` / `lost`) or, for older callers, a raw status. */
commands['lead:status'] = (grant, payload) => {
  const to = str(payload.to, 20);
  const status = (stages as readonly string[]).includes(to) ? stageTarget[to as Stage] : to;
  return moveLead(grant, str(payload.id, 40), status);
};
commands['lead:note'] = (grant, payload) => writeNote(grant, str(payload.id, 40), str(payload.body, 5000));
commands['lead:replied'] = (grant, payload) => flagReplied(grant, str(payload.id, 40));
commands['lead:deal'] = (grant, payload) => setDeal(grant, str(payload.id, 40), payload.amount, payload.currency);

commands['payment:add'] = (grant, payload) => addPayment(grant, payload);
commands['payment:received'] = (grant, payload) => setPaymentReceived(grant, str(payload.id, 40), payload.received);
commands['payment:delete'] = (grant, payload) => deletePayment(grant, str(payload.id, 40));

commands['income:add'] = (grant, payload) =>
  addIncome(grant, { amount: payload.amount, currency: payload.currency, day: payload.day, note: payload.note, operationID: payload.operationID });
commands['income:delete'] = (grant, payload) => deleteIncome(grant, str(payload.id, 40));

commands['expense:add'] = (grant, payload) => addExpense(grant, payload);
commands['expense:delete'] = (grant, payload) => deleteExpense(grant, str(payload.id, 40));

const taskInput = (payload: Record<string, unknown>): TaskInput => ({
  title: payload.title,
  note: payload.note,
  dayFrom: payload.dayFrom,
  dayTo: payload.dayTo,
  startHour: payload.startHour,
  endHour: payload.endHour,
  leadMinutes: payload.leadMinutes,
});
commands['task:add'] = (grant, payload) => addTask(grant, { ...taskInput(payload), operationID: payload.operationID });
commands['task:update'] = (grant, payload) => updateTask(grant, str(payload.id, 40), taskInput(payload));
commands['task:delete'] = (grant, payload) => deleteTask(grant, str(payload.id, 40));
commands['task:toggle'] = (grant, payload) => toggleTask(grant, str(payload.id, 40), payload.active);

commands['case:save'] = (grant, payload) => saveCase(grant, payload);
commands['case:published'] = (grant, payload) => setCasePublished(grant, str(payload.id, 40), payload.published);
commands['case:order'] = (grant, payload) => orderCases(grant, payload.ids);
commands['case:delete'] = (grant, payload) => deleteCase(grant, str(payload.id, 40));

commands['review:save'] = (grant, payload) => saveReview(grant, payload);
commands['review:published'] = (grant, payload) => setReviewPublished(grant, str(payload.id, 40), payload.published);
commands['review:delete'] = (grant, payload) => deleteReview(grant, str(payload.id, 40));

commands['prices:save'] = (grant, payload) => savePrices(grant, payload.rows);

/** The bot's menu, commands and description, set again. Changes no data. */
commands['bot:sync'] = (grant) => syncBot(grant);

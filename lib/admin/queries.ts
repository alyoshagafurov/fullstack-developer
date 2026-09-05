import 'server-only';
import { prisma } from '@/lib/prisma';
import {
  activePipeline,
  lostStatuses,
  type LeadStatusName,
  type PeriodId,
  periodStart,
} from '@/lib/content/finance';

/*
 * Every read the admin does.
 *
 * These are deliberately not wrapped in `safely`: inside the admin a failing
 * query must be visible, not silently turn into an empty screen that reads as
 * "no clients". The public site is where a missing table degrades quietly.
 *
 * Prisma returns Decimal objects for money. They become numbers only at the
 * edge, for display and for sums already grouped by currency — never mixed
 * across currencies, because the owner works in three and has set no rate
 * between them.
 */

const dec = (value: unknown): number => Number(value ?? 0);

export type Overview = {
  waiting: number;
  fresh: number;
  active: number;
  completed: number;
  conversion: number;
  funnel: { status: LeadStatusName; count: number }[];
  received: { currency: string; total: number }[];
  spent: { currency: string; total: number }[];
  expected: { currency: string; total: number }[];
  overdue: { currency: string; total: number }[];
  weekly: { week: string; count: number }[];
  recent: {
    id: string;
    ref: string;
    name: string;
    projectType: string;
    budget: string;
    status: LeadStatusName;
    createdAt: Date;
    firstRepliedAt: Date | null;
  }[];
};

export async function getOverview(period: PeriodId): Promise<Overview> {
  const since = periodStart(period);
  const window = since ? { gte: since } : undefined;

  const [waiting, fresh, active, completed, lost, statusGroups, recent] = await Promise.all([
    // The one number that means "act now": a lead nobody has answered yet.
    prisma.lead.count({ where: { firstRepliedAt: null, status: 'NEW' } }),
    prisma.lead.count({ where: window ? { createdAt: window } : {} }),
    prisma.lead.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.lead.count({ where: { status: 'COMPLETED' } }),
    prisma.lead.count({ where: { status: { in: lostStatuses } } }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        ref: true,
        name: true,
        projectType: true,
        budget: true,
        status: true,
        createdAt: true,
        firstRepliedAt: true,
      },
    }),
  ]);

  const [paid, expenses, unpaid, weekly] = await Promise.all([
    prisma.payment.groupBy({
      by: ['currency'],
      where: { paidAt: window ?? { not: null } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['currency'],
      where: window ? { spentAt: window } : {},
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: null },
      select: { amount: true, currency: true, dueAt: true },
    }),
    weeklyLeads(),
  ]);

  const counts = new Map(statusGroups.map((g) => [g.status as LeadStatusName, g._count._all]));

  const now = Date.now();
  const expected = new Map<string, number>();
  const overdue = new Map<string, number>();
  for (const row of unpaid) {
    const amount = dec(row.amount);
    expected.set(row.currency, (expected.get(row.currency) ?? 0) + amount);
    if (row.dueAt && row.dueAt.getTime() < now) {
      overdue.set(row.currency, (overdue.get(row.currency) ?? 0) + amount);
    }
  }

  // A lead counts as converted once it reached work or finished. Leads still in
  // the middle are neither won nor lost, so they stay out of the denominator.
  const decided = completed + active + lost;
  const conversion = decided > 0 ? Math.round(((completed + active) / decided) * 100) : 0;

  return {
    waiting,
    fresh,
    active,
    completed,
    conversion,
    funnel: activePipeline.map((status) => ({ status, count: counts.get(status) ?? 0 })),
    received: paid.map((r) => ({ currency: r.currency, total: dec(r._sum.amount) })),
    spent: expenses.map((r) => ({ currency: r.currency, total: dec(r._sum.amount) })),
    expected: [...expected].map(([currency, total]) => ({ currency, total })),
    overdue: [...overdue].map(([currency, total]) => ({ currency, total })),
    weekly,
    recent: recent.map((r) => ({ ...r, status: r.status as LeadStatusName })),
  };
}

/** Twelve weeks of lead counts, for the one chart on the overview. */
async function weeklyLeads(): Promise<{ week: string; count: number }[]> {
  const since = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.lead.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const buckets = new Map<number, number>();
  for (let i = 11; i >= 0; i -= 1) buckets.set(i, 0);
  for (const row of rows) {
    const weeksAgo = Math.floor((Date.now() - row.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo <= 11) buckets.set(weeksAgo, (buckets.get(weeksAgo) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([weeksAgo, count]) => ({ week: `−${weeksAgo}`, count }));
}

export type LeadFilters = { q?: string; status?: string; type?: string; page?: number };

const PAGE_SIZE = 25;

export async function listLeads(filters: LeadFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const q = filters.q?.trim();

  const where = {
    ...(filters.status && filters.status !== 'all'
      ? { status: filters.status as LeadStatusName }
      : {}),
    ...(filters.type && filters.type !== 'all' ? { projectType: filters.type } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { company: { contains: q, mode: 'insensitive' as const } },
            { ref: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        ref: true,
        name: true,
        email: true,
        company: true,
        projectType: true,
        budget: true,
        timeline: true,
        status: true,
        createdAt: true,
        firstRepliedAt: true,
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  };
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      events: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: [{ paidAt: 'desc' }, { dueAt: 'asc' }] },
    },
  });
}

export async function getFinance(period: PeriodId) {
  const since = periodStart(period);
  const window = since ? { gte: since } : undefined;

  const [received, spent, byCategory, unpaid, recentPayments, recentExpenses] = await Promise.all([
    prisma.payment.groupBy({
      by: ['currency'],
      where: { paidAt: window ?? { not: null } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['currency'],
      where: window ? { spentAt: window } : {},
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['category', 'currency'],
      where: window ? { spentAt: window } : {},
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: null },
      orderBy: { dueAt: 'asc' },
      include: { lead: { select: { id: true, ref: true, name: true } } },
    }),
    prisma.payment.findMany({
      where: { paidAt: { not: null } },
      orderBy: { paidAt: 'desc' },
      take: 20,
      include: { lead: { select: { id: true, ref: true, name: true } } },
    }),
    prisma.expense.findMany({ orderBy: { spentAt: 'desc' }, take: 20 }),
  ]);

  return {
    received: received.map((r) => ({ currency: r.currency, total: dec(r._sum.amount) })),
    spent: spent.map((r) => ({ currency: r.currency, total: dec(r._sum.amount) })),
    byCategory: byCategory.map((r) => ({
      category: r.category,
      currency: r.currency,
      total: dec(r._sum.amount),
    })),
    unpaid: unpaid.map((r) => ({
      id: r.id,
      amount: dec(r.amount),
      currency: r.currency,
      dueAt: r.dueAt,
      lead: r.lead,
      overdue: !!r.dueAt && r.dueAt.getTime() < Date.now(),
    })),
    recentPayments: recentPayments.map((r) => ({
      id: r.id,
      amount: dec(r.amount),
      currency: r.currency,
      kind: r.kind,
      paidAt: r.paidAt,
      lead: r.lead,
    })),
    recentExpenses: recentExpenses.map((r) => ({
      id: r.id,
      title: r.title,
      amount: dec(r.amount),
      currency: r.currency,
      category: r.category,
      spentAt: r.spentAt,
    })),
  };
}

export async function listCases() {
  return prisma.case.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
}

export async function getCaseById(id: string) {
  return prisma.case.findUnique({ where: { id } });
}

export async function getTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

/** Cases a testimonial can be attached to. Titles only: the picker needs no more. */
export async function listCaseOptions() {
  return prisma.case.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, title: true },
  });
}

export async function listTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { case: { select: { id: true, title: true } } },
  });
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  endSession,
  hashPassword,
  loginAllowed,
  needsSetup,
  requireAdmin,
  startSession,
  verifyPassword,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type LeadStatusName, leadStatuses } from '@/lib/content/finance';

/*
 * Every write the admin can make.
 *
 * The first line of each is the guard. Not a middleware, not a layout check: a
 * server action is a public endpoint with a generated name, and the only thing
 * standing between it and the internet is the check inside it.
 */

export type ActionResult = { status: 'ok' } | { status: 'error'; message: string };

const refuse: ActionResult = { status: 'error', message: 'Нужно войти заново' };

/* ---------------------------------------------------------------- access -- */

export async function setupAdmin(_prev: unknown, form: FormData): Promise<ActionResult> {
  // Only ever available while no account exists. Once one does this closes for
  // good, so it cannot be used to add a second owner later.
  if (!(await needsSetup())) return { status: 'error', message: 'Аккаунт уже создан' };

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(form.get('password') ?? '');
  const repeat = String(form.get('repeat') ?? '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'Проверьте адрес почты' };
  }
  if (password.length < 10) {
    return { status: 'error', message: 'Пароль должен быть не короче 10 символов' };
  }
  if (password !== repeat) return { status: 'error', message: 'Пароли не совпадают' };

  const user = await prisma.adminUser.create({
    data: { email, passwordHash: await hashPassword(password) },
    select: { id: true },
  });
  await startSession(user.id);
  redirect('/admin');
}

export async function login(_prev: unknown, form: FormData): Promise<ActionResult> {
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(form.get('password') ?? '');

  if (!loginAllowed(email || 'anonymous')) {
    return { status: 'error', message: 'Слишком много попыток. Подождите пятнадцать минут.' };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });

  // The same answer whether the address is unknown or the password is wrong,
  // and the same amount of work either way, so neither can be told apart.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const valid = await verifyPassword(password, hash);

  if (!user || !valid) return { status: 'error', message: 'Неверная почта или пароль' };

  await startSession(user.id);
  redirect('/admin');
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/admin/login');
}

export async function changePassword(_prev: unknown, form: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const currentPassword = String(form.get('current') ?? '');
  const next = String(form.get('password') ?? '');
  const repeat = String(form.get('repeat') ?? '');

  if (next.length < 10) return { status: 'error', message: 'Новый пароль короче 10 символов' };
  if (next !== repeat) return { status: 'error', message: 'Пароли не совпадают' };

  const user = await prisma.adminUser.findUnique({ where: { id: gate.user.id } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { status: 'error', message: 'Текущий пароль неверен' };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  return { status: 'ok' };
}

/* ----------------------------------------------------------------- leads -- */

export async function setLeadStatus(leadId: string, to: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  if (!(leadStatuses as readonly string[]).includes(to)) {
    return { status: 'error', message: 'Неизвестный статус' };
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!lead) return { status: 'error', message: 'Заявка не найдена' };
  if (lead.status === to) return { status: 'ok' };

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: {
        status: to as LeadStatusName,
        // Leaving NEW is the moment the owner answered. Recorded once.
        ...(lead.status === 'NEW' ? { firstRepliedAt: new Date() } : {}),
      },
    }),
    prisma.statusEvent.create({ data: { leadId, from: lead.status, to: to as LeadStatusName } }),
  ]);

  revalidatePath('/admin');
  revalidatePath('/admin/applications');
  revalidatePath(`/admin/applications/${leadId}`);
  return { status: 'ok' };
}

export async function addNote(leadId: string, body: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const text = body.trim();
  if (!text) return { status: 'error', message: 'Заметка пустая' };
  if (text.length > 5000) return { status: 'error', message: 'Слишком длинная заметка' };

  await prisma.note.create({ data: { leadId, body: text } });
  revalidatePath(`/admin/applications/${leadId}`);
  return { status: 'ok' };
}

export async function setDeal(
  leadId: string,
  amount: string,
  currency: string,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const value = amount.trim() === '' ? null : Number(amount.replace(',', '.'));
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    return { status: 'error', message: 'Сумма должна быть числом' };
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { dealAmount: value, dealCurrency: value === null ? null : currency },
  });
  revalidatePath(`/admin/applications/${leadId}`);
  return { status: 'ok' };
}

/* -------------------------------------------------------------- payments -- */

export async function addPayment(leadId: string, form: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const amount = Number(String(form.get('amount') ?? '').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: 'error', message: 'Сумма должна быть положительным числом' };
  }

  const paidAtRaw = String(form.get('paidAt') ?? '');
  const dueAtRaw = String(form.get('dueAt') ?? '');

  await prisma.payment.create({
    data: {
      leadId,
      amount,
      currency: String(form.get('currency') ?? 'TJS'),
      kind: String(form.get('kind') ?? 'STAGE') as 'PREPAYMENT' | 'STAGE' | 'FINAL' | 'SUPPORT',
      paidAt: paidAtRaw ? new Date(paidAtRaw) : null,
      dueAt: dueAtRaw ? new Date(dueAtRaw) : null,
      note: String(form.get('note') ?? '').trim() || null,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/finance');
  revalidatePath(`/admin/applications/${leadId}`);
  return { status: 'ok' };
}

export async function markPaid(paymentId: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  await prisma.payment.update({ where: { id: paymentId }, data: { paidAt: new Date() } });
  revalidatePath('/admin');
  revalidatePath('/admin/finance');
  return { status: 'ok' };
}

export async function addExpense(form: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const amount = Number(String(form.get('amount') ?? '').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: 'error', message: 'Сумма должна быть положительным числом' };
  }
  const title = String(form.get('title') ?? '').trim();
  if (!title) return { status: 'error', message: 'Назовите расход' };

  const spentAtRaw = String(form.get('spentAt') ?? '');

  await prisma.expense.create({
    data: {
      title,
      amount,
      currency: String(form.get('currency') ?? 'TJS'),
      category: String(form.get('category') ?? 'Прочее'),
      spentAt: spentAtRaw ? new Date(spentAtRaw) : new Date(),
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/finance');
  return { status: 'ok' };
}

/* ------------------------------------------------------- cases & reviews -- */

export async function toggleCasePublished(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const row = await prisma.case.findUnique({
    where: { id },
    select: { published: true, slug: true },
  });
  if (!row) return { status: 'error', message: 'Кейс не найден' };

  await prisma.case.update({ where: { id }, data: { published: !row.published } });

  // A publish has to reach the live site without a redeploy.
  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath(`/work/${row.slug}`);
  revalidatePath('/admin/projects');
  return { status: 'ok' };
}

/**
 * Create or update a case.
 *
 * `id` empty means create. The slug is what the public address is built from,
 * so it is normalised here rather than trusted: a slug with a slash or a space
 * in it would produce a case nobody can open.
 */
export async function saveCase(id: string, form: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const title = String(form.get('title') ?? '').trim();
  if (!title) return { status: 'error', message: 'Нужно название' };

  const slug =
    String(form.get('slug') ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || null;
  if (!slug) return { status: 'error', message: 'Нужен адрес латиницей, например my-project' };

  const list = (value: FormDataEntryValue | null, separator: RegExp) =>
    String(value ?? '')
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);

  const data = {
    slug,
    title,
    client: String(form.get('client') ?? '').trim() || null,
    year: String(form.get('year') ?? '').trim() || String(new Date().getFullYear()),
    task: String(form.get('task') ?? '').trim(),
    solution: String(form.get('solution') ?? '').trim(),
    result: String(form.get('result') ?? '').trim(),
    technologies: list(form.get('technologies'), /[,\n]/),
    liveUrl: String(form.get('liveUrl') ?? '').trim() || null,
    objectImage: String(form.get('objectImage') ?? '/objects/laptop.webp'),
    ghostWord: String(form.get('ghostWord') ?? '').trim() || null,
    screenshots: list(form.get('screenshots'), /\n/),
    featured: form.get('featured') === 'on',
    order: Number(form.get('order') ?? 0) || 0,
    published: form.get('published') === 'on',
  };

  try {
    if (id) {
      await prisma.case.update({ where: { id }, data });
    } else {
      await prisma.case.create({ data });
    }
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return { status: 'error', message: 'Кейс с таким адресом уже есть' };
    }
    throw error;
  }

  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath(`/work/${slug}`);
  revalidatePath('/admin/projects');
  redirect('/admin/projects');
}

/** Create or update a testimonial. Never invents one: every field is typed in. */
export async function saveTestimonial(id: string, form: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const name = String(form.get('name') ?? '').trim();
  const text = String(form.get('text') ?? '').trim();
  if (!name) return { status: 'error', message: 'Нужно имя клиента' };
  if (!text) return { status: 'error', message: 'Нужен текст отзыва' };

  const caseId = String(form.get('caseId') ?? '').trim() || null;

  const data = {
    name,
    text,
    company: String(form.get('company') ?? '').trim() || null,
    role: String(form.get('role') ?? '').trim() || null,
    avatarUrl: String(form.get('avatarUrl') ?? '').trim() || null,
    caseId,
    featured: form.get('featured') === 'on',
    order: Number(form.get('order') ?? 0) || 0,
    published: form.get('published') === 'on',
  };

  try {
    if (id) {
      await prisma.testimonial.update({ where: { id }, data });
    } else {
      await prisma.testimonial.create({ data });
    }
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return { status: 'error', message: 'К этому кейсу отзыв уже привязан' };
    }
    throw error;
  }

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/testimonials');
  redirect('/admin/testimonials');
}

export async function toggleTestimonialPublished(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate.status === 'refused') return refuse;

  const row = await prisma.testimonial.findUnique({ where: { id }, select: { published: true } });
  if (!row) return { status: 'error', message: 'Отзыв не найден' };

  await prisma.testimonial.update({ where: { id }, data: { published: !row.published } });
  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/testimonials');
  return { status: 'ok' };
}

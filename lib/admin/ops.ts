import 'server-only';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import { markReplied, transitionLead } from '@/lib/telegram/leads';
import { notifyClientStatus } from '@/lib/telegram/notify';

/*
 * What the owner can change, once a door has let him in.
 *
 * There are two doors now and they take different keys — a password in a
 * browser, a Telegram signature inside Telegram — but what lies behind them is
 * one set of operations, and a second copy of "publish this review" is a second
 * copy that drifts. So the operations live here and the doors stay thin.
 *
 * Every one of them takes an `AdminGrant` it never reads. The value is
 * unobtainable without calling a guard, so forgetting to check who is asking
 * stops being something a reviewer has to catch and becomes something that does
 * not compile. The note beside `adminGrant` in lib/auth.ts says what that claim
 * does and does not cover.
 *
 * `revalidatePath` belongs here, beside the write, rather than up in the doors.
 * It is what carries a publish to the live site without a redeploy, it works in
 * a route handler as well as in a server action, and left in the doors it would
 * be present in one and missing from the other — so a case published from the
 * phone would sit in the database, published, and never appear on the site. No
 * error, nothing in a log: the worst way for this to be wrong.
 */

export type OpResult = { status: 'ok' } | { status: 'error'; message: string };

/**
 * Move a lead along the chain, and tell the client.
 *
 * The move itself is `transitionLead`, which the bot's buttons and the web
 * admin already share, so leaving NEW is recorded once in `firstRepliedAt`
 * wherever the press came from.
 */
export async function moveLead(_: AdminGrant, leadId: string, to: string): Promise<OpResult> {
  const result = await transitionLead(leadId, to);
  if (result.status === 'invalid') return { status: 'error', message: 'Неизвестный статус' };
  if (result.status === 'missing') return { status: 'error', message: 'Заявка не найдена' };

  if (result.status === 'ok') {
    // 14.7 — the client hears that their project moved. Not awaited: the owner
    // should not watch a spinner while Telegram is slow.
    void notifyClientStatus(leadId, result.to);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/applications');
  revalidatePath(`/admin/applications/${leadId}`);
  return { status: 'ok' };
}

/** The owner's private note. Never leaves the admin, never reaches a client. */
export async function writeNote(_: AdminGrant, leadId: string, body: string): Promise<OpResult> {
  const text = body.trim();
  if (!text) return { status: 'error', message: 'Заметка пустая' };
  if (text.length > 5000) return { status: 'error', message: 'Слишком длинная заметка' };

  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return { status: 'error', message: 'Заявка не найдена' };

  await prisma.note.create({ data: { leadId, body: text } });
  revalidatePath(`/admin/applications/${leadId}`);
  return { status: 'ok' };
}

/** Marks the lead answered without moving it — the bot's old «Ответил». */
export async function flagReplied(_: AdminGrant, leadId: string): Promise<OpResult> {
  const changed = await markReplied(leadId);
  revalidatePath('/admin');
  revalidatePath(`/admin/applications/${leadId}`);
  return changed ? { status: 'ok' } : { status: 'error', message: 'Уже отмечено' };
}

/**
 * Put a case on the site, or take it off.
 *
 * The revalidations are as much the operation as the write is: the home page,
 * the register and the case's own address all cache, and a publish nobody can
 * see is not a publish.
 */
export async function togglePublishedCase(_: AdminGrant, id: string): Promise<OpResult> {
  const row = await prisma.case.findUnique({
    where: { id },
    select: { published: true, slug: true },
  });
  if (!row) return { status: 'error', message: 'Кейс не найден' };

  await prisma.case.update({ where: { id }, data: { published: !row.published } });

  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath(`/work/${row.slug}`);
  revalidatePath('/admin/projects');
  return { status: 'ok' };
}

/** The same for a review. This is the one he does most: approving. */
export async function togglePublishedTestimonial(_: AdminGrant, id: string): Promise<OpResult> {
  const row = await prisma.testimonial.findUnique({ where: { id }, select: { published: true } });
  if (!row) return { status: 'error', message: 'Отзыв не найден' };

  await prisma.testimonial.update({ where: { id }, data: { published: !row.published } });

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/testimonials');
  return { status: 'ok' };
}

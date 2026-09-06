import 'server-only';
import { InlineKeyboard } from 'grammy';
import { prisma } from '@/lib/prisma';
import { site } from '@/lib/content/site';
import type { LeadStatusName } from '@/lib/content/finance';
import { adminIds, botToken, escapeHtml, sendWithRetry } from '@/lib/telegram/api';
import { clientStatusLine, notification, notificationButtons } from '@/lib/telegram/texts';

/*
 * Messages the application sends on its own: the owner hears about a new lead,
 * the client hears that their project moved. Both are fire-and-forget from the
 * caller's point of view and safe to call when the bot is not configured — they
 * simply do nothing.
 */

const when = (date: Date) =>
  date.toLocaleString('ru-RU', {
    timeZone: 'Asia/Dushanbe',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const sourceLabel: Record<string, string> = { site: 'сайт', telegram: 'Telegram' };

/** A t.me link for a contact that is a handle or a phone; nothing otherwise. */
export function contactUrl(contact: string | null | undefined): string | undefined {
  const value = (contact ?? '').trim();
  const handle = value.match(/^@?([a-zA-Z][a-zA-Z0-9_]{4,31})$/);
  if (handle) return `https://t.me/${handle[1]}`;
  const digits = value.replace(/[\s()-]/g, '');
  if (/^\+?\d{9,15}$/.test(digits)) return `https://t.me/+${digits.replace(/^\+/, '')}`;
  return undefined;
}

export function adminLeadUrl(leadId: string): string {
  return `${site.url}/admin/applications/${leadId}`;
}

type LeadForCard = {
  id: string;
  ref: string;
  name: string;
  company: string | null;
  projectType: string;
  description: string;
  goal: string;
  features: string | null;
  budget: string;
  timeline: string;
  contact: string | null;
  email: string;
  extra: string | null;
  createdAt: Date;
  source: string;
  status: string;
};

const line = (label: string, value: string | null | undefined) =>
  value ? `${label}: ${escapeHtml(value)}` : null;

/** 14.3 — the notification body. Also the card the owner opens later. */
export function leadCard(lead: LeadForCard, title: string = notification.title): string {
  const contact = [lead.contact, lead.email].filter(Boolean).join(' · ');
  return [
    `<b>${escapeHtml(title)}</b> · <code>${escapeHtml(lead.ref)}</code>`,
    '',
    line(notification.name, lead.name),
    line(notification.company, lead.company),
    line(notification.projectType, lead.projectType),
    line(notification.description, lead.description),
    line(notification.goal, lead.goal),
    line(notification.features, lead.features),
    line(notification.budget, lead.budget),
    line(notification.timeline, lead.timeline),
    line(notification.contact, contact),
    line(notification.extra, lead.extra),
    line(notification.createdAt, when(lead.createdAt)),
    line(notification.source, sourceLabel[lead.source] ?? lead.source),
  ]
    .filter((row) => row !== null)
    .join('\n');
}

export function notificationKeyboard(lead: { id: string; contact: string | null }): InlineKeyboard {
  const keyboard = new InlineKeyboard().url(notificationButtons.open, adminLeadUrl(lead.id));
  const url = contactUrl(lead.contact);
  if (url) keyboard.url(notificationButtons.contact, url);
  keyboard.row().text(notificationButtons.status, `lead:${lead.id}`);
  return keyboard;
}

/** Tells every admin. Called right after the row is written, off the response. */
export async function notifyNewLead(leadId: string): Promise<void> {
  if (!botToken()) return;
  const admins = adminIds();
  if (admins.size === 0) return;

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;
    const text = leadCard(lead);
    const keyboard = notificationKeyboard(lead);
    await Promise.all([...admins].map((id) => sendWithRetry(id, text, { reply_markup: keyboard })));
  } catch (error) {
    console.error(`[bot] notifyNewLead failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
  }
}

/**
 * 14.7 — the client hears that their project moved, in the words of 14.6,
 * while their chat has not said /stop.
 */
export async function notifyClientStatus(leadId: string, to: LeadStatusName): Promise<void> {
  if (!botToken()) return;
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { ref: true, telegramChatId: true },
    });
    if (!lead?.telegramChatId) return;
    const chat = await prisma.botChat.findUnique({ where: { chatId: lead.telegramChatId } });
    if (chat && !chat.notify) return;
    await sendWithRetry(
      lead.telegramChatId,
      `<code>${escapeHtml(lead.ref)}</code>\n${escapeHtml(clientStatusLine[to])}`,
    );
  } catch (error) {
    console.error(`[bot] notifyClientStatus failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
  }
}

/** A review left through the site is waiting. The owner decides in the admin. */
export async function notifyNewReview(id: string): Promise<void> {
  if (!botToken()) return;
  const admins = adminIds();
  if (admins.size === 0) return;
  try {
    const row = await prisma.testimonial.findUnique({
      where: { id },
      select: { name: true, company: true, rating: true, text: true },
    });
    if (!row) return;
    const stars = row.rating ? '★'.repeat(row.rating) + '☆'.repeat(5 - row.rating) : '';
    const excerpt = row.text.length > 300 ? `${row.text.slice(0, 300)}…` : row.text;
    const text = [
      '<b>⭐ Новый отзыв на сайте</b> · ждёт проверки',
      '',
      `${escapeHtml(row.name)}${row.company ? ` · ${escapeHtml(row.company)}` : ''}${stars ? ` · ${stars}` : ''}`,
      '',
      escapeHtml(excerpt),
    ].join('\n');
    const keyboard = new InlineKeyboard().url('Открыть отзыв', `${site.url}/admin/testimonials/${id}`);
    await Promise.all([...admins].map((chat) => sendWithRetry(chat, text, { reply_markup: keyboard })));
  } catch (error) {
    console.error(`[bot] notifyNewReview failed: ${(error as Error)?.constructor?.name ?? 'Error'}`);
  }
}

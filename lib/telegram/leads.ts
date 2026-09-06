import 'server-only';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { createLeadRef } from '@/lib/lead';
import type { BriefInput } from '@/lib/content/brief';
import { leadStatuses, type LeadStatusName } from '@/lib/content/finance';

/*
 * The one place a lead is written and the one place its status moves.
 *
 * The site's form and the Telegram bot are two doors into the same room. Both
 * validate with `briefSchema` and both end up here, so there is exactly one
 * definition of what a lead is and one of what a status change does. The admin
 * action and the bot's buttons call `transitionLead`; neither has its own copy.
 */

export type LeadSource = 'site' | 'telegram';

/** 32 hex characters from a CSPRNG. Shown to the client once, with the number. */
export function newTrackingToken(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Constant-time comparison, so the time a wrong token takes to reject says
 * nothing about how many of its characters were right.
 */
export function tokenMatches(given: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const a = Buffer.from(given.trim().toLowerCase());
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type CreatedLead = { id: string; ref: string; trackingToken: string };

/**
 * Writes a validated brief.
 *
 * The reference is derived from a count, so two submissions in the same instant
 * can pick the same one. The unique index rejects the loser and the retry takes
 * the next number.
 */
export async function createLead(
  data: BriefInput,
  source: LeadSource,
  telegramChatId?: string,
): Promise<CreatedLead> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ref = await createLeadRef();
    const trackingToken = newTrackingToken();
    try {
      const lead = await prisma.lead.create({
        data: {
          ref,
          name: data.name,
          email: data.email.toLowerCase(),
          company: data.company || null,
          contact: data.contact,
          projectType: data.projectType,
          budget: data.budget,
          timeline: data.timeline,
          goal: data.goal,
          description: data.description,
          audience: data.audience || null,
          features: data.features || null,
          links: data.links || null,
          extra: data.extra || null,
          source,
          trackingToken,
          telegramChatId: telegramChatId ?? null,
        },
        select: { id: true, ref: true },
      });
      return { ...lead, trackingToken };
    } catch (error) {
      lastError = error;
      const code = (error as { code?: string })?.code;
      if (code !== 'P2002') throw error;
    }
  }

  throw lastError;
}

export type Transition =
  | { status: 'ok'; from: LeadStatusName; to: LeadStatusName; ref: string }
  | { status: 'same' }
  | { status: 'missing' }
  | { status: 'invalid' };

/**
 * Moves a lead along the chain and records the move.
 *
 * Leaving NEW is the moment the owner answered, recorded once in
 * `firstRepliedAt` — the number the admin's overview counts.
 */
export async function transitionLead(leadId: string, to: string): Promise<Transition> {
  if (!(leadStatuses as readonly string[]).includes(to)) return { status: 'invalid' };
  const next = to as LeadStatusName;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { status: true, ref: true },
  });
  if (!lead) return { status: 'missing' };
  if (lead.status === next) return { status: 'same' };

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: {
        status: next,
        ...(lead.status === 'NEW' ? { firstRepliedAt: new Date() } : {}),
      },
    }),
    prisma.statusEvent.create({ data: { leadId, from: lead.status, to: next } }),
  ]);

  return { status: 'ok', from: lead.status as LeadStatusName, to: next, ref: lead.ref };
}

/** Marks the lead answered without moving it — the bot's «Ответил». */
export async function markReplied(leadId: string): Promise<boolean> {
  const result = await prisma.lead.updateMany({
    where: { id: leadId, firstRepliedAt: null },
    data: { firstRepliedAt: new Date() },
  });
  return result.count > 0;
}

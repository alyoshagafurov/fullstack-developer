/*
 * The contract between the admin UI and the Django API.
 *
 * Written from backend/apps/leads/serializers.py, not guessed. If the two
 * drift apart the UI will render blanks rather than crash — but they should
 * not drift, so the field names here are the camelCase ones DRF actually
 * emits, spelled identically.
 *
 * `internalNote` appears on the detail shape only, exactly as it does on the
 * server. It is not in `LeadRow`, so no list view can leak it even by mistake.
 */

/** Mirrors the PostgreSQL enum `LeadStatus`. Do not invent members. */
export const LEAD_STATUSES = [
  'NEW', 'CONTACTED', 'DISCOVERY', 'PROPOSAL',
  'IN_PROGRESS', 'COMPLETED', 'DECLINED',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Russian labels. The admin is single-language by design — see ARCHITECTURE. */
export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'Новая',
  CONTACTED: 'Связались',
  DISCOVERY: 'Дискавери',
  PROPOSAL: 'Предложение',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
  DECLINED: 'Отклонена',
};

/* Option lists mirror lib/brief/schema.ts, so the admin can render a stored
   code as the words the visitor actually chose. */
export const PROJECT_TYPE_LABEL: Record<string, string> = {
  website: 'Сайт', landing: 'Лендинг', webapp: 'Веб-приложение',
  saas: 'SaaS', ecommerce: 'Интернет-магазин', crm: 'CRM',
  telegram: 'Telegram-бот', automation: 'Автоматизация', ai: 'AI',
  api: 'API', custom: 'Кастомная разработка', other: 'Другое',
};

export const BUDGET_LABEL: Record<string, string> = {
  lt500: 'до $500', r500_1k: '$500–1 000', r1k_2k5: '$1 000–2 500',
  r2k5_5k: '$2 500–5 000', gt5k: 'от $5 000', unsure: 'не определён',
};

export const TIMELINE_LABEL: Record<string, string> = {
  asap: 'как можно скорее', w1_2: '1–2 недели', w2_4: '2–4 недели',
  m1_2: '1–2 месяца', flexible: 'гибкие', unsure: 'не определены',
};

/** A row in the register. Deliberately narrow — no contact detail, no note. */
export interface LeadRow {
  reference: string;
  name: string;
  projectType: string;
  createdAt: string;
  status: LeadStatus;
}

/** The full record. Reachable only behind authentication + view permission. */
export interface LeadDetail extends LeadRow {
  submissionId: string;
  projectTypeOther: string;
  goal: string;
  description: string;
  functionality: string;
  existingUrl: string;
  referenceLinks: string;
  notes: string;
  budget: string;
  timeline: string;
  company: string;
  email: string;
  telegram: string;
  whatsapp: string;
  consent: boolean;
  locale: string;
  startedAt: string;
  completedAt: string;
  updatedAt: string;
  /** The owner's private note. Never present in any public response. */
  internalNote: string;
}

/** Counts per stage. Every status is present, including the empty ones. */
export interface LeadSummary {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

export interface Paged<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/*
 * Who is signed in, plus what the deployment currently allows.
 *
 * These are two different things and the UI must not collapse them. An ADMIN
 * holds `changeLeads` whether or not writes are open; `writesEnabled` says
 * whether Django is the writer yet. During the read-only phase an admin sees
 * "not yet", not "you may not" — the second would be a lie about their role.
 */
export interface AdminSessionInfo {
  user: AdminUser;
  /** False while Prisma still owns ProjectLead and Django only reads it. */
  writesEnabled: boolean;
}

export interface AdminUser {
  username: string;
  role: 'ADMIN' | 'VIEWER' | null;
  permissions: {
    viewLeads: boolean;
    changeLeads: boolean;
    /** Always false — no role grants it. Reported so the UI can say so. */
    deleteLeads: boolean;
  };
}

/*
 * Every call returns one of these. The UI branches on `status`, so each
 * failure gets a real screen instead of a blank page or a thrown error:
 *
 *   unauthenticated  no session, or it expired      -> redirect to login
 *   forbidden        signed in, lacks the permission -> "недостаточно прав"
 *   notFound         no such lead                    -> "заявка не найдена"
 *   unavailable      backend not configured, or down -> honest failure panel
 *   error            anything else
 *
 * There is deliberately no variant that means "pretend it worked".
 */
export type ApiResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'unauthenticated' }
  /** `code` distinguishes "not yet" (read_only_phase) from "not you". */
  | { status: 'forbidden'; code?: string }
  | { status: 'notFound' }
  | { status: 'unavailable'; code: string }
  | { status: 'error'; code: string };

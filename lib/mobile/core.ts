import { z } from 'zod';
export const emptySnapshot = { customers: [], tasks: [], notes: [], ledger: [], messages: [] };
const id = z.string().uuid();
const title = z.string().trim().min(1).max(10000);
const date = z.number().finite().min(-10000000000).max(10000000000);
const amount = z.number().finite().nonnegative().lt(1e10).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.001);
const currency = z.enum(['TJS','USD','RUB']);
const link = id.nullish();
const name = z.string().trim().min(1).max(500);
// Projects, time sessions and debts as Swift's synthesized Codable writes them: Date is seconds
// since 2001, Decimal a number, a nil optional an omitted key. An absent array is not part of the snapshot.
const project = z.object({id,name,customerID:link,taskIDs:z.array(id).max(5000),deadline:date.nullish(),stage:z.string().max(200).nullish()});
const session = z.object({id,projectID:id,startedAt:date,seconds:z.number().finite().nonnegative(),resumedAt:date.nullish(),endedAt:date.nullish()});
const debt = z.object({id,person:name,amount:z.number().finite().nonnegative().lt(1e10),currency,owedToMe:z.boolean(),due:date.nullish(),payments:z.array(z.number().finite().nonnegative().lt(1e10)).max(5000)});
export const snapshotSchema = z.object({
 customers: z.array(z.object({id, name:title, company:z.string(),project:z.string(),email:z.string(),phone:z.string(),telegram:z.string(),status:z.enum(['Новый','Переговоры','В работе','Завершён','Пауза']),currency,deal:amount,detail:z.string(),createdAt:date})).max(20000),
 tasks: z.array(z.object({id,title,detail:z.string(),date,hasTime:z.boolean(),finished:z.boolean(),reminder:z.boolean(),customerId:link,recurrence:z.enum(['Ежедневно','Еженедельно','Ежемесячно']).nullish(),completedDays:z.array(z.string().max(32)).max(20000).nullish(),timeZoneID:z.string().max(100).nullish()})).max(20000),
 notes:z.array(z.object({id,title,content:z.string().max(1000000),category:z.string(),pinned:z.boolean(),customerId:link,updatedAt:date})).max(20000),
 // An entry typed in another currency is stored converted (amount, currency); the amount and code
 // as typed and the rate used (stored currency per one unit of the original) travel alongside.
 ledger:z.array(z.object({id,title,amount:amount.refine(v=>v>0),currency,type:z.enum(['Доход','Расход','Ожидается']),category:z.string(),date,customerId:link,detail:z.string(),originalAmount:amount.refine(v=>v>0).nullish(),originalCurrency:z.string().regex(/^[A-Z]{3}$/).nullish(),rate:z.number().finite().positive().lt(1e9).nullish()})).max(50000),
 messages:z.array(z.object({id,customerId:id,text:z.string(),direction:z.enum(['incoming','outgoing']),date})).max(50000),
 projects:z.array(project).max(20000).optional(),
 sessions:z.array(session).max(100000).optional(),
 debts:z.array(debt).max(20000).optional()
}).strict().superRefine((s,ctx)=>{
 const clients=new Set(s.customers.map(c=>c.id));
 for(const records of [s.customers,s.tasks,s.notes,s.ledger,s.messages,s.projects??[],s.sessions??[],s.debts??[]]) {
   if(new Set(records.map(r=>r.id)).size!==records.length) ctx.addIssue({code:'custom',message:'Duplicate ID'});
 }
 for(const r of [...s.tasks,...s.notes,...s.ledger,...s.messages]) {
   if(r.customerId && !clients.has(r.customerId)) ctx.addIssue({code:'custom',message:'Missing client'});
 }
});
export const pushSchema=z.object({revision:z.number().int().min(0).max(2147483646),snapshot:snapshotSchema}).strict();
export type Snapshot = z.infer<typeof snapshotSchema>;

const carriedArrays = ['projects','sessions','debts'] as const;
const conversionFields = ['originalAmount','originalCurrency','rate'] as const;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * What a push may not erase just because the pushing app is older than the data.
 * An app that does not know projects/sessions/debts omits those keys: the stored arrays stay.
 * An explicit array, empty included, replaces them. A ledger entry without originalCurrency
 * whose stored version has one and the same amount, currency and type keeps the stored
 * originalAmount/originalCurrency/rate; a value the push sends itself is never overwritten.
 * Pure: neither argument is modified.
 */
export function carryForward(stored: unknown, incoming: Snapshot): Snapshot {
  const old = typeof stored === 'string' ? JSON.parse(stored) as unknown : stored;
  if (!isRecord(old)) return incoming;
  const next: Snapshot = { ...incoming };
  for (const key of carriedArrays) {
    if (incoming[key] === undefined && Array.isArray(old[key])) next[key] = old[key] as never;
  }
  const previous = new Map<unknown, Record<string, unknown>>();
  if (Array.isArray(old.ledger)) for (const item of old.ledger) if (isRecord(item)) previous.set(item.id, item);
  next.ledger = incoming.ledger.map(item => {
    const prior = previous.get(item.id);
    if (item.originalCurrency != null || !prior || typeof prior.originalCurrency !== 'string') return item;
    if (prior.amount !== item.amount || prior.currency !== item.currency || prior.type !== item.type) return item;
    const copy: Record<string, unknown> = { ...item };
    for (const key of conversionFields) if (copy[key] == null && prior[key] != null) copy[key] = prior[key];
    return copy as typeof item;
  });
  return next;
}

/** Minimal parameterised query runner ($1, $2, …), so the same code runs on Prisma and on PGlite in tests. */
export interface Db { query<T>(text: string, params: unknown[]): Promise<T[]> }

/**
 * Compare-and-swap write of the workspace. Revision 0 creates the row only if none exists.
 * Otherwise the stored row is read, carried forward into the push and written back only if its
 * revision is still the one the device saw; every write bumps the revision, so the row that was
 * read is exactly the row that gets replaced. Returns what is stored, or null on a conflict.
 */
export async function pushWorkspace(db: Db, ownerID: string, revision: number, incoming: Snapshot): Promise<{ revision: number; snapshot: Snapshot } | null> {
  if (revision === 0) {
    const rows = await db.query<{ revision: number }>('INSERT INTO aly_mobile_workspace(owner_id,revision,snapshot) VALUES($1,1,$2::jsonb) ON CONFLICT(owner_id) DO NOTHING RETURNING revision', [ownerID, JSON.stringify(incoming)]);
    return rows[0] ? { revision: 1, snapshot: incoming } : null;
  }
  const current = await db.query<{ revision: number; snapshot: unknown }>('SELECT revision,snapshot FROM aly_mobile_workspace WHERE owner_id=$1', [ownerID]);
  if (!current[0] || Number(current[0].revision) !== revision) return null;
  // The stored data passed this schema when it was written; failing here means it was altered by hand.
  const merged = snapshotSchema.safeParse(carryForward(current[0].snapshot, incoming));
  if (!merged.success) throw new Error('Stored workspace no longer validates');
  const rows = await db.query<{ revision: number }>('UPDATE aly_mobile_workspace SET revision=revision+1,snapshot=$2::jsonb,updated_at=now() WHERE owner_id=$1 AND revision=$3 RETURNING revision', [ownerID, JSON.stringify(merged.data), revision]);
  return rows[0] ? { revision: Number(rows[0].revision), snapshot: merged.data } : null;
}

/** Device sessions slide: 90 days from sign-in, renewed to 90 days once fewer than 83 remain. */
export const SESSION_DAYS = 90;
export const SESSION_RENEW_BELOW_DAYS = 83;
/**
 * One round trip: the owner of a live token ($1 = its SHA-256). The renewal writes only when the
 * session is more than a week into its term, so a device costs at most about one write a week.
 * Expired, revoked and unknown tokens return no row and are never revived.
 */
export const SESSION_SQL = `WITH live AS (SELECT owner_id FROM aly_mobile_session WHERE token_hash=$1 AND expires_at>now()),
renewed AS (UPDATE aly_mobile_session SET expires_at=now()+interval '${SESSION_DAYS} days' WHERE token_hash=$1 AND expires_at>now() AND expires_at<now()+interval '${SESSION_RENEW_BELOW_DAYS} days' RETURNING owner_id)
SELECT owner_id FROM live`;

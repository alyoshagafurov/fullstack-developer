import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { AdminGrant } from '@/lib/auth';
import type { OpResult } from '@/lib/admin/ops';
import { createOnce, operationId } from '@/lib/admin/once';
import { deleteCaseTranslations, getCaseTranslations, saveCaseTranslation } from '@/lib/case-i18n';
import { revalidateSite } from '@/lib/i18n/revalidate';
import { RELATED_CASES } from '@/lib/content/service-pages';
import { services } from '@/lib/content/services';
import { getPriceRows } from '@/lib/prices';

/*
 * What the public site shows, edited from the owner's phone: projects (cases)
 * with their English text and pictures, reviews, and the price list.
 *
 * The rules are the ones the web admin enforced, moved here so every door —
 * the Mini App, ALY OS — applies the same ones. After every write the pages
 * that show the record are revalidated in every language, because a change
 * nobody sees is not a change.
 *
 * Publishing takes the state to end in, never "flip": a request repeated over
 * a bad connection must not switch a project back off.
 */

type Result<T = object> = OpResult & T;

const text = (max: number) => z.string().trim().max(max);
const url = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || v.startsWith('/') || /^https:\/\/[^\s]+$/.test(v), 'Адрес должен начинаться с https:// или /');

/* ---------------------------------------------------------------- cases -- */

/*
 * Pages outside /work that list published projects: /dushanbe, and the
 * service pages that show their own (RELATED_CASES — today, the online
 * stores). A project hidden or deleted must leave them too, not linger there
 * as a link to a 404 until the next revalidation.
 */
const CASE_LISTS = ['/dushanbe', ...Object.keys(RELATED_CASES).map((slug) => `/services/${slug}`)];

const caseInput = z.object({
  id: z.string().max(40).optional(),
  operationID: z.unknown().optional(),
  slug: z.string().trim().max(80),
  title: text(200).min(1, 'Нужно название'),
  client: text(200).optional().default(''),
  year: text(10).optional().default(''),
  task: text(5000).optional().default(''),
  solution: text(5000).optional().default(''),
  result: text(5000).optional().default(''),
  technologies: z.array(text(60)).max(30).optional().default([]),
  liveUrl: url.optional().default(''),
  objectImage: url.optional().default(''),
  logoUrl: url.optional().default(''),
  screenshots: z.array(url).max(30).optional().default([]),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  order: z.number().int().min(0).max(10000).optional(),
  en: z
    .object({ title: text(200), task: text(5000), solution: text(5000), result: text(5000) })
    .partial()
    .optional(),
});

export async function listCasesAdmin(_: AdminGrant) {
  const rows = await prisma.case.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  const en = await getCaseTranslations('en', rows.map((r) => r.id));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    client: r.client,
    year: r.year,
    published: r.published,
    featured: r.featured,
    order: r.order,
    cover: r.screenshots[0] ?? r.objectImage,
    hasEnglish: en.has(r.id),
    updatedAt: r.updatedAt,
  }));
}

export async function getCaseAdmin(_: AdminGrant, id: string) {
  const row = await prisma.case.findUnique({ where: { id } });
  if (!row) return null;
  const en = (await getCaseTranslations('en', [id])).get(id) ?? { title: '', task: '', solution: '', result: '' };
  return { ...row, en };
}

function slugOf(raw: string, title: string): string {
  const base = (raw || title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 80);
}

/** Create (no `id`) or update a case. Returns the case's id. */
export async function saveCase(_: AdminGrant, raw: unknown): Promise<Result<{ id?: string }>> {
  const parsed = caseInput.safeParse(raw);
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Проверьте поля кейса' };
  const v = parsed.data;
  const slug = slugOf(v.slug, '');
  if (!slug) return { status: 'error', message: 'Нужен адрес латиницей, например my-project' };

  const op = operationId(v.operationID);
  if (op === null) return { status: 'error', message: 'Некорректный идентификатор операции' };

  const data = {
    slug,
    title: v.title,
    client: v.client || null,
    year: v.year || String(new Date().getFullYear()),
    task: v.task,
    solution: v.solution,
    result: v.result,
    technologies: v.technologies.filter(Boolean),
    liveUrl: v.liveUrl || null,
    objectImage: v.objectImage || '/objects/laptop.webp',
    logoUrl: v.logoUrl || null,
    screenshots: v.screenshots.filter(Boolean),
    featured: v.featured,
    published: v.published,
    ...(v.order !== undefined ? { order: v.order } : {}),
  };

  let id = v.id;
  let previousSlug: string | null = null;
  try {
    if (id) {
      const before = await prisma.case.findUnique({ where: { id }, select: { slug: true } });
      if (!before) return { status: 'error', message: 'Кейс не найден' };
      previousSlug = before.slug;
      await prisma.case.update({ where: { id }, data });
    } else {
      const order = v.order ?? ((await prisma.case.aggregate({ _max: { order: true } }))._max.order ?? -1) + 1;
      id = op ?? undefined;
      const created = await createOnce(
        () => prisma.case.create({ data: { ...(op ? { id: op } : {}), ...data, order } }),
        () => (op ? prisma.case.findUnique({ where: { id: op } }) : Promise.resolve(null)),
        (row) => row.slug === slug && row.title === data.title,
      );
      if (created.status === 'error') return created;
      if (!id) id = (await prisma.case.findUnique({ where: { slug }, select: { id: true } }))?.id;
    }
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') return { status: 'error', message: 'Кейс с таким адресом уже есть' };
    throw error;
  }
  if (!id) return { status: 'error', message: 'Не получилось сохранить кейс' };

  if (v.en) {
    await saveCaseTranslation(id, 'en', {
      title: v.en.title ?? '',
      task: v.en.task ?? '',
      solution: v.en.solution ?? '',
      result: v.en.result ?? '',
    });
  }

  revalidateSite(
    '/',
    '/work',
    `/work/${slug}`,
    ...(previousSlug && previousSlug !== slug ? [`/work/${previousSlug}`] : []),
    ...CASE_LISTS,
  );
  return { status: 'ok', id };
}

export async function setCasePublished(_: AdminGrant, id: string, published: unknown): Promise<OpResult> {
  if (typeof published !== 'boolean') return { status: 'error', message: 'Укажите, показывать ли кейс' };
  const row = await prisma.case.findUnique({ where: { id }, select: { slug: true } });
  if (!row) return { status: 'error', message: 'Кейс не найден' };
  await prisma.case.update({ where: { id }, data: { published } });
  revalidateSite('/', '/work', `/work/${row.slug}`, ...CASE_LISTS);
  return { status: 'ok' };
}

/** The order of the list as the owner arranged it; every id must be a known case. */
export async function orderCases(_: AdminGrant, ids: unknown): Promise<OpResult> {
  const parsed = z.array(z.string().max(40)).min(1).max(500).safeParse(ids);
  if (!parsed.success || new Set(parsed.data).size !== parsed.data.length) return { status: 'error', message: 'Проверьте порядок' };
  const known = await prisma.case.count({ where: { id: { in: parsed.data } } });
  if (known !== parsed.data.length) return { status: 'error', message: 'Список кейсов изменился. Обновите его' };
  await prisma.$transaction(parsed.data.map((id, order) => prisma.case.update({ where: { id }, data: { order } })));
  revalidateSite('/', '/work', ...CASE_LISTS);
  return { status: 'ok' };
}

/** Permanently. A review attached to it stays and stops pointing at it. Files stay in storage. */
export async function deleteCase(_: AdminGrant, id: string): Promise<OpResult> {
  const row = await prisma.case.findUnique({ where: { id }, select: { slug: true } });
  if (!row) return { status: 'ok' };
  await prisma.case.delete({ where: { id } });
  await deleteCaseTranslations(id).catch(() => undefined);
  revalidateSite('/', '/work', `/work/${row.slug}`, ...CASE_LISTS);
  return { status: 'ok' };
}

/* -------------------------------------------------------------- reviews -- */

const reviewInput = z.object({
  id: z.string().max(40).optional(),
  operationID: z.unknown().optional(),
  name: text(120).min(1, 'Нужно имя клиента'),
  text: text(3000).min(1, 'Нужен текст отзыва'),
  company: text(120).optional().default(''),
  role: text(120).optional().default(''),
  rating: z.number().int().min(1).max(5).nullable().optional().default(null),
  gender: z.enum(['male', 'female']).nullable().optional().default(null),
  caseId: z.string().max(40).nullable().optional().default(null),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  order: z.number().int().min(0).max(10000).optional().default(0),
});

export async function saveReview(_: AdminGrant, raw: unknown): Promise<Result<{ id?: string }>> {
  const parsed = reviewInput.safeParse(raw);
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Проверьте отзыв' };
  const v = parsed.data;
  const op = operationId(v.operationID);
  if (op === null) return { status: 'error', message: 'Некорректный идентификатор операции' };
  const data = {
    name: v.name,
    text: v.text,
    company: v.company || null,
    role: v.role || null,
    rating: v.rating,
    gender: v.gender,
    caseId: v.caseId || null,
    featured: v.featured,
    published: v.published,
    order: v.order,
  };
  let id = v.id;
  try {
    if (id) {
      const found = await prisma.testimonial.findUnique({ where: { id }, select: { id: true } });
      if (!found) return { status: 'error', message: 'Отзыв не найден' };
      await prisma.testimonial.update({ where: { id }, data });
    } else {
      const created = await createOnce(
        () => prisma.testimonial.create({ data: { ...(op ? { id: op } : {}), ...data } }),
        () => (op ? prisma.testimonial.findUnique({ where: { id: op } }) : Promise.resolve(null)),
        (row) => row.name === data.name && row.text === data.text,
      );
      if (created.status === 'error') return created;
      id = op ?? undefined;
    }
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') return { status: 'error', message: 'К этому кейсу отзыв уже привязан' };
    throw error;
  }
  revalidateSite('/', '/reviews');
  return { status: 'ok', ...(id ? { id } : {}) };
}

export async function setReviewPublished(_: AdminGrant, id: string, published: unknown): Promise<OpResult> {
  if (typeof published !== 'boolean') return { status: 'error', message: 'Укажите, показывать ли отзыв' };
  const row = await prisma.testimonial.findUnique({ where: { id }, select: { id: true } });
  if (!row) return { status: 'error', message: 'Отзыв не найден' };
  await prisma.testimonial.update({ where: { id }, data: { published } });
  revalidateSite('/', '/reviews');
  return { status: 'ok' };
}

export async function deleteReview(_: AdminGrant, id: string): Promise<OpResult> {
  await prisma.testimonial.deleteMany({ where: { id } });
  revalidateSite('/', '/reviews');
  return { status: 'ok' };
}

/* --------------------------------------------------------------- prices -- */

export async function listPrices(_: AdminGrant) {
  return getPriceRows();
}

const priceRow = z.object({
  slug: z.string().max(60),
  price: text(200).optional().default(''),
  duration: text(200).optional().default(''),
  note: text(200).optional().default(''),
  hidden: z.boolean().optional().default(false),
});

/**
 * Save the list. A row with nothing in it is not a blank price but "no
 * override": it is removed and the site falls back to the content file.
 */
export async function savePrices(_: AdminGrant, raw: unknown): Promise<OpResult> {
  const parsed = z.array(priceRow).max(100).safeParse(raw);
  if (!parsed.success) return { status: 'error', message: 'Проверьте цены' };
  const known = new Set(services.map((s) => s.slug));
  if (parsed.data.some((r) => !known.has(r.slug))) return { status: 'error', message: 'Неизвестная услуга' };

  const keep = parsed.data.filter((r) => r.price || r.duration || r.note || r.hidden);
  const drop = parsed.data.filter((r) => !(r.price || r.duration || r.note || r.hidden)).map((r) => r.slug);

  await prisma.$transaction([
    prisma.servicePrice.deleteMany({ where: { slug: { in: drop } } }),
    ...keep.map((r) => {
      const row = { slug: r.slug, price: r.price || null, duration: r.duration || null, note: r.note || null, hidden: r.hidden };
      return prisma.servicePrice.upsert({ where: { slug: r.slug }, create: row, update: row });
    }),
  ]);
  /*
   * Every page of the public site, not only the price list and the services:
   * the layout's JSON-LD carries the business's priceRange, and /dushanbe and
   * the home quote prices too. The route group has to be in the path — the
   * tag Next gives the layout is `_N_T_/(site)/[lang]/layout`, so
   * '/[lang]' would name a layout no page carries and refresh nothing.
   */
  revalidatePath('/(site)/[lang]', 'layout');
  return { status: 'ok' };
}

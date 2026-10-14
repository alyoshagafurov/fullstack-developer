import { prisma, safely } from '@/lib/prisma';

/*
 * Cases in another language — the owner's English version of a case.
 *
 * The case row keeps his original words; this table only holds the
 * translation, keyed by case and language. Anything left empty here falls
 * back to the original, so the site never shows a blank where a translation
 * is missing.
 *
 * Created here, by the application, the first time it is needed — never by
 * `prisma db push`, which this shared database cannot take; see the note at
 * the top of prisma/schema.prisma.
 */

export type CaseText = { title: string; task: string; solution: string; result: string };

let ensured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  ensured ??= (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "aly_case_i18n" (
          "caseId" TEXT NOT NULL,
          "locale" TEXT NOT NULL,
          "title" TEXT NOT NULL DEFAULT '',
          "task" TEXT NOT NULL DEFAULT '',
          "solution" TEXT NOT NULL DEFAULT '',
          "result" TEXT NOT NULL DEFAULT '',
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "aly_case_i18n_pkey" PRIMARY KEY ("caseId", "locale")
        )
      `);
    } catch (error) {
      console.warn(
        `[case-i18n] ensureTable: ${(error as Error)?.constructor?.name ?? 'Error'} (likely a concurrent create)`,
      );
      ensured = null;
    }
  })();
  return ensured;
}

/** Translations for a set of cases, by case id. Empty when there are none or the table is unreachable. */
export async function getCaseTranslations(locale: string, ids: string[]): Promise<Map<string, CaseText>> {
  if (ids.length === 0) return new Map();
  const rows = await safely(
    'getCaseTranslations',
    async () => {
      await ensureTable();
      return prisma.caseTranslation.findMany({
        where: { locale, caseId: { in: ids } },
        select: { caseId: true, title: true, task: true, solution: true, result: true },
      });
    },
    [],
  );
  return new Map(rows.map(({ caseId, ...text }) => [caseId, text]));
}

/** The admin's save. All four empty removes the translation rather than storing blanks. */
export async function saveCaseTranslation(caseId: string, locale: string, text: CaseText): Promise<void> {
  await ensureTable();
  const clean: CaseText = {
    title: text.title.trim(),
    task: text.task.trim(),
    solution: text.solution.trim(),
    result: text.result.trim(),
  };
  if (!clean.title && !clean.task && !clean.solution && !clean.result) {
    await prisma.caseTranslation.deleteMany({ where: { caseId, locale } });
    return;
  }
  await prisma.caseTranslation.upsert({
    where: { caseId_locale: { caseId, locale } },
    create: { caseId, locale, ...clean },
    update: { ...clean, updatedAt: new Date() },
  });
}

export async function deleteCaseTranslations(caseId: string): Promise<void> {
  await ensureTable();
  await prisma.caseTranslation.deleteMany({ where: { caseId } });
}

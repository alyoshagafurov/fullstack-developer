import 'server-only';
import { prisma } from '@/lib/prisma';

/*
 * Who has already been greeted on Instagram.
 *
 * Created here, by the application, the first time it is needed — never by
 * `prisma migrate` or `db push`, which this shared database cannot take; see
 * the note at the top of schema.prisma and the longer one in income.ts.
 */
let ensured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  ensured ??= (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "aly_instagram_contact" (
          "igsid" TEXT NOT NULL,
          "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "aly_instagram_contact_pkey" PRIMARY KEY ("igsid")
        )
      `);
    } catch (error) {
      console.warn(
        `[instagram] ensureTable: ${(error as Error)?.constructor?.name ?? 'Error'} (likely a concurrent create)`,
      );
      ensured = null;
    }
  })();
  return ensured;
}

/**
 * The atomic "is this really the first time": true only on the one call that
 * wins the insert for a given `igsid`. Call this before sending, never
 * after — see the model's own comment in schema.prisma.
 */
export async function claimFirstContact(igsid: string): Promise<boolean> {
  await ensureTable();
  try {
    await prisma.instagramContact.create({ data: { igsid } });
    return true;
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') return false;
    throw error;
  }
}

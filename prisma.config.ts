import { defineConfig } from 'prisma/config';

/*
 * Prisma 7 reads the connection URL from here rather than from the schema.
 *
 * This is the URL that `prisma db push` and `prisma studio` use. The running
 * application does not read it: the app connects through the Neon driver
 * adapter in lib/prisma.ts instead.
 *
 * The database is shared with the previous version of the site, so this schema
 * only ever adds tables prefixed `aly_`. Never run a command here that drops or
 * resets: the owner's live leads live in the same database.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});

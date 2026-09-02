-- Adds the case-study table. Additive only: it creates one new table and
-- touches nothing that already exists, so it is safe to apply to a database
-- holding live ProjectLead rows.
--
-- Written by hand rather than generated, because `prisma migrate dev` would
-- have connected to whatever DATABASE_URL is currently set to — and that is
-- the production database.

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "liveUrl" TEXT NOT NULL DEFAULT '',
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "year" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_position_idx" ON "Project"("published", "position");

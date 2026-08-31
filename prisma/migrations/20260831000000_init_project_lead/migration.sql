-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'DISCOVERY', 'PROPOSAL', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "ProjectLead" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "projectTypeOther" TEXT NOT NULL DEFAULT '',
    "goal" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "functionality" TEXT NOT NULL DEFAULT '',
    "existingUrl" TEXT NOT NULL DEFAULT '',
    "referenceLinks" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "budget" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "telegram" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "locale" TEXT NOT NULL DEFAULT 'ru',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "internalNote" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ProjectLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLead_reference_key" ON "ProjectLead"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLead_submissionId_key" ON "ProjectLead"("submissionId");

-- CreateIndex
CREATE INDEX "ProjectLead_status_createdAt_idx" ON "ProjectLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectLead_createdAt_idx" ON "ProjectLead"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectLead_email_idx" ON "ProjectLead"("email");


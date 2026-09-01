"""Adopt the schema Prisma already defines.

The database half of this migration is prisma/migrations/
20260831000000_init_project_lead/migration.sql, verbatim. The Django half is
the model state that matches it. They are separated on purpose, using
SeparateDatabaseAndState, because Django's own CREATE TABLE would be *nearly*
the same and near-identical is the worst possible outcome for two ORMs sharing
one table.

Concretely, letting Django generate the DDL would have produced:

  - no column DEFAULTs (Django applies them in Python, Prisma in the database)
  - a different spelling of the unique constraints, plus `_like` indexes
    Prisma never created
  - none of Prisma's three named indexes, because two of those names exceed
    the 30-character limit Django enforces on `Meta.indexes`

Running the real SQL removes all of that. A database created by this migration
and a database created by `prisma migrate deploy` are the same database.

Two ways to apply it, both non-destructive:

  fresh database      python manage.py migrate
  existing Prisma DB  python manage.py migrate leads 0001 --fake

The second records the migration as applied without executing any DDL, which
is the correct move when Prisma already built the table. Nothing here drops or
rewrites data in either direction.

`--fake-initial` does NOT work here, and the difference matters at deploy
time. Django's soft-apply detection scans a migration's top-level operations
for a CreateModel; wrapped in SeparateDatabaseAndState there is none to find,
so it decides the migration is unapplied, runs the SQL below, and fails with
`type "LeadStatus" already exists`. Verified against a database built from
Prisma's migration.sql alone. Use the explicit `--fake` above.

The reverse operation drops the table and the enum type. That is genuinely
reversible in the sense migrations mean it — it undoes exactly what the
forward operation created — but it is still a DROP, so it must never be run
against a database holding real leads.
"""

from __future__ import annotations

import apps.leads.fields
import apps.leads.models
from django.db import migrations, models

# Verbatim from prisma/migrations/20260831000000_init_project_lead/migration.sql
PRISMA_SCHEMA_SQL = """
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'DISCOVERY', 'PROPOSAL', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

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

CREATE UNIQUE INDEX "ProjectLead_reference_key" ON "ProjectLead"("reference");
CREATE UNIQUE INDEX "ProjectLead_submissionId_key" ON "ProjectLead"("submissionId");
CREATE INDEX "ProjectLead_status_createdAt_idx" ON "ProjectLead"("status", "createdAt");
CREATE INDEX "ProjectLead_createdAt_idx" ON "ProjectLead"("createdAt");
CREATE INDEX "ProjectLead_email_idx" ON "ProjectLead"("email");
"""

REVERSE_SQL = """
DROP TABLE IF EXISTS "ProjectLead";
DROP TYPE IF EXISTS "LeadStatus";
"""


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(sql=PRISMA_SCHEMA_SQL, reverse_sql=REVERSE_SQL),
            ],
            state_operations=[
                migrations.CreateModel(
                    name="ProjectLead",
                    fields=[
                        ("id", models.TextField(db_column="id", default=apps.leads.models.new_lead_id, editable=False, primary_key=True, serialize=False)),
                        ("reference", models.TextField(db_column="reference", unique=True)),
                        ("submission_id", models.TextField(db_column="submissionId", unique=True)),
                        ("project_type", models.TextField(db_column="projectType")),
                        ("project_type_other", models.TextField(blank=True, db_column="projectTypeOther", default="")),
                        ("goal", models.TextField(db_column="goal")),
                        ("description", models.TextField(db_column="description")),
                        ("functionality", models.TextField(blank=True, db_column="functionality", default="")),
                        ("existing_url", models.TextField(blank=True, db_column="existingUrl", default="")),
                        ("reference_links", models.TextField(blank=True, db_column="referenceLinks", default="")),
                        ("notes", models.TextField(blank=True, db_column="notes", default="")),
                        ("budget", models.TextField(db_column="budget")),
                        ("timeline", models.TextField(db_column="timeline")),
                        ("name", models.TextField(db_column="name")),
                        ("company", models.TextField(blank=True, db_column="company", default="")),
                        ("email", models.TextField(db_column="email")),
                        ("telegram", models.TextField(blank=True, db_column="telegram", default="")),
                        ("whatsapp", models.TextField(blank=True, db_column="whatsapp", default="")),
                        ("consent", models.BooleanField(db_column="consent", default=True)),
                        ("locale", models.TextField(db_column="locale", default="ru")),
                        ("started_at", apps.leads.fields.PrismaDateTimeField(db_column="startedAt")),
                        ("completed_at", apps.leads.fields.PrismaDateTimeField(db_column="completedAt")),
                        ("created_at", apps.leads.fields.PrismaDateTimeField(auto_now_add=True, db_column="createdAt")),
                        ("updated_at", apps.leads.fields.PrismaDateTimeField(auto_now=True, db_column="updatedAt")),
                        ("status", apps.leads.fields.LeadStatusField(choices=[("NEW", "New"), ("CONTACTED", "Contacted"), ("DISCOVERY", "Discovery"), ("PROPOSAL", "Proposal"), ("IN_PROGRESS", "In progress"), ("COMPLETED", "Completed"), ("DECLINED", "Declined")], db_column="status", default="NEW", max_length=32)),
                        ("internal_note", models.TextField(blank=True, db_column="internalNote", default="")),
                    ],
                    options={
                        "db_table": "ProjectLead",
                        "ordering": ["-created_at"],
                        "default_permissions": ("add", "change", "delete", "view"),
                    },
                ),
            ],
        ),
    ]

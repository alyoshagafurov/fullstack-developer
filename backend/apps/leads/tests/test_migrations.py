"""Migration integrity.

The transition plan rests on one claim: a database Django migrates and a
database Prisma migrates are the same database. If that stops being true the
dual-run phase is unsafe, so it is asserted rather than trusted.
"""

from __future__ import annotations

import re
from pathlib import Path

from django.apps import apps as global_apps
from django.db import connection
from django.db.migrations.autodetector import MigrationAutodetector
from django.db.migrations.executor import MigrationExecutor
from django.db.migrations.loader import MigrationLoader
from django.db.migrations.questioner import NonInteractiveMigrationQuestioner
from django.db.migrations.state import ProjectState
from django.test import TestCase

# backend/apps/leads/tests/ -> backend/apps/leads -> backend/apps -> backend -> repo
REPO_ROOT = Path(__file__).resolve().parents[4]
PRISMA_SQL = (REPO_ROOT / "prisma" / "migrations"
              / "20260831000000_init_project_lead" / "migration.sql")


def _normalise(sql: str) -> str:
    """Strip `--` comments and collapse whitespace.

    Prisma's file annotates each statement (`-- CreateEnum`); the copy in the
    Django migration does not. Comparing the statements themselves is the
    point, so the commentary is removed from both sides.
    """
    without_comments = re.sub(r"--[^\n]*", "", sql)
    return re.sub(r"\s+", " ", without_comments).strip()


class MigrationStateTests(TestCase):
    def test_no_model_changes_are_unmigrated(self):
        """`makemigrations --check` in test form: state must match the models."""
        loader = MigrationLoader(None, ignore_no_migrations=True)
        autodetector = MigrationAutodetector(
            loader.project_state(),
            ProjectState.from_apps(global_apps),
            NonInteractiveMigrationQuestioner(specified_apps=set(), dry_run=True),
        )
        changes = autodetector.changes(graph=loader.graph)
        self.assertNotIn("leads", changes,
                         "model and migrations have drifted apart")

    def test_initial_migration_is_reversible(self):
        """The forward operation declares a reverse; nothing is irreversible."""
        loader = MigrationLoader(connection)
        migration = loader.disk_migrations[("leads", "0001_initial")]
        separate = migration.operations[0]
        run_sql = separate.database_operations[0]
        self.assertTrue(run_sql.reversible)
        self.assertIn('DROP TABLE IF EXISTS "ProjectLead"', run_sql.reverse_sql)
        self.assertIn('DROP TYPE IF EXISTS "LeadStatus"', run_sql.reverse_sql)

    def test_roles_migration_is_reversible(self):
        loader = MigrationLoader(connection)
        migration = loader.disk_migrations[("leads", "0002_roles")]
        self.assertTrue(migration.operations[0].reversible)

    def test_nothing_is_left_unapplied(self):
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        self.assertEqual(plan, [], "unapplied migrations remain")


class PrismaParityTests(TestCase):
    """The Django-built schema against Prisma's own SQL, column by column."""

    def test_django_migration_carries_prismas_ddl_verbatim(self):
        """If Prisma's migration changes, this fails and forces a decision."""
        self.assertTrue(PRISMA_SQL.exists(), f"Prisma migration missing at {PRISMA_SQL}")

        loader = MigrationLoader(connection)
        migration = loader.disk_migrations[("leads", "0001_initial")]
        django_sql = _normalise(
            migration.operations[0].database_operations[0].sql
        )
        prisma_sql = _normalise(PRISMA_SQL.read_text())

        # Every statement Prisma issues must be present in the Django copy.
        for statement in (s.strip() for s in prisma_sql.split(";") if s.strip()):
            self.assertIn(statement, django_sql,
                          f"Prisma statement missing from migration 0001: {statement[:70]}")

    def test_every_prisma_column_exists_with_the_same_type(self):
        expected = {
            "id": "text", "reference": "text", "submissionId": "text",
            "projectType": "text", "projectTypeOther": "text", "goal": "text",
            "description": "text", "functionality": "text", "existingUrl": "text",
            "referenceLinks": "text", "notes": "text", "budget": "text",
            "timeline": "text", "name": "text", "company": "text",
            "email": "text", "telegram": "text", "whatsapp": "text",
            "consent": "boolean", "locale": "text",
            "startedAt": "timestamp(3) without time zone",
            "completedAt": "timestamp(3) without time zone",
            "createdAt": "timestamp(3) without time zone",
            "updatedAt": "timestamp(3) without time zone",
            "status": '"LeadStatus"', "internalNote": "text",
        }
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT a.attname, format_type(a.atttypid, a.atttypmod)
                FROM pg_attribute a
                JOIN pg_class c ON c.oid = a.attrelid
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relname = 'ProjectLead' AND n.nspname = 'public'
                  AND a.attnum > 0 AND NOT a.attisdropped
            """)
            actual = dict(cursor.fetchall())

        self.assertEqual(actual, expected)

    def test_enum_has_exactly_prisma_labels_in_order(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT e.enumlabel
                FROM pg_enum e
                JOIN pg_type t ON t.oid = e.enumtypid
                WHERE t.typname = 'LeadStatus'
                ORDER BY e.enumsortorder
            """)
            labels = [row[0] for row in cursor.fetchall()]
        self.assertEqual(labels, ["NEW", "CONTACTED", "DISCOVERY", "PROPOSAL",
                                  "IN_PROGRESS", "COMPLETED", "DECLINED"])

    def test_column_defaults_match_prisma(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT a.attname, pg_get_expr(d.adbin, d.adrelid)
                FROM pg_attribute a
                JOIN pg_class c ON c.oid = a.attrelid
                JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
                WHERE c.relname = 'ProjectLead' AND a.attnum > 0
            """)
            defaults = dict(cursor.fetchall())

        self.assertEqual(defaults.get("consent"), "true")
        self.assertEqual(defaults.get("locale"), "'ru'::text")
        self.assertEqual(defaults.get("status"), "'NEW'::\"LeadStatus\"")
        self.assertEqual(defaults.get("internalNote"), "''::text")
        self.assertEqual(defaults.get("createdAt"), "CURRENT_TIMESTAMP")

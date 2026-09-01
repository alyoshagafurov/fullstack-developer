"""Model-level guarantees.

These cover the things the schema itself is responsible for — the constraints
that make the API's idempotency safe, and the type mapping onto a table Prisma
defined.
"""

from __future__ import annotations

import re
from datetime import timezone as dt_timezone

from django.db import IntegrityError, connection, transaction
from django.test import TestCase
from django.utils import timezone

from apps.leads.models import LeadStatus, ProjectLead
from apps.leads.reference import make_reference

from .factories import make_lead


class ProjectLeadCreationTests(TestCase):
    def test_creates_with_defaults(self):
        lead = make_lead()
        self.assertEqual(lead.status, LeadStatus.NEW)
        self.assertEqual(lead.locale, "ru")
        self.assertTrue(lead.consent)
        self.assertEqual(lead.project_type_other, "")
        self.assertTrue(lead.id)

    def test_required_columns_reject_null(self):
        """NOT NULL is real, and it is the database enforcing it.

        Worth stating precisely, because the ORM hides it: omitting `goal` in
        `objects.create()` does NOT raise — Django substitutes '' for a text
        field with no default, and '' satisfies NOT NULL. Emptiness is caught
        by the API's validation layer, which is covered in test_public_api.
        What the schema itself guarantees is only that the column can never
        hold NULL, so that is what is asserted here, through raw SQL that
        bypasses the ORM's substitution.
        """
        with self.assertRaises(IntegrityError), transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO "ProjectLead" '
                    '("id", "reference", "submissionId", "projectType", "goal",'
                    ' "description", "budget", "timeline", "name", "email",'
                    ' "startedAt", "completedAt", "updatedAt")'
                    " VALUES (%s, %s, %s, %s, NULL, %s, %s, %s, %s, %s,"
                    " NOW(), NOW(), NOW())",
                    ["raw-null-test", "ALY-2026-NOGOA", "missing-goal",
                     "website", "описание достаточной длины", "r1k_2k5",
                     "m1_2", "Клиент", "qa@example.com"],
                )

    def test_orm_substitutes_empty_string_for_an_omitted_text_field(self):
        """The counterpart to the test above — documented, not accidental."""
        lead = ProjectLead.objects.create(
            reference="ALY-2026-EMPTY",
            submission_id="omitted-goal",
            project_type="website",
            description="описание достаточной длины для проверки",
            budget="r1k_2k5",
            timeline="m1_2",
            name="Клиент",
            email="qa@example.com",
            started_at=timezone.now(),
            completed_at=timezone.now(),
        )
        self.assertEqual(lead.goal, "")

    def test_str_exposes_only_the_reference(self):
        lead = make_lead()
        rendered = str(lead)
        self.assertEqual(rendered, lead.reference)
        self.assertNotIn(lead.email, rendered)
        self.assertNotIn(lead.name, rendered)


class UniquenessTests(TestCase):
    def test_reference_is_unique(self):
        make_lead(reference="ALY-2026-DUPES", submission_id="one")
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_lead(reference="ALY-2026-DUPES", submission_id="two")

    def test_submission_id_is_unique(self):
        """The constraint the whole idempotency strategy rests on."""
        make_lead(reference="ALY-2026-AAAAA", submission_id="same-key")
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_lead(reference="ALY-2026-BBBBB", submission_id="same-key")

    def test_unique_indexes_exist_under_prisma_names(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT indexname FROM pg_indexes WHERE tablename = 'ProjectLead'"
            )
            names = {row[0] for row in cursor.fetchall()}
        self.assertIn("ProjectLead_reference_key", names)
        self.assertIn("ProjectLead_submissionId_key", names)
        self.assertIn("ProjectLead_status_createdAt_idx", names)
        self.assertIn("ProjectLead_createdAt_idx", names)
        self.assertIn("ProjectLead_email_idx", names)


class ReferenceTests(TestCase):
    PATTERN = re.compile(r"^ALY-\d{4}-[A-Z0-9]{5}$")

    def test_matches_the_pattern_the_client_validates(self):
        for _ in range(200):
            self.assertRegex(make_reference(), self.PATTERN)

    def test_alphabet_excludes_confusable_characters(self):
        tails = {make_reference().split("-")[2] for _ in range(400)}
        joined = "".join(tails)
        for confusable in ("I", "O", "0", "1"):
            self.assertNotIn(confusable, joined)


class SchemaMappingTests(TestCase):
    """The mapping onto Prisma's table, verified against the database."""

    def test_status_is_a_postgres_enum_not_a_varchar(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT format_type(a.atttypid, a.atttypmod)
                FROM pg_attribute a
                JOIN pg_class c ON c.oid = a.attrelid
                WHERE c.relname = 'ProjectLead' AND a.attname = 'status'
            """)
            self.assertEqual(cursor.fetchone()[0], '"LeadStatus"')

    def test_timestamps_are_prisma_shaped(self):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT a.attname, format_type(a.atttypid, a.atttypmod)
                FROM pg_attribute a
                JOIN pg_class c ON c.oid = a.attrelid
                WHERE c.relname = 'ProjectLead'
                  AND a.attname IN ('startedAt', 'completedAt', 'createdAt', 'updatedAt')
            """)
            types = dict(cursor.fetchall())
        self.assertEqual(len(types), 4)
        for column, column_type in types.items():
            self.assertEqual(column_type, "timestamp(3) without time zone",
                             f"{column} drifted from Prisma's type")

    def test_naive_column_round_trips_as_aware_utc(self):
        """A timestamp written aware must come back aware and unchanged."""
        moment = timezone.now().replace(microsecond=0)
        lead = make_lead(started_at=moment, completed_at=moment)
        reloaded = ProjectLead.objects.get(pk=lead.pk)
        self.assertIsNotNone(reloaded.started_at.tzinfo)
        self.assertEqual(reloaded.started_at.astimezone(dt_timezone.utc),
                         moment.astimezone(dt_timezone.utc))

    def test_status_can_be_filtered_and_updated(self):
        """Proves the enum cast works for both reads and writes."""
        lead = make_lead()
        self.assertEqual(ProjectLead.objects.filter(status=LeadStatus.NEW).count(), 1)
        lead.status = LeadStatus.CONTACTED
        lead.save(update_fields=["status"])
        self.assertEqual(ProjectLead.objects.filter(status=LeadStatus.CONTACTED).count(), 1)
        self.assertEqual(ProjectLead.objects.filter(status=LeadStatus.NEW).count(), 0)

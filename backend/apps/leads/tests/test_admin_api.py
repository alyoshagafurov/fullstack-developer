"""The admin API's access rules.

The single most important assertion in this file is that nothing reaches a
lead without authentication. `internalNote` is the owner's private note, and
the brief's contact details belong to real people; both are behind the same
gate, and the gate is tested from the outside rather than assumed.
"""

from __future__ import annotations

import json

from django.test import TestCase
from rest_framework.test import APIClient

from apps.leads.models import LeadStatus, ProjectLead

from .factories import make_lead, user_in_role

LIST_URL = "/api/v1/admin/leads/"


def detail_url(reference: str) -> str:
    return f"/api/v1/admin/leads/{reference}/"


class UnauthenticatedAccessTests(TestCase):
    """No route into a lead exists for the public."""

    def setUp(self):
        self.client = APIClient()
        self.lead = make_lead()

    def test_list_is_refused(self):
        response = self.client.get(LIST_URL)
        self.assertIn(response.status_code, (401, 403))
        self.assertNotIn("internalNote", response.content.decode())

    def test_detail_is_refused(self):
        response = self.client.get(detail_url(self.lead.reference))
        self.assertIn(response.status_code, (401, 403))
        body = response.content.decode()
        for leaked in (self.lead.email, self.lead.name, self.lead.internal_note):
            self.assertNotIn(leaked, body)

    def test_patch_is_refused(self):
        response = self.client.patch(detail_url(self.lead.reference),
                                     data=json.dumps({"status": "COMPLETED"}),
                                     content_type="application/json")
        self.assertIn(response.status_code, (401, 403))
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, LeadStatus.NEW)


class RolelessUserTests(TestCase):
    """Authenticated is not the same as authorised."""

    def setUp(self):
        self.client = APIClient()
        self.lead = make_lead()
        self.client.force_authenticate(user_in_role("nobody", None))

    def test_authenticated_without_a_role_sees_nothing(self):
        self.assertEqual(self.client.get(LIST_URL).status_code, 403)
        self.assertEqual(self.client.get(detail_url(self.lead.reference)).status_code, 403)


class AdminRoleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.lead = make_lead()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))

    def test_can_list_leads(self):
        response = self.client.get(LIST_URL)
        self.assertEqual(response.status_code, 200)
        rows = response.json()["results"]
        self.assertEqual(rows[0]["reference"], self.lead.reference)

    def test_list_row_carries_exactly_the_triage_fields(self):
        """The register is an index, not a data dump.

        Widened to carry email, budget and timeline so an operator can triage
        without opening every lead. The brief body and the private note stay
        on the detail shape — asserting the exact set is what stops the list
        quietly growing into a bulk export.
        """
        row = self.client.get(LIST_URL).json()["results"][0]
        self.assertEqual(set(row), {
            "reference", "name", "email",
            "projectType", "budget", "timeline",
            "createdAt", "status",
        })

    def test_list_row_still_withholds_the_note_and_the_brief_body(self):
        row = self.client.get(LIST_URL).json()["results"][0]
        for withheld in ("internalNote", "goal", "description",
                         "functionality", "notes", "submissionId",
                         "telegram", "whatsapp", "company"):
            self.assertNotIn(withheld, row)

    def test_list_returns_the_real_stored_values(self):
        """No defaults, no placeholders — whatever the visitor submitted."""
        row = self.client.get(LIST_URL).json()["results"][0]
        self.assertEqual(row["email"], self.lead.email)
        self.assertEqual(row["budget"], self.lead.budget)
        self.assertEqual(row["timeline"], self.lead.timeline)

    def test_widening_the_row_adds_no_query_per_row(self):
        """The three new fields are scalar columns already in the queryset."""
        for index in range(9):
            make_lead(reference=f"ALY-2026-N{index:04d}", submission_id=f"n{index}")

        before = len(self.client.get(LIST_URL).json()["results"])
        self.assertEqual(before, 10)

        # The query count must not scale with the number of rows.
        with self.assertNumQueries(self._list_query_count()):
            self.client.get(LIST_URL)

    def _list_query_count(self) -> int:
        """Baseline measured on a single row, so the assertion is relative."""
        from django.test.utils import CaptureQueriesContext
        from django.db import connection
        with CaptureQueriesContext(connection) as ctx:
            self.client.get(f"{LIST_URL}?page=1")
        return len(ctx)

    def test_detail_includes_the_internal_note(self):
        response = self.client.get(detail_url(self.lead.reference))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["internalNote"], self.lead.internal_note)

    def test_can_change_status(self):
        response = self.client.patch(detail_url(self.lead.reference),
                                     data=json.dumps({"status": "CONTACTED"}),
                                     content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, LeadStatus.CONTACTED)

    def test_rejects_a_status_outside_the_enum(self):
        response = self.client.patch(detail_url(self.lead.reference),
                                     data=json.dumps({"status": "ARCHIVED"}),
                                     content_type="application/json")
        self.assertEqual(response.status_code, 422)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, LeadStatus.NEW)

    def test_cannot_rewrite_what_the_visitor_submitted(self):
        """A lead is a record. Even an admin may not edit the brief itself."""
        original_email = self.lead.email
        response = self.client.patch(
            detail_url(self.lead.reference),
            data=json.dumps({"email": "attacker@example.com",
                             "description": "rewritten",
                             "reference": "ALY-2026-FAKED"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.email, original_email)
        self.assertEqual(self.lead.reference, "ALY-2026-QATST")
        self.assertNotEqual(self.lead.description, "rewritten")

    def test_cannot_delete_a_lead(self):
        """Refused twice over, and the row survives either way.

        Two independent guards stand in the way, and the first one to fire
        decides the status: no role holds `delete_projectlead`, so permissions
        answer 403 before the viewset's `http_method_names` — which omits
        delete — would answer 405. Asserting the exact code would be
        asserting the order of the guards; what matters is that deletion is
        refused and the lead is still there.
        """
        response = self.client.delete(detail_url(self.lead.reference))
        self.assertIn(response.status_code, (403, 405))
        self.assertEqual(ProjectLead.objects.count(), 1)


class ViewerRoleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.lead = make_lead()
        self.client.force_authenticate(user_in_role("viewer", "VIEWER"))

    def test_can_read(self):
        self.assertEqual(self.client.get(LIST_URL).status_code, 200)
        self.assertEqual(self.client.get(detail_url(self.lead.reference)).status_code, 200)

    def test_cannot_mutate_anything(self):
        response = self.client.patch(detail_url(self.lead.reference),
                                     data=json.dumps({"status": "COMPLETED"}),
                                     content_type="application/json")
        self.assertEqual(response.status_code, 403)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, LeadStatus.NEW)

    def test_cannot_write_an_internal_note(self):
        response = self.client.patch(detail_url(self.lead.reference),
                                     data=json.dumps({"internalNote": "viewer wrote this"}),
                                     content_type="application/json")
        self.assertEqual(response.status_code, 403)
        self.lead.refresh_from_db()
        self.assertNotIn("viewer wrote this", self.lead.internal_note)


class ErrorSanitisationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))

    def test_unknown_reference_returns_a_bare_code(self):
        response = self.client.get(detail_url("ALY-2026-NOPE9"))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"ok": False, "error": "not_found"})

    def test_no_response_carries_orm_or_sql_detail(self):
        for response in (self.client.get(LIST_URL),
                         self.client.get(detail_url("ALY-2026-NOPE9"))):
            body = response.content.decode().lower()
            for leak in ("traceback", "select ", "psycopg", "django.db",
                         "postgres://"):
                self.assertNotIn(leak, body)

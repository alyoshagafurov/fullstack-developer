"""Querying the register: the summary, the filters, the sort.

These back the admin UI's dashboard and list screens. The sort test matters
most: `ordering` is caller-supplied, and an unguarded `order_by` would let
someone sort the register by `internalNote` — a slow but perfectly real way
to read a private field one comparison at a time.
"""

from __future__ import annotations

import json

from django.test import TestCase
from rest_framework.test import APIClient

from apps.leads.models import LeadStatus

from .factories import make_lead, user_in_role

LIST_URL = "/api/v1/admin/leads/"
SUMMARY_URL = "/api/v1/admin/leads/summary/"


class SummaryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_lead(reference="ALY-2026-AAAAA", submission_id="s1")
        make_lead(reference="ALY-2026-BBBBB", submission_id="s2",
                  status=LeadStatus.CONTACTED)
        make_lead(reference="ALY-2026-CCCCC", submission_id="s3",
                  status=LeadStatus.CONTACTED)

    def test_requires_authentication(self):
        self.assertIn(self.client.get(SUMMARY_URL).status_code, (401, 403))

    def test_counts_every_stage_including_the_empty_ones(self):
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        body = self.client.get(SUMMARY_URL).json()

        self.assertEqual(body["total"], 3)
        self.assertEqual(body["byStatus"]["NEW"], 1)
        self.assertEqual(body["byStatus"]["CONTACTED"], 2)
        # A stage at zero must still be present, or the dashboard's shape
        # would change from day to day.
        self.assertEqual(body["byStatus"]["DECLINED"], 0)
        self.assertEqual(set(body["byStatus"]), set(LeadStatus.values))

    def test_carries_no_brief_content(self):
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        body = self.client.get(SUMMARY_URL).content.decode()
        for leaked in ("qa@example.com", "ALY-2026-AAAAA",
                       "internalNote", "приватная заметка"):
            self.assertNotIn(leaked, body)

    def test_viewer_may_read_it(self):
        self.client.force_authenticate(user_in_role("reader", "VIEWER"))
        self.assertEqual(self.client.get(SUMMARY_URL).status_code, 200)


class FilterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        make_lead(reference="ALY-2026-AAAAA", submission_id="s1",
                  name="Анна Петрова", email="anna@example.com")
        make_lead(reference="ALY-2026-BBBBB", submission_id="s2",
                  name="Борис Иванов", email="boris@example.com",
                  status=LeadStatus.PROPOSAL, project_type="saas")

    def refs(self, query=""):
        body = self.client.get(f"{LIST_URL}{query}").json()
        return [row["reference"] for row in body["results"]]

    def test_filters_by_status(self):
        self.assertEqual(self.refs("?status=PROPOSAL"), ["ALY-2026-BBBBB"])

    def test_ignores_a_status_outside_the_enum(self):
        """An unknown status must not silently return everything as a filter."""
        self.assertEqual(len(self.refs("?status=ARCHIVED")), 2)

    def test_filters_by_project_type(self):
        self.assertEqual(self.refs("?projectType=saas"), ["ALY-2026-BBBBB"])

    def test_searches_reference_name_and_email(self):
        self.assertEqual(self.refs("?q=BBBBB"), ["ALY-2026-BBBBB"])
        self.assertEqual(self.refs("?q=Анна"), ["ALY-2026-AAAAA"])
        self.assertEqual(self.refs("?q=boris@example.com"), ["ALY-2026-BBBBB"])

    def test_search_does_not_reach_into_the_brief_body(self):
        """Searching is for finding a client, not for trawling descriptions."""
        make_lead(reference="ALY-2026-DDDDD", submission_id="s3",
                  description="Совершенно уникальное слово ксилофон в описании")
        self.assertEqual(self.refs("?q=ксилофон"), [])

    def test_search_never_matches_the_internal_note(self):
        make_lead(reference="ALY-2026-EEEEE", submission_id="s4",
                  internal_note="секретная пометка владельца")
        self.assertEqual(self.refs("?q=секретная"), [])


class OrderingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        make_lead(reference="ALY-2026-AAAAA", submission_id="s1", name="Анна")
        make_lead(reference="ALY-2026-BBBBB", submission_id="s2", name="Борис")

    def refs(self, ordering):
        body = self.client.get(f"{LIST_URL}?ordering={ordering}").json()
        return [row["reference"] for row in body["results"]]

    def test_sorts_ascending_and_descending(self):
        self.assertEqual(self.refs("reference"), ["ALY-2026-AAAAA", "ALY-2026-BBBBB"])
        self.assertEqual(self.refs("-reference"), ["ALY-2026-BBBBB", "ALY-2026-AAAAA"])

    def test_sorts_by_name(self):
        self.assertEqual(self.refs("name"), ["ALY-2026-AAAAA", "ALY-2026-BBBBB"])

    def test_rejects_a_column_outside_the_allow_list(self):
        """`internalNote` is not sortable, and neither is anything else."""
        default = self.refs("")
        for attempt in ("internalNote", "internal_note", "-internal_note",
                        "email", "password", "id"):
            self.assertEqual(self.refs(attempt), default,
                             f"ordering={attempt} changed the result order")


class PaginationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        for index in range(30):
            make_lead(reference=f"ALY-2026-P{index:04d}", submission_id=f"p{index}")

    def test_page_size_is_twenty_five(self):
        body = self.client.get(LIST_URL).json()
        self.assertEqual(body["count"], 30)
        self.assertEqual(len(body["results"]), 25)
        self.assertIsNotNone(body["next"])

    def test_second_page_holds_the_remainder(self):
        body = self.client.get(f"{LIST_URL}?page=2").json()
        self.assertEqual(len(body["results"]), 5)

    def test_no_page_of_the_register_carries_an_internal_note(self):
        for page in ("", "?page=2"):
            body = self.client.get(f"{LIST_URL}{page}").content.decode()
            self.assertNotIn("internalNote", body)
            self.assertNotIn("приватная заметка", body)


class MutationScopeTests(TestCase):
    """What an ADMIN may and may not change, asserted through the API."""

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        self.lead = make_lead(reference="ALY-2026-MUTAT", submission_id="m1")

    def patch(self, payload):
        return self.client.patch(f"{LIST_URL}{self.lead.reference}/",
                                 data=json.dumps(payload),
                                 content_type="application/json")

    def test_status_and_note_are_writable(self):
        response = self.patch({"status": "PROPOSAL", "internalNote": "смета отправлена"})
        self.assertEqual(response.status_code, 200)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, LeadStatus.PROPOSAL)
        self.assertEqual(self.lead.internal_note, "смета отправлена")

    def test_the_brief_itself_is_not(self):
        original = (self.lead.email, self.lead.reference, self.lead.goal,
                    self.lead.submission_id)
        self.patch({
            "email": "attacker@evil.test", "reference": "ALY-2026-FAKED",
            "goal": "переписано", "submissionId": "hijacked",
            "createdAt": "2000-01-01T00:00:00Z",
        })
        self.lead.refresh_from_db()
        self.assertEqual(
            (self.lead.email, self.lead.reference, self.lead.goal,
             self.lead.submission_id),
            original,
        )

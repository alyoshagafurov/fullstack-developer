"""Production posture: the read-only gate, the probes, the logs, the DSN.

These are the pieces that only matter once the service is deployed, which is
exactly why they need tests — none of them is exercised by using the admin UI
locally, so a regression in any of them would first be noticed in production.
"""

from __future__ import annotations

import json
import logging

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from config.settings.base import database_from_url

from .factories import make_lead, user_in_role

LIST_URL = "/api/v1/admin/leads/"


@override_settings(LEADS_WRITE_ENABLED=False)
class ReadOnlyPhaseTests(TestCase):
    """Prisma owns writes. Django must refuse them, for every role.

    Not a permission problem and not a UI decision: an ADMIN genuinely holds
    `change_projectlead`, and the request is still refused, because two
    uncoordinated writers against one table is how a lead quietly loses its
    status.
    """

    def setUp(self):
        self.client = APIClient()
        self.lead = make_lead(reference="ALY-2026-RONLY", submission_id="ro1")
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))

    def patch(self, payload):
        return self.client.patch(f"{LIST_URL}{self.lead.reference}/",
                                 data=json.dumps(payload),
                                 content_type="application/json")

    def test_admin_cannot_change_status(self):
        response = self.patch({"status": "CONTACTED"})
        self.assertEqual(response.status_code, 403)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, "NEW")

    def test_admin_cannot_write_an_internal_note(self):
        response = self.patch({"internalNote": "не должно записаться"})
        self.assertEqual(response.status_code, 403)
        self.lead.refresh_from_db()
        self.assertNotIn("не должно записаться", self.lead.internal_note)

    def test_the_refusal_says_which_kind_it_is(self):
        """"Not yet" must be distinguishable from "not you"."""
        self.assertEqual(self.patch({"status": "CONTACTED"}).json(),
                         {"ok": False, "error": "read_only_phase"})

    def test_reads_are_untouched(self):
        """The whole point of the phase: Django still serves the register."""
        self.assertEqual(self.client.get(LIST_URL).status_code, 200)
        self.assertEqual(
            self.client.get(f"{LIST_URL}{self.lead.reference}/").status_code, 200)
        self.assertEqual(self.client.get(f"{LIST_URL}summary/").status_code, 200)

    def test_filters_and_sorting_still_work(self):
        self.assertEqual(self.client.get(f"{LIST_URL}?status=NEW").status_code, 200)
        self.assertEqual(
            self.client.get(f"{LIST_URL}?ordering=-createdAt").status_code, 200)

    def test_creation_and_deletion_remain_unavailable(self):
        self.assertIn(self.client.post(LIST_URL, data="{}",
                                       content_type="application/json").status_code,
                      (403, 405))
        self.assertIn(
            self.client.delete(f"{LIST_URL}{self.lead.reference}/").status_code,
            (403, 405))


class WriteGateDefaultTests(TestCase):
    """The gate must fail closed if a settings module forgets to mention it."""

    def test_base_settings_default_to_read_only(self):
        from config.settings import base
        self.assertIs(base.LEADS_WRITE_ENABLED, False)

    def test_production_requires_an_explicit_opt_in(self):
        """Reading the source, because importing production.py needs secrets."""
        from pathlib import Path
        source = (Path(__file__).resolve().parents[3]
                  / "config" / "settings" / "production.py").read_text()
        self.assertIn('LEADS_WRITE_ENABLED = os.environ.get("LEADS_WRITE_ENABLED"',
                      source)


class HealthEndpointTests(TestCase):
    def test_liveness_is_public_and_says_only_that_it_is_alive(self):
        response = self.client.get("/health/live")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_readiness_reports_the_database(self):
        response = self.client.get("/health/ready")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_probes_reveal_nothing_about_the_deployment(self):
        """They are unauthenticated, so their bodies are a public surface."""
        for path in ("/health/live", "/health/ready"):
            body = self.client.get(path).content.decode().lower()
            for leak in ("postgres", "secret", "django", "version", "host",
                         "settings", "traceback", "select"):
                self.assertNotIn(leak, body, f"{path} leaked {leak!r}")

    def test_liveness_does_not_touch_the_database(self):
        """A database blip must not make the platform restart a healthy app."""
        with self.assertNumQueries(0):
            self.client.get("/health/live")


class RequestLogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user_in_role("owner", "ADMIN"))
        make_lead(reference="ALY-2026-LOGGD", submission_id="lg1",
                  email="private@example.com", internal_note="приватная заметка")

    def test_the_search_term_never_reaches_the_log(self):
        """Operators search by client email; the log must not collect them."""
        with self.assertLogs("apps.observability", level="INFO") as captured:
            # A 404 guarantees a log line — successful reads are not logged.
            self.client.get(f"{LIST_URL}ALY-2026-NOPE9/?q=private@example.com")
        joined = "\n".join(captured.output)
        self.assertNotIn("private@example.com", joined)
        self.assertNotIn("?q=", joined)
        self.assertIn("/api/v1/admin/leads/ALY-2026-NOPE9/", joined)

    def test_lead_content_never_reaches_the_log(self):
        with self.assertLogs("apps.observability", level="INFO") as captured:
            self.client.get(f"{LIST_URL}ALY-2026-NOPE9/")
        joined = "\n".join(captured.output)
        for secret in ("приватная заметка", "private@example.com", "Тестовый Клиент"):
            self.assertNotIn(secret, joined)

    def test_successful_reads_are_not_logged(self):
        """Otherwise the one 500 that matters is buried in a wall of 200s."""
        logger = logging.getLogger("apps.observability")
        with self.assertNoLogs(logger, level="WARNING"):
            self.assertEqual(self.client.get(LIST_URL).status_code, 200)

    def test_every_response_carries_a_request_id(self):
        response = self.client.get(LIST_URL)
        self.assertTrue(response.headers.get("X-Request-Id"))

    def test_an_upstream_request_id_is_honoured(self):
        """So one request can be followed from Vercel through to Django."""
        response = self.client.get(LIST_URL, HTTP_X_REQUEST_ID="from-vercel-123")
        self.assertEqual(response.headers["X-Request-Id"], "from-vercel-123")


class DatabaseUrlTests(TestCase):
    """The DSN parser, which decides whether production talks over TLS."""

    def test_parses_the_basics(self):
        config = database_from_url("postgres://user:pw@db.example.net:5432/leads")
        self.assertEqual(config["NAME"], "leads")
        self.assertEqual(config["USER"], "user")
        self.assertEqual(config["HOST"], "db.example.net")
        self.assertEqual(config["PORT"], "5432")

    def test_honours_sslmode(self):
        """Dropping it would silently downgrade production to plaintext."""
        config = database_from_url(
            "postgres://user:pw@db.example.net/leads?sslmode=require")
        self.assertEqual(config["OPTIONS"]["sslmode"], "require")

    def test_sets_a_connect_timeout_by_default(self):
        config = database_from_url("postgres://user:pw@db.example.net/leads")
        self.assertEqual(config["OPTIONS"]["connect_timeout"], 10)

    def test_connect_timeout_is_overridable(self):
        config = database_from_url(
            "postgres://user:pw@db.example.net/leads?connect_timeout=3")
        self.assertEqual(config["OPTIONS"]["connect_timeout"], 3)

    def test_enables_connection_health_checks(self):
        """A pooled connection the server closed must not fail the next read."""
        config = database_from_url("postgres://user:pw@db.example.net/leads")
        self.assertIs(config["CONN_HEALTH_CHECKS"], True)

    def test_percent_encoded_password_is_decoded(self):
        config = database_from_url("postgres://user:p%40ss%2Fword@h/leads")
        self.assertEqual(config["PASSWORD"], "p@ss/word")

    def test_rejects_a_non_postgres_scheme(self):
        for bad in ("mysql://u:p@h/db", "http://example.com/db", "not-a-url"):
            with self.assertRaises(ValueError):
                database_from_url(bad)

    def test_rejects_a_url_without_a_database_name(self):
        with self.assertRaises(ValueError):
            database_from_url("postgres://user:pw@db.example.net/")

    def test_the_error_never_quotes_the_url(self):
        """A DSN in a crash log is a credential in a crash log."""
        secret = "postgres://user:sup3rs3cret@db.example.net/"
        with self.assertRaises(ValueError) as caught:
            database_from_url(secret)
        self.assertNotIn("sup3rs3cret", str(caught.exception))

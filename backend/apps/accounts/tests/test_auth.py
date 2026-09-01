"""Authentication behaviour.

The admin UI is only as protected as this endpoint, so the failure modes are
tested as carefully as the success one.
"""

from __future__ import annotations

import json

from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.leads.tests.factories import user_in_role

LOGIN = "/api/v1/auth/login"
ME = "/api/v1/auth/me"
LOGOUT = "/api/v1/auth/logout"
PASSWORD = "test-pass-phrase-12"


class LoginTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.admin = user_in_role("owner", "ADMIN")

    def post(self, **body):
        return self.client.post(LOGIN, data=json.dumps(body),
                                content_type="application/json")

    def test_valid_credentials_establish_a_session(self):
        response = self.post(username="owner", password=PASSWORD)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(response.json()["user"]["role"], "ADMIN")
        self.assertEqual(self.client.get(ME).status_code, 200)

    def test_reports_the_permissions_the_role_actually_holds(self):
        body = self.post(username="owner", password=PASSWORD).json()
        perms = body["user"]["permissions"]
        self.assertTrue(perms["viewLeads"])
        self.assertTrue(perms["changeLeads"])
        self.assertFalse(perms["deleteLeads"], "no role may delete a lead")

    def test_viewer_is_reported_as_read_only(self):
        user_in_role("reader", "VIEWER")
        body = self.post(username="reader", password=PASSWORD).json()
        self.assertEqual(body["user"]["role"], "VIEWER")
        self.assertTrue(body["user"]["permissions"]["viewLeads"])
        self.assertFalse(body["user"]["permissions"]["changeLeads"])

    def test_wrong_password_is_refused(self):
        response = self.post(username="owner", password="not-the-password")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), {"ok": False, "error": "invalid_credentials"})

    def test_unknown_user_is_indistinguishable_from_a_wrong_password(self):
        """No account enumeration: both answers are byte-identical."""
        unknown = self.post(username="nobody-here", password=PASSWORD)
        wrong = self.post(username="owner", password="not-the-password")
        self.assertEqual(unknown.status_code, wrong.status_code)
        self.assertEqual(unknown.json(), wrong.json())

    def test_response_never_echoes_the_password(self):
        secret = "a-very-distinctive-password-42"
        body = self.post(username="owner", password=secret).content.decode()
        self.assertNotIn(secret, body)
        self.assertNotIn("password", body)

    def test_inactive_account_cannot_sign_in(self):
        self.admin.is_active = False
        self.admin.save(update_fields=["is_active"])
        self.assertEqual(self.post(username="owner", password=PASSWORD).status_code, 401)


class SessionTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        user_in_role("owner", "ADMIN")

    def test_me_requires_a_session(self):
        self.assertIn(self.client.get(ME).status_code, (401, 403))

    def test_logout_ends_the_session(self):
        self.client.post(LOGIN, data=json.dumps({"username": "owner",
                                                 "password": PASSWORD}),
                         content_type="application/json")
        self.assertEqual(self.client.get(ME).status_code, 200)

        self.assertEqual(self.client.post(LOGOUT).status_code, 200)
        self.assertIn(self.client.get(ME).status_code, (401, 403))

    def test_logout_requires_a_session(self):
        self.assertIn(self.client.post(LOGOUT).status_code, (401, 403))


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                        "LOCATION": "login-throttle-test"}},
)
class LoginThrottleTests(TestCase):
    """Password guessing must become pointless, not merely slow."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        user_in_role("owner", "ADMIN")

    def test_repeated_failures_are_throttled(self):
        statuses = []
        for _ in range(11):
            response = self.client.post(
                LOGIN,
                data=json.dumps({"username": "owner", "password": "wrong"}),
                content_type="application/json",
                HTTP_X_FORWARDED_FOR="198.51.100.7",
            )
            statuses.append(response.status_code)

        self.assertEqual(statuses[:10], [401] * 10)
        self.assertEqual(statuses[10], 429)

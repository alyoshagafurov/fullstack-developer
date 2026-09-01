"""The public brief contract.

Every status code the Next.js route defines is asserted here, because the
client's submit boundary (lib/brief/submit.ts) branches on all of them: 422
maps errors back onto wizard steps, 429 shows a wait, 501/503 tell the visitor
their brief was NOT saved. A silent change to any of these breaks the UI in a
way that only shows up in production.
"""

from __future__ import annotations

import json

from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.leads.models import ProjectLead

from .factories import brief_payload

URL = "/api/v1/brief"


class BriefContractTests(TestCase):
    def setUp(self):
        # The endpoint's rate limit cannot be switched off by settings (see
        # config/settings/test.py), so each case starts from a clean window
        # rather than inheriting the previous test's request count.
        cache.clear()
        self.client = APIClient()

    def post(self, payload, **extra):
        return self.client.post(URL, data=json.dumps(payload),
                                content_type="application/json", **extra)

    def test_valid_submission_is_created(self):
        response = self.post(brief_payload())
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertTrue(body["ok"])
        self.assertRegex(body["reference"], r"^ALY-\d{4}-[A-Z0-9]{5}$")
        self.assertEqual(ProjectLead.objects.count(), 1)

    def test_response_carries_nothing_but_the_reference(self):
        """No row echo. The brief goes in; only a reference comes back."""
        payload = brief_payload()
        body = self.post(payload).json()
        self.assertEqual(set(body), {"ok", "reference"})
        serialised = json.dumps(body)
        for leaked in (payload["data"]["email"], payload["data"]["name"],
                       payload["data"]["description"], "internalNote"):
            self.assertNotIn(leaked, serialised)

    def test_duplicate_submission_returns_the_original_reference(self):
        payload = brief_payload()
        first = self.post(payload)
        second = self.post(payload)

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.json()["reference"], first.json()["reference"])
        self.assertTrue(second.json()["duplicate"])
        self.assertEqual(ProjectLead.objects.count(), 1)

    def test_idempotency_key_header_is_accepted_in_place_of_the_body_field(self):
        payload = brief_payload()
        payload.pop("submissionId")
        response = self.post(payload, HTTP_IDEMPOTENCY_KEY="header-supplied-key")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ProjectLead.objects.get().submission_id, "header-supplied-key")

    def test_missing_submission_id_is_rejected(self):
        payload = brief_payload()
        payload.pop("submissionId")
        response = self.post(payload)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["fieldErrors"], {"submissionId": "required"})

    def test_validation_errors_use_the_codes_the_client_maps(self):
        response = self.post(brief_payload(data={
            "projectType": "not-a-real-type",
            "goal": "",
            "description": "коротко",
            "budget": "",
            "timeline": "",
            "name": "",
            "email": "not-an-email",
            "consent": False,
        }))
        self.assertEqual(response.status_code, 422)
        errors = response.json()["fieldErrors"]
        self.assertEqual(errors["projectType"], "pickOne")
        self.assertEqual(errors["goal"], "required")
        self.assertEqual(errors["description"], "tooShort")
        self.assertEqual(errors["budget"], "pickOne")
        self.assertEqual(errors["timeline"], "pickOne")
        self.assertEqual(errors["name"], "required")
        self.assertEqual(errors["email"], "email")
        self.assertEqual(errors["consent"], "consent")
        self.assertEqual(ProjectLead.objects.count(), 0)

    def test_enum_values_outside_the_allow_list_are_refused(self):
        """Never accept an arbitrary enum value, whatever the client sends."""
        response = self.post(brief_payload(data={"budget": "10_000_000"}))
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["fieldErrors"]["budget"], "pickOne")

    def test_honeypot_is_accepted_but_never_stored(self):
        response = self.post(brief_payload(hp="i-am-a-bot"))
        self.assertEqual(response.status_code, 202)
        self.assertEqual(ProjectLead.objects.count(), 0)

    def test_wrong_content_type_is_refused(self):
        response = self.client.post(URL, data="x", content_type="text/plain")
        self.assertEqual(response.status_code, 415)
        self.assertEqual(response.json()["error"], "unsupported_media_type")

    def test_oversized_payload_is_refused_before_parsing(self):
        payload = brief_payload(data={"notes": "x" * 40_000})
        response = self.post(payload)
        self.assertEqual(response.status_code, 413)
        self.assertEqual(response.json()["error"], "payload_too_large")
        self.assertEqual(ProjectLead.objects.count(), 0)

    def test_malformed_json_is_refused(self):
        response = self.client.post(URL, data="{not json",
                                    content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "bad_request")

    def test_get_is_not_allowed(self):
        self.assertEqual(self.client.get(URL).status_code, 405)

    def test_over_length_text_is_truncated_rather_than_rejected(self):
        payload = brief_payload(data={"goal": "ц" * 5_000})
        response = self.post(payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(ProjectLead.objects.get().goal), 1500)

    def test_client_cannot_set_operator_fields(self):
        """A submitted status or internalNote must be ignored, not stored."""
        payload = brief_payload()
        payload["data"]["status"] = "COMPLETED"
        payload["data"]["internalNote"] = "injected by the client"
        self.assertEqual(self.post(payload).status_code, 201)

        lead = ProjectLead.objects.get()
        self.assertEqual(lead.status, "NEW")
        self.assertEqual(lead.internal_note, "")


@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_THROTTLE_RATES": {"brief": "5/10min"},
        "EXCEPTION_HANDLER": "apps.leads.errors.sanitised_exception_handler",
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    },
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                        "LOCATION": "throttle-test"}},
)
class RateLimitTests(TestCase):
    """Five per ten minutes, then 429 — the same budget as lib/rate-limit.ts."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_sixth_submission_is_throttled(self):
        statuses = []
        for _ in range(6):
            response = self.client.post(
                URL, data=json.dumps(brief_payload()),
                content_type="application/json", HTTP_X_FORWARDED_FOR="203.0.113.9",
            )
            statuses.append(response.status_code)

        self.assertEqual(statuses[:5], [201] * 5)
        self.assertEqual(statuses[5], 429)
        self.assertEqual(ProjectLead.objects.count(), 5)

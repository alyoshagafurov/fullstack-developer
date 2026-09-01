"""Serializers.

Three separate shapes, and the separation is the security control:

- `BriefIntakeSerializer` is write-only. It has no representation at all, so
  there is no code path where submitting a brief echoes a stored row back.
- `LeadListSerializer` carries the handful of columns a list view needs.
- `LeadDetailSerializer` carries the full record including `internalNote`,
  and is reachable only behind authentication plus `view_projectlead`.

`internalNote` appears in exactly one serializer. That is the whole reason
these are not one serializer with a `fields` argument: a field that only
exists in the admin detail shape cannot leak from the public one by
misconfiguration.
"""

from __future__ import annotations

import re

from rest_framework import serializers

from .domain import BUDGETS, LIMITS, PROJECT_TYPES, TIMELINES
from .models import LeadStatus, ProjectLead

EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


def _looks_like_url(value: str) -> bool:
    if not value:
        return True
    stripped = re.sub(r"^https?://", "", value, flags=re.IGNORECASE)
    return bool(re.match(r"^[^\s/.]+\.[^\s/.]{2,}", stripped))


def _each_link_valid(value: str) -> bool:
    return all(_looks_like_url(part.strip())
               for part in re.split(r"[\n,]+", value) if part.strip())


def _text(value, max_length: int) -> str:
    """Trim then truncate — the same normalisation `str()` does in the route.

    Over-length input is cut, not rejected, so a paste that runs long still
    produces a lead instead of an error the visitor cannot interpret.
    """
    return value.strip()[:max_length] if isinstance(value, str) else ""


def _pick(allowed: tuple[str, ...], value) -> str:
    return value if isinstance(value, str) and value in allowed else ""


class BriefIntakeSerializer(serializers.Serializer):
    """Validates a submitted brief. Deliberately not a ModelSerializer.

    The field-level codes here (`required`, `tooShort`, `pickOne`, `url`,
    `email`, `consent`) are the same strings app/api/brief/route.ts returns,
    because the client maps them back onto wizard steps. Changing one is a
    breaking change to the UI, not an implementation detail.
    """

    def to_internal_value(self, data):
        body = data.get("data") if isinstance(data.get("data"), dict) else {}
        meta = data.get("meta") if isinstance(data.get("meta"), dict) else {}

        parsed = {
            "project_type": _pick(PROJECT_TYPES, body.get("projectType")),
            "project_type_other": _text(body.get("projectTypeOther"),
                                        LIMITS["projectTypeOther"]),
            "goal": _text(body.get("goal"), LIMITS["goal"]["max"]),
            "description": _text(body.get("description"), LIMITS["description"]["max"]),
            "functionality": _text(body.get("functionality"), LIMITS["functionality"]),
            "existing_url": _text(body.get("existingUrl"), LIMITS["url"]),
            "reference_links": _text(body.get("referenceLinks"), LIMITS["links"]),
            "notes": _text(body.get("notes"), LIMITS["notes"]),
            "budget": _pick(BUDGETS, body.get("budget")),
            "timeline": _pick(TIMELINES, body.get("timeline")),
            "name": _text(body.get("name"), LIMITS["name"]["max"]),
            "company": _text(body.get("company"), LIMITS["company"]),
            "email": _text(body.get("email"), LIMITS["email"]),
            "telegram": _text(body.get("telegram"), LIMITS["handle"]),
            "whatsapp": _text(body.get("whatsapp"), LIMITS["handle"]),
            "consent": body.get("consent") is True,
            "locale": _text(meta.get("locale"), LIMITS["locale"]) or "ru",
        }

        errors: dict[str, str] = {}
        if not parsed["project_type"]:
            errors["projectType"] = "pickOne"
        if parsed["project_type"] == "other" and not parsed["project_type_other"]:
            errors["projectTypeOther"] = "required"

        if not parsed["goal"]:
            errors["goal"] = "required"
        elif len(parsed["goal"]) < LIMITS["goal"]["min"]:
            errors["goal"] = "tooShort"

        if not parsed["description"]:
            errors["description"] = "required"
        elif len(parsed["description"]) < LIMITS["description"]["min"]:
            errors["description"] = "tooShort"

        if not _looks_like_url(parsed["existing_url"]):
            errors["existingUrl"] = "url"
        if not _each_link_valid(parsed["reference_links"]):
            errors["referenceLinks"] = "url"

        if not parsed["budget"]:
            errors["budget"] = "pickOne"
        if not parsed["timeline"]:
            errors["timeline"] = "pickOne"

        if not parsed["name"]:
            errors["name"] = "required"
        elif len(parsed["name"]) < LIMITS["name"]["min"]:
            errors["name"] = "tooShort"

        if not parsed["email"]:
            errors["email"] = "required"
        elif not EMAIL.match(parsed["email"]):
            errors["email"] = "email"

        if not parsed["consent"]:
            errors["consent"] = "consent"

        clock = serializers.DateTimeField(required=False)
        for key, column in (("startedAt", "started_at"), ("completedAt", "completed_at")):
            try:
                parsed[column] = clock.to_internal_value(meta.get(key))
            except (serializers.ValidationError, TypeError):
                # The client clock is provenance, not a gate. An unparseable
                # value is replaced rather than rejected, exactly as the
                # route's `parseDate(...) ?? new Date()` does.
                parsed[column] = None

        if errors:
            raise serializers.ValidationError(errors)
        return parsed


class LeadListSerializer(serializers.ModelSerializer):
    """The list row. No description, no contact detail, no internal note."""

    projectType = serializers.CharField(source="project_type", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ProjectLead
        fields = ["reference", "name", "projectType", "createdAt", "status"]
        read_only_fields = fields


class LeadDetailSerializer(serializers.ModelSerializer):
    """The full record, for an authenticated operator only."""

    projectType = serializers.CharField(source="project_type", read_only=True)
    projectTypeOther = serializers.CharField(source="project_type_other", read_only=True)
    existingUrl = serializers.CharField(source="existing_url", read_only=True)
    referenceLinks = serializers.CharField(source="reference_links", read_only=True)
    submissionId = serializers.CharField(source="submission_id", read_only=True)
    startedAt = serializers.DateTimeField(source="started_at", read_only=True)
    completedAt = serializers.DateTimeField(source="completed_at", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    internalNote = serializers.CharField(source="internal_note", required=False,
                                         allow_blank=True)

    class Meta:
        model = ProjectLead
        fields = [
            "reference", "submissionId",
            "projectType", "projectTypeOther", "goal", "description",
            "functionality", "existingUrl", "referenceLinks", "notes",
            "budget", "timeline",
            "name", "company", "email", "telegram", "whatsapp", "consent",
            "locale", "startedAt", "completedAt", "createdAt", "updatedAt",
            "status", "internalNote",
        ]
        # Only `status` and `internalNote` are writable. Everything the
        # visitor submitted is immutable through the API: a lead is a record
        # of what was actually said, and an admin panel that can rewrite it is
        # not a record any more.
        #
        # The camelCase fields above are already read_only=True on their own
        # declarations; DRF rejects a field that is both declared and listed
        # here, so this covers only the ones it maps automatically.
        read_only_fields = [
            "reference", "goal", "description", "functionality", "notes",
            "budget", "timeline", "name", "company", "email", "telegram",
            "whatsapp", "consent", "locale",
        ]

    def validate_status(self, value):
        if value not in LeadStatus.values:
            raise serializers.ValidationError("pickOne")
        return value

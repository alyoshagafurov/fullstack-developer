"""Shared fixtures.

Every value here is obviously synthetic. No test should ever contain something
that could be mistaken for a real client's contact details.
"""

from __future__ import annotations

import uuid

from django.contrib.auth.models import Group, User
from django.utils import timezone

from apps.leads.models import ProjectLead


def brief_payload(**overrides) -> dict:
    """A submission the API should accept, in the exact wire shape."""
    now = timezone.now().isoformat()
    payload = {
        "submissionId": f"test-{uuid.uuid4()}",
        "data": {
            "projectType": "website",
            "projectTypeOther": "",
            "goal": "Запустить сайт студии и получать заявки",
            "description": "Нужен корпоративный сайт с формой брифа и админкой для заявок.",
            "functionality": "",
            "existingUrl": "",
            "referenceLinks": "",
            "notes": "",
            "budget": "r1k_2k5",
            "timeline": "m1_2",
            "name": "Тестовый Клиент",
            "company": "",
            "email": "qa@example.com",
            "telegram": "",
            "whatsapp": "",
            "consent": True,
        },
        "meta": {"locale": "ru", "startedAt": now, "completedAt": now},
    }
    for key, value in overrides.items():
        if key in ("data", "meta") and isinstance(value, dict):
            payload[key].update(value)
        else:
            payload[key] = value
    return payload


def make_lead(**overrides) -> ProjectLead:
    now = timezone.now()
    fields = {
        "reference": "ALY-2026-QATST",
        "submission_id": f"seed-{uuid.uuid4()}",
        "project_type": "website",
        "goal": "Проверочная цель для теста",
        "description": "Проверочное описание достаточной длины для валидации.",
        "budget": "r1k_2k5",
        "timeline": "m1_2",
        "name": "Тестовый Клиент",
        "email": "qa@example.com",
        "started_at": now,
        "completed_at": now,
        "internal_note": "приватная заметка владельца",
    }
    fields.update(overrides)
    return ProjectLead.objects.create(**fields)


def user_in_role(username: str, role: str | None) -> User:
    """A user with a role, or with none at all when role is None."""
    user = User.objects.create_user(username=username, password="test-pass-phrase-12")
    if role:
        user.groups.add(Group.objects.get(name=role))
    return user

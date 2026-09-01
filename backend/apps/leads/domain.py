"""The brief's option lists and length limits.

A direct mirror of lib/brief/schema.ts. These are the allow-lists the server
matches against — the client's copy is for UX and is never trusted, exactly as
the comment in app/api/brief/route.ts says.

If a value is added on the TypeScript side it must be added here too, or the
Django endpoint will reject a brief the wizard happily produced. That coupling
is deliberate and cheap; the alternative is accepting arbitrary strings.
"""

from __future__ import annotations

PROJECT_TYPES = (
    "website", "landing", "webapp", "saas", "ecommerce", "crm",
    "telegram", "automation", "ai", "api", "custom", "other",
)

# Ranges, never an exact figure — a planning signal, not a quote.
BUDGETS = ("lt500", "r500_1k", "r1k_2k5", "r2k5_5k", "gt5k", "unsure")

TIMELINES = ("asap", "w1_2", "w2_4", "m1_2", "flexible", "unsure")

LIMITS = {
    "projectTypeOther": 80,
    "goal": {"min": 12, "max": 1500},
    "description": {"min": 20, "max": 2000},
    "functionality": 1500,
    "url": 500,
    "links": 800,
    "notes": 1500,
    "name": {"min": 2, "max": 80},
    "company": 120,
    "email": 160,
    "handle": 80,
    "submissionId": 100,
    "locale": 8,
}

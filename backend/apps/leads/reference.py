"""Request references — ALY-2026-4F7K2.

A direct port of lib/brief/reference.ts, kept identical on purpose: the same
prefix, the same year segment, the same five-character tail, and the same
alphabet with I, O, 0 and 1 removed so a reference survives being read down a
phone line or typed back from a screenshot. REFERENCE_PATTERN on the client
(`/^ALY-\\d{4}-[A-Z0-9]{5}$/`) must keep matching whatever this returns, or the
confirmation screen will refuse a perfectly good reference.

One deliberate difference: `secrets` replaces `Math.random()`. References are
quoted back by clients and should not be guessable from one another. That is a
strengthening, not a behaviour change — the output format is unchanged.

Server-only, like its TypeScript counterpart: a reference must never exist
unless a brief was actually stored.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timezone

REFERENCE_PREFIX = "ALY"
ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
TAIL_LENGTH = 5


def make_reference(now: datetime | None = None) -> str:
    moment = now or datetime.now(timezone.utc)
    tail = "".join(secrets.choice(ALPHABET) for _ in range(TAIL_LENGTH))
    return f"{REFERENCE_PREFIX}-{moment.astimezone(timezone.utc).year}-{tail}"

"""Local development.

The database default points at a local, password-less Postgres. That is a
developer convenience, not a credential: there is no secret in it, and it can
never reach production because production.py refuses to start without an
explicit environment variable.

SECRET_KEY is generated fresh on every start. Nothing durable is signed in
development, so an ephemeral key is safer than a committed constant.
"""

from __future__ import annotations

import os
import secrets

from .base import *  # noqa: F401,F403
from .base import database_from_url

DEBUG = True
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY") or secrets.token_urlsafe(50)
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

DATABASES = {
    "default": database_from_url(
        os.environ.get("DJANGO_DATABASE_URL", "postgres://localhost:5432/aly_dev")
    )
}

# On a developer's own throwaway database there is no Prisma to race, so the
# full admin UI — including the status control — can be exercised.
LEADS_WRITE_ENABLED = True

"""Test settings.

Points at whatever DJANGO_DATABASE_URL names — in practice a disposable local
Postgres. Never a production database: the test runner creates and drops its
own `test_<name>` database, which is exactly why pointing this at production
would be destructive.

Note on throttling: the brief endpoint invokes its throttle directly rather
than through DEFAULT_THROTTLE_CLASSES, so emptying that list does NOT switch
the rate limit off. That is deliberate — the public endpoint's rate limit
should not be removable by a settings change — and it means tests clear the
throttle cache between cases instead of disabling it. The cache below is
local to the test process so nothing leaks between runs.
"""

from __future__ import annotations

import os
import secrets

from .base import *  # noqa: F401,F403
from .base import REST_FRAMEWORK, database_from_url

DEBUG = False
SECRET_KEY = secrets.token_urlsafe(50)
ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]

DATABASES = {
    "default": database_from_url(
        os.environ.get("DJANGO_DATABASE_URL", "postgres://localhost:5432/aly_test")
    )
}

# Fast, deterministic hashing for tests only. Production keeps Django's
# default PBKDF2 — this override never leaves this module.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_CLASSES": []}

# Writes are exercised by default so the mutation tests describe the intended
# end state. The read-only phase gate has its own tests, which switch this
# back off with override_settings — see tests/test_read_only.py.
LEADS_WRITE_ENABLED = True

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "aly-tests",
    }
}

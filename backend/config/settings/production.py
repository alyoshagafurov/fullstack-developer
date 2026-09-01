"""Production.

Every secret is required. A missing one raises ImproperlyConfigured at import
time, so the process refuses to boot rather than starting with a guessed or
generated value — the same posture as `getPrisma()` on the Next.js side,
which returns null and lets the endpoint answer 501 instead of pretending a
database exists.
"""

from __future__ import annotations

import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import database_from_url


def required(name: str) -> str:
    """Read a mandatory environment variable.

    The error names the variable but never its value, so a misconfigured
    deploy cannot leak a secret into a crash log or an error page.
    """
    value = os.environ.get(name)
    if not value:
        raise ImproperlyConfigured(f"{name} is not set")
    return value


DEBUG = False
SECRET_KEY = required("DJANGO_SECRET_KEY")
ALLOWED_HOSTS = [h.strip() for h in required("DJANGO_ALLOWED_HOSTS").split(",") if h.strip()]

# Accepts either name. Vercel already uses DATABASE_URL for the Prisma side,
# and pointing both at one database is the whole point of the dual-run phase;
# DJANGO_DATABASE_URL exists for the case where they must differ (a read
# replica, or a separate role with narrower grants).
DATABASES = {
    "default": database_from_url(
        os.environ.get("DJANGO_DATABASE_URL") or required("DATABASE_URL")
    )
}

# ── Write ownership ───────────────────────────────────────────────────────
# Read-only in production, and it stays that way until ownership actually
# moves. Prisma on Vercel is still the only writer of ProjectLead.
#
# Flipping this is a deliberate, separate act — it is not part of shipping
# the admin UI, and it must not happen by default when someone redeploys.
LEADS_WRITE_ENABLED = os.environ.get("LEADS_WRITE_ENABLED", "").lower() == "true"

# ── Transport and cookie security ─────────────────────────────────────────
# Mirrors the header set next.config.js already applies to the public site.
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 63072000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # the admin UI must read it to send X-CSRFToken
CSRF_COOKIE_SAMESITE = "Lax"

# Set when the admin UI is served from a different host than Django.
# Comma-separated, scheme included, e.g. https://aly.lat
_csrf_origins = os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "")
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_origins.split(",") if o.strip()]

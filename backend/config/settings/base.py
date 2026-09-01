"""Settings shared by every environment.

Two rules govern this file:

1. It never contains a secret, a connection string, or a credential. Every
   such value is read from the environment, and the environment-specific
   modules decide whether a missing value is fatal (production) or may fall
   back to a local, password-less developer default (development / test).

2. It never widens the security posture the Next.js side already established.
   The public brief endpoint is size-capped, honeypot-trapped, rate-limited
   and independently validated over there; the Django implementation of the
   same endpoint repeats all four rather than trusting an upstream caller.
"""

from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def database_from_url(url: str, *, conn_max_age: int = 60) -> dict:
    """Turn a postgres:// URL into a Django DATABASES entry.

    Written by hand rather than pulling in dj-database-url: one small parser
    is easier to audit than another dependency in a path that handles a
    connection string.

    The URL is never logged and never echoed back — callers get the parsed
    dict, and a failure raises without embedding the value in the message.

    Query parameters are honoured, which matters in production: every managed
    Postgres worth using requires `?sslmode=require`, and silently dropping it
    would mean the connection quietly falls back to plaintext.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("postgres", "postgresql"):
        raise ValueError("database URL must use the postgres:// scheme")
    name = parsed.path.lstrip("/")
    if not name:
        raise ValueError("database URL is missing a database name")

    query = parse_qs(parsed.query)
    options: dict = {
        # A hung TCP connect otherwise ties up a worker until the platform's
        # own timeout fires, which on a small dyno is most of the capacity.
        "connect_timeout": int(query.get("connect_timeout", ["10"])[0]),
    }
    sslmode = query.get("sslmode", [None])[0]
    if sslmode:
        options["sslmode"] = sslmode

    # Transaction-pooled endpoints (PgBouncer, Neon's pooler, Supabase's 6543)
    # cannot hold a named cursor across statements. Django's server-side
    # cursors then fail on the second page of any large queryset.
    disable_cursors = os.environ.get("DJANGO_DB_POOLED", "").lower() == "true"

    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": name,
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "",
        "PORT": str(parsed.port or ""),
        # Persistent connections, because a managed Postgres charges for
        # connection churn and a CRM opens the same few queries repeatedly.
        "CONN_MAX_AGE": conn_max_age,
        # Django 4.1+. Without it a persistent connection that the database
        # closed server-side is handed to the next request and fails once.
        "CONN_HEALTH_CHECKS": True,
        "DISABLE_SERVER_SIDE_CURSORS": disable_cursors,
        "OPTIONS": options,
    }


# ── Applications ──────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "apps.leads",
    "apps.accounts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Serves Django Admin's own CSS/JS. The admin here is an emergency
    # backoffice, but an emergency backoffice that renders unstyled is one
    # nobody can use at the moment they need it.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "apps.observability.RequestLogMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ── Auth ──────────────────────────────────────────────────────────────────
# Django's own primitives, deliberately. No custom crypto, no bespoke password
# hashing. PBKDF2 is Django's default and is what `set_password` uses.
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LANGUAGE_CODE = "ru"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# ── Write ownership ───────────────────────────────────────────────────────
# FALSE by default, deliberately. Prisma is still the only writer of
# ProjectLead; Django reads the same table and must not race it. A settings
# module that forgets to declare this therefore gets the safe answer, and
# turning writes on is an explicit act in exactly one place.
#
# This is not a substitute for the ownership migration — it is the seam that
# makes the read-only production phase real rather than a promise.
LEADS_WRITE_ENABLED = False

# ── DRF ───────────────────────────────────────────────────────────────────
# Session authentication first, as the brief requires it be considered before
# JWT. The custom admin is reached through a server-side proxy on the Next.js
# side, so the browser is same-origin with that proxy and never talks to
# Django directly — which is why no CORS package is installed.
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    # Deny by default. Every endpoint that is meant to be public opts out
    # explicitly, so forgetting a permission class fails closed.
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {
        # Mirrors lib/rate-limit.ts: 5 submissions per 10 minutes per client.
        "brief": "5/10min",
        # Password guessing budget. Generous enough that an operator who
        # mistypes twice never notices, tight enough that bulk guessing is
        # pointless.
        "login": "10/5min",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    "EXCEPTION_HANDLER": "apps.leads.errors.sanitised_exception_handler",
    # No browsable API: it renders internal detail and is a needless surface.
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}

# Largest brief body Django will read, matching MAX_BODY_BYTES in the
# Next.js route so both edges agree on what "too large" means.
BRIEF_MAX_BODY_BYTES = 32 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = BRIEF_MAX_BODY_BYTES
DATA_UPLOAD_MAX_NUMBER_FIELDS = 100

# ── Logging ───────────────────────────────────────────────────────────────
# Deliberately narrow. The Next.js side logs only `[brief] storage failure
# { code }` and no field values; Django holds the same line. Nothing here
# logs a request body, and DEBUG-level django.db.backends (which would print
# query parameters, i.e. the brief itself) is never enabled.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "plain": {"format": "%(levelname)s %(name)s %(message)s"},
        # Carries the request id so one operator's failing request can be
        # followed across lines without correlating by timestamp.
        "request": {"format": "%(levelname)s %(name)s [%(request_id)s] %(message)s"},
    },
    "filters": {
        "request_id": {"()": "apps.observability.RequestIdFilter"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "plain",
        },
        "request": {
            "class": "logging.StreamHandler",
            "formatter": "request",
            "filters": ["request_id"],
        },
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
    "loggers": {
        # Never DEBUG in any environment: this logger prints query parameters,
        # and the parameters of an INSERT into ProjectLead are the brief —
        # the visitor's name, email and description.
        "django.db.backends": {"level": "WARNING", "propagate": False,
                               "handlers": ["console"]},
        "apps.leads": {"level": "INFO", "propagate": False,
                       "handlers": ["request"]},
        "apps.accounts": {"level": "INFO", "propagate": False,
                          "handlers": ["request"]},
        "apps.observability": {"level": "INFO", "propagate": False,
                               "handlers": ["request"]},
    },
}

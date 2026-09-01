"""Root URL configuration.

Two surfaces, deliberately separated:

- /api/v1/  — the DRF API. The only surface the Next.js app talks to.
- /django-admin/ — Django's own admin, kept as an emergency backoffice and
  debugging interface. It is NOT the product's admin panel; the custom admin
  UI is a later phase. Its path is configurable so it need not sit on the
  well-known /admin/ URL in production.
"""

from __future__ import annotations

import os

from django.contrib import admin
from django.urls import include, path

from apps.health import liveness, readiness

DJANGO_ADMIN_PATH = os.environ.get("DJANGO_ADMIN_PATH", "django-admin").strip("/")

urlpatterns = [
    # Unauthenticated by necessity — a platform probe cannot log in. Both
    # return a bare status and nothing about the deployment.
    path("health/live", liveness, name="health-live"),
    path("health/ready", readiness, name="health-ready"),

    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.leads.urls")),
    path(f"{DJANGO_ADMIN_PATH}/", admin.site.urls),
]

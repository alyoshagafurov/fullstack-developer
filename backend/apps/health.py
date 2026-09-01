"""Health endpoints.

Two of them, because they answer different questions and a platform uses them
differently:

  /health/live   is the process running?      -> never touches the database
  /health/ready  can it actually serve?       -> one SELECT 1

Conflating them is a common way to build an outage: if the liveness probe
checks the database, a brief database blip makes the platform conclude the
application is dead and restart it — turning a recoverable five-second
interruption into a cold start, repeatedly.

Both are unauthenticated, because a probe cannot log in. That makes their
response bodies a public surface, so they say the minimum that is useful and
nothing about how the service is built: no version, no settings, no hostname,
no environment, no exception text, and above all nothing about the database
beyond whether a query succeeded.
"""

from __future__ import annotations

import logging

from django.db import connection
from django.http import JsonResponse
from django.views.decorators.cache import never_cache

logger = logging.getLogger(__name__)


@never_cache
def liveness(request):
    """The process is up. Deliberately does no work."""
    return JsonResponse({"status": "ok"})


@never_cache
def readiness(request):
    """The process is up AND the database answers."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as exc:
        # Class name to the log; nothing but a status to the caller. A
        # connection error's message can contain the host and the database
        # name, which is a free hint to anyone probing the endpoint.
        logger.error("readiness probe failed (%s)", type(exc).__name__)
        return JsonResponse({"status": "unavailable"}, status=503)

    return JsonResponse({"status": "ok"})

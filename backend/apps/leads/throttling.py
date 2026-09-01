"""Rate limiting for the public brief endpoint.

Mirrors lib/rate-limit.ts: five submissions per ten minutes, keyed on the
left-most x-forwarded-for entry.

The same honest limitation applies, for the same reason. DRF's throttle counts
in Django's cache; with the default local-memory cache that is per-process, so
several web workers each carry their own window. Pointing CACHES at Redis or
Memcached makes it genuinely shared — that is the seam, and it is a
configuration change rather than a code change.
"""

from __future__ import annotations

from apps.throttling import WindowedRateThrottle


class BriefRateThrottle(WindowedRateThrottle):
    """Five per ten minutes, keyed on the left-most x-forwarded-for entry.

    The window and the key both come from `WindowedRateThrottle`, which the
    login endpoint shares — DRF's own rate grammar cannot express either.
    """

    scope = "brief"

"""Rate limiting for the public brief endpoint.

Five submissions per ten minutes, matching lib/rate-limit.ts. The key is NOT
the same: that route reads the left-most x-forwarded-for entry, which the
caller supplies and can therefore rotate at will. `WindowedRateThrottle` counts
from the trusted end of the chain instead — see its `client_ident`.

A separate honest limitation applies. DRF's throttle counts
in Django's cache; with the default local-memory cache that is per-process, so
several web workers each carry their own window. Pointing CACHES at Redis or
Memcached makes it genuinely shared — that is the seam, and it is a
configuration change rather than a code change.
"""

from __future__ import annotations

from apps.throttling import WindowedRateThrottle


class BriefRateThrottle(WindowedRateThrottle):
    """Five per ten minutes, keyed on the trusted end of the proxy chain.

    The window and the key both come from `WindowedRateThrottle`, which the
    login endpoint shares — DRF's own rate grammar cannot express either.
    """

    scope = "brief"

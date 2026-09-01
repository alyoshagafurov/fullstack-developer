"""Throttling shared across apps.

DRF's own rate grammar reads only the first character of the period, so it can
express `5/min` but not `5/10min`. Both windows this project needs are
multi-unit, so the parser is widened once, here, rather than twice.
"""

from __future__ import annotations

import re

from rest_framework.throttling import SimpleRateThrottle

_PERIOD_SECONDS = {"s": 1, "m": 60, "h": 3600, "d": 86400}
_RATE = re.compile(r"^(?P<count>\d+)/(?P<multiple>\d*)(?P<unit>[smhd])[a-z]*$")


class WindowedRateThrottle(SimpleRateThrottle):
    """SimpleRateThrottle that understands `<count>/<multiple><unit>`.

    Plain DRF rates still parse: `5/min` has an empty multiple, read as one.
    """

    def parse_rate(self, rate):
        if rate is None:
            return (None, None)
        match = _RATE.match(rate)
        if not match:
            raise ValueError(f"unparseable throttle rate: {rate!r}")
        count = int(match["count"])
        multiple = int(match["multiple"] or 1)
        return count, multiple * _PERIOD_SECONDS[match["unit"]]

    def client_ident(self, request) -> str:
        """Best-effort client identity from the proxy headers.

        Mirrors `clientKey` in lib/rate-limit.ts: left-most x-forwarded-for
        entry, then x-real-ip, then the socket address.
        """
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return (request.META.get("HTTP_X_REAL_IP")
                or request.META.get("REMOTE_ADDR")
                or "unknown")

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope,
                                    "ident": self.client_ident(request)}

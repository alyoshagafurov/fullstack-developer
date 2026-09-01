"""Throttling shared across apps.

DRF's own rate grammar reads only the first character of the period, so it can
express `5/min` but not `5/10min`. Both windows this project needs are
multi-unit, so the parser is widened once, here, rather than twice.
"""

from __future__ import annotations

import re

from django.conf import settings
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
        """The client identity a rate limit may safely count.

        X-Forwarded-For is appended to, not replaced, by each proxy it passes
        through — so a caller who sends one of their own arrives with their
        claim sitting at the left and the truth appended to the right. Reading
        the left-most entry therefore lets the caller pick their own bucket,
        which is the same as having no limit at all: rotate the header and
        every request looks like a new client. On a password endpoint that is
        unlimited guessing.

        So the entry is counted from the right instead, by exactly the number
        of proxies the deployment says are in front (`TRUSTED_PROXY_DEPTH`).
        Only those entries were written by something we trust. A chain shorter
        than that count means the request did not arrive by the expected path,
        so the header is discarded rather than half-believed.

        X-Real-IP is no longer consulted: it is a single value with no chain to
        reason about, just as settable by the caller, and nothing in front of
        this service sets it.
        """
        depth = getattr(settings, "TRUSTED_PROXY_DEPTH", 0)
        remote = request.META.get("REMOTE_ADDR") or "unknown"
        if depth <= 0:
            return remote

        chain = [part.strip() for part in
                 (request.META.get("HTTP_X_FORWARDED_FOR") or "").split(",")
                 if part.strip()]
        return chain[-depth] if len(chain) >= depth else remote

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope,
                                    "ident": self.client_ident(request)}

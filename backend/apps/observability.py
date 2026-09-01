"""Request logging.

What a production log for this service is allowed to contain is a short list,
and it is short for a reason: every field of a ProjectLead is either someone's
contact detail or the owner's private commercial note. A log line is copied
into backups, shipped to whatever the platform aggregates with, and read by
whoever has dashboard access — so anything written here should be assumed
permanent and widely visible.

Allowed: method, path, status, duration, exception class, request id.
Never: query strings, request bodies, response bodies, headers, cookies,
session values, or any field of a lead.

The query string exclusion is not paranoia. The admin register's search puts
the operator's term in the URL, and operators search by client email — so
`/api/v1/admin/leads/?q=someone@example.com` would put a real address into
every access log line that recorded it.
"""

from __future__ import annotations

import logging
import time
import uuid
from contextvars import ContextVar

logger = logging.getLogger(__name__)

# ContextVar rather than thread-local: it survives async views, which a WSGI
# thread-local does not.
_request_id: ContextVar[str] = ContextVar("request_id", default="-")

REQUEST_ID_HEADER = "HTTP_X_REQUEST_ID"


def current_request_id() -> str:
    return _request_id.get()


class RequestIdFilter(logging.Filter):
    """Puts the current request id on every record the formatter renders."""

    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = current_request_id()
        return True


class RequestLogMiddleware:
    """One line per request, and only for the ones worth a line.

    Successful reads are not logged. A CRM polled by one operator would
    otherwise produce a log made entirely of 200s, in which the one 500 that
    matters is invisible.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Honour an upstream id when the proxy supplies one, so a request can
        # be followed from Vercel through to Django.
        incoming = request.META.get(REQUEST_ID_HEADER, "")
        request_id = incoming[:64] if incoming else uuid.uuid4().hex[:16]
        token = _request_id.set(request_id)
        request.request_id = request_id

        started = time.monotonic()
        try:
            response = self.get_response(request)
        except Exception as exc:
            # The class name only. `str(exc)` on a database error quotes the
            # failing statement, and that statement contains the brief.
            logger.error(
                "%s %s failed after %.0fms (%s)",
                request.method, self._path(request),
                (time.monotonic() - started) * 1000, type(exc).__name__,
            )
            _request_id.reset(token)
            raise

        elapsed_ms = (time.monotonic() - started) * 1000
        if response.status_code >= 400:
            logger.warning(
                "%s %s -> %s in %.0fms",
                request.method, self._path(request),
                response.status_code, elapsed_ms,
            )
        elif elapsed_ms > 1000:
            # A slow read is the early warning for a missing index or a
            # database on the wrong continent.
            logger.info(
                "%s %s -> %s in %.0fms (slow)",
                request.method, self._path(request),
                response.status_code, elapsed_ms,
            )

        response["X-Request-Id"] = request_id
        _request_id.reset(token)
        return response

    @staticmethod
    def _path(request) -> str:
        """The path WITHOUT its query string. See the module docstring."""
        return request.path[:200]

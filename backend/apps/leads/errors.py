"""Error sanitisation.

The Next.js route's rule, restated for Django: nothing internal leaves the
process. No exception messages, no stack traces, no SQL, no ORM detail, no
connection strings. A client gets a stable machine-readable code and the
status that goes with it, and nothing else.

DRF's default handler renders `exc.detail`, which for a database or
programming error can contain query fragments. This replaces it.
"""

from __future__ import annotations

import logging

from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)

# Status code -> the code the client sees. Keyed on the status rather than the
# exception class because DRF's own handler already normalises the variants:
# django.http.Http404 arrives here as NotFound, Django's PermissionDenied as
# DRF's, and so on. Matching on the class alone would miss those and mislabel
# a 404 as a generic bad request.
_CODE_FOR_STATUS = {
    status.HTTP_400_BAD_REQUEST: "bad_request",
    status.HTTP_401_UNAUTHORIZED: "unauthenticated",
    status.HTTP_403_FORBIDDEN: "forbidden",
    status.HTTP_404_NOT_FOUND: "not_found",
    status.HTTP_405_METHOD_NOT_ALLOWED: "method_not_allowed",
    status.HTTP_406_NOT_ACCEPTABLE: "not_acceptable",
    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: "payload_too_large",
    status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: "unsupported_media_type",
    status.HTTP_429_TOO_MANY_REQUESTS: "rate_limited",
    status.HTTP_503_SERVICE_UNAVAILABLE: "storage_unavailable",
}

# Codes this project authors and is willing to expose verbatim. An
# allow-list, not a pattern match: the whole point of this module is that
# nothing reaches a client unless it was written here on purpose.
_PASSTHROUGH_CODES = frozenset({"read_only_phase"})


def sanitised_exception_handler(exc, context):
    """Map any exception onto {ok: false, error: <code>}."""
    if isinstance(exc, exceptions.ValidationError):
        # Field errors are ours: field names mapped to short codes produced by
        # our own serializers, never database text.
        return Response(
            {"ok": False, "error": "validation", "fieldErrors": _flatten(exc.detail)},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    handled = drf_exception_handler(exc, context)
    if handled is not None:
        code = _CODE_FOR_STATUS.get(handled.status_code, "bad_request")
        # A permission class may name its own reason, and some of those are
        # worth telling the operator apart: "not yet" and "not you" are
        # different sentences. Only codes on this list pass through, so no
        # framework or database text can ever ride out this way.
        detail = str(getattr(exc, "detail", ""))
        if detail in _PASSTHROUGH_CODES:
            code = detail
        response = Response({"ok": False, "error": code}, status=handled.status_code)
        if isinstance(exc, exceptions.Throttled) and exc.wait:
            response["Retry-After"] = str(int(exc.wait))
        return response

    # Unhandled: log the class name only. Not the message — a database error's
    # message can quote the failing statement, and a brief is in that
    # statement.
    logger.error("[api] unhandled failure", extra={"code": type(exc).__name__})
    return Response({"ok": False, "error": "server_error"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _flatten(detail) -> dict:
    """Reduce DRF's nested error detail to {field: code}."""
    if not isinstance(detail, dict):
        return {}
    flat = {}
    for field, value in detail.items():
        if isinstance(value, (list, tuple)) and value:
            flat[field] = str(value[0])
        elif isinstance(value, dict):
            nested = _flatten(value)
            if nested:
                flat[field] = next(iter(nested.values()))
        else:
            flat[field] = str(value)
    return flat

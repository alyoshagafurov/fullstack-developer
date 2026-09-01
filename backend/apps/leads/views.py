"""API views.

The public intake view reproduces app/api/brief/route.ts step for step, in the
same order, because that order is itself a security property: the cheapest and
most hostile-input-tolerant checks run first, and nothing expensive happens
until the request has earned it.

    content-type -> payload size -> JSON parse -> honeypot -> rate limit
                 -> normalisation -> validation -> idempotency -> insert

DRF would normally run throttling inside `initial()`, i.e. before any of this.
That would reorder the pipeline, so automatic throttling is switched off on
the view and `BriefRateThrottle` is invoked by hand at the point it belongs.
"""

from __future__ import annotations

import json
import logging

from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.db import DatabaseError, IntegrityError, transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LeadStatus, ProjectLead
from .permissions import StrictModelPermissions, WritesEnabled
from .reference import make_reference
from .serializers import BriefIntakeSerializer, LeadDetailSerializer, LeadListSerializer
from .throttling import BriefRateThrottle

logger = logging.getLogger(__name__)


class BriefIntakeView(APIView):
    """POST /api/v1/brief — the public boundary.

    Everything arriving here is treated as hostile. The client's own
    validation is a convenience; this is what actually protects the system,
    and it must hold if the client is bypassed entirely.
    """

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []  # invoked manually below, see module docstring

    def post(self, request):
        # 1 — content type
        content_type = (request.META.get("CONTENT_TYPE") or "").lower()
        if "application/json" not in content_type:
            return Response({"ok": False, "error": "unsupported_media_type"},
                            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        # 2 — size cap, before parsing anything
        max_bytes = settings.BRIEF_MAX_BODY_BYTES
        declared = request.META.get("CONTENT_LENGTH")
        if declared and str(declared).isdigit() and int(declared) > max_bytes:
            return Response({"ok": False, "error": "payload_too_large"},
                            status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        try:
            raw_body = request.body
        except RequestDataTooBig:
            return Response({"ok": False, "error": "payload_too_large"},
                            status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        if len(raw_body) > max_bytes:
            return Response({"ok": False, "error": "payload_too_large"},
                            status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        # 3 — parse
        try:
            payload = json.loads(raw_body)
        except (ValueError, UnicodeDecodeError):
            return Response({"ok": False, "error": "bad_request"},
                            status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(payload, dict):
            return Response({"ok": False, "error": "bad_request"},
                            status=status.HTTP_400_BAD_REQUEST)

        # 4 — honeypot. Never stored; answered as accepted so bots learn
        # nothing from the difference between success and rejection.
        honeypot = payload.get("hp")
        if isinstance(honeypot, str) and honeypot:
            return Response({"ok": False, "error": "rejected"},
                            status=status.HTTP_202_ACCEPTED)

        # 5 — rate limit
        throttle = BriefRateThrottle()
        if not throttle.allow_request(request, self):
            wait = throttle.wait() or 0
            response = Response({"ok": False, "error": "rate_limited"},
                                status=status.HTTP_429_TOO_MANY_REQUESTS)
            response["Retry-After"] = str(int(wait))
            return response

        # 6 + 7 — normalise into exactly the fields we accept, then validate.
        # A failure here raises and the sanitised handler renders 422 with
        # {field: code}; no other shape of error can escape.
        serializer = BriefIntakeSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        columns = dict(serializer.validated_data)

        submission_id = _submission_id(payload, request)
        if not submission_id:
            return Response(
                {"ok": False, "error": "validation",
                 "fieldErrors": {"submissionId": "required"}},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        columns["submission_id"] = submission_id

        now = timezone.now()
        columns["started_at"] = columns.get("started_at") or now
        columns["completed_at"] = columns.get("completed_at") or now

        # 8 — storage
        return _store(columns, submission_id)


def _submission_id(payload: dict, request) -> str:
    raw = payload.get("submissionId")
    if isinstance(raw, str) and raw.strip():
        return raw.strip()[:100]
    header = request.META.get("HTTP_IDEMPOTENCY_KEY") or ""
    return header.strip()[:100]


def _store(columns: dict, submission_id: str) -> Response:
    """Insert, resolving a duplicate submission to its original reference.

    Mirrors the Prisma P2002 handling. The unique constraint on submissionId
    is what makes concurrent identical POSTs safe: exactly one insert wins and
    every other caller is answered with the reference that won, so a double
    click or a network retry can never produce a second lead.
    """
    try:
        with transaction.atomic():
            lead = ProjectLead.objects.create(reference=make_reference(), **columns)
        return Response({"ok": True, "reference": lead.reference},
                        status=status.HTTP_201_CREATED)
    except IntegrityError:
        pass
    except DatabaseError as exc:
        return _storage_unavailable(exc)

    # Same submission arriving twice — return the original reference.
    try:
        existing = (ProjectLead.objects
                    .filter(submission_id=submission_id)
                    .values_list("reference", flat=True)
                    .first())
    except DatabaseError as exc:
        return _storage_unavailable(exc)
    if existing:
        return Response({"ok": True, "reference": existing, "duplicate": True},
                        status=status.HTTP_200_OK)

    # Reference collision — astronomically unlikely, but retry once.
    try:
        with transaction.atomic():
            lead = ProjectLead.objects.create(reference=make_reference(), **columns)
        return Response({"ok": True, "reference": lead.reference},
                        status=status.HTTP_201_CREATED)
    except (IntegrityError, DatabaseError) as exc:
        return _storage_unavailable(exc)


def _storage_unavailable(exc: Exception) -> Response:
    """The client learns that storage failed, and nothing more.

    The log records the exception's class name only. Not str(exc): a database
    error's message can quote the failing statement, and the failing statement
    contains the brief — the visitor's name, email and description.
    """
    logger.error("[brief] storage failure", extra={"code": type(exc).__name__})
    return Response({"ok": False, "error": "storage_unavailable"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AdminLeadViewSet(mixins.UpdateModelMixin, viewsets.ReadOnlyModelViewSet):
    """Leads, for authenticated operators.

    Read plus a partial update, and nothing else. `ReadOnlyModelViewSet`
    supplies list and retrieve; `UpdateModelMixin` adds the PATCH used to move
    a lead's status. `CreateModelMixin` and `DestroyModelMixin` are absent on
    purpose — leads are created by the public brief endpoint and are never
    destroyed through this API.

    There is no public route to this viewset. Authentication is required
    before permissions are consulted, and `StrictModelPermissions` then
    demands `view_projectlead` even for a GET — so an authenticated account
    with no role sees nothing.

    Lookup is by `reference`, never by primary key: the reference is the
    identifier operators and clients already share, and the row id is an
    internal detail that need not be exposed to be useful.
    """

    queryset = ProjectLead.objects.all()
    # Order matters for the message an operator sees: authentication, then
    # the role's permission, then whether writing is open at all this phase.
    permission_classes = [IsAuthenticated, StrictModelPermissions, WritesEnabled]
    lookup_field = "reference"
    lookup_url_kwarg = "reference"
    lookup_value_regex = r"ALY-\d{4}-[A-Z0-9]{5}"
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        return LeadListSerializer if self.action == "list" else LeadDetailSerializer

    # Only these columns may be sorted on, and only by these names. A free
    # `ordering` parameter passed into `order_by` lets a caller sort by
    # `internalNote`, which orders the register by the content of a private
    # field — a slow but real way to read it.
    ORDERING = {
        "createdAt": "created_at", "-createdAt": "-created_at",
        "name": "name", "-name": "-name",
        "status": "status", "-status": "-status",
        "reference": "reference", "-reference": "-reference",
    }

    def get_queryset(self):
        qs = super().get_queryset()

        status_filter = self.request.query_params.get("status")
        if status_filter in LeadStatus.values:
            qs = qs.filter(status=status_filter)

        project_type = self.request.query_params.get("projectType")
        if project_type:
            qs = qs.filter(project_type=project_type)

        search = self.request.query_params.get("q")
        if search:
            # Reference, client name and email. Deliberately not a full-text
            # sweep of description or notes — an operator searching for a
            # client should not double as a way to trawl every brief body.
            qs = qs.filter(
                Q(reference__icontains=search)
                | Q(name__icontains=search)
                | Q(email__icontains=search)
            )

        ordering = self.ORDERING.get(self.request.query_params.get("ordering", ""))
        return qs.order_by(ordering) if ordering else qs

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Counts per status, for the dashboard.

        One grouped query rather than seven `count` requests, and it rides the
        existing (status, createdAt) index. Every status is present in the
        response even at zero — a dashboard that hides empty stages makes the
        pipeline look different every day and is harder to read, not easier.

        Counts only. No reference, no name, nothing from a brief body.
        """
        rows = (ProjectLead.objects.values("status")
                .annotate(count=Count("id")))
        counts = {row["status"]: row["count"] for row in rows}
        by_status = {value: counts.get(value, 0) for value in LeadStatus.values}
        return Response({"total": sum(by_status.values()), "byStatus": by_status})

    def partial_update(self, request, *args, **kwargs):
        """PATCH — status and internalNote only.

        `StrictModelPermissions` maps PATCH onto `change_projectlead`, which
        VIEWER does not hold, so a viewer's PATCH is a 403 before this runs.
        The serializer's read_only_fields then guarantee that even an ADMIN
        cannot rewrite what the visitor submitted.
        """
        return super().partial_update(request, *args, **kwargs)

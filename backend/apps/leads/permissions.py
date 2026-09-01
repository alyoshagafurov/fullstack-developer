"""Authorisation for the admin API.

Built on Django's own model permissions rather than a bespoke role table.
`leads.view_projectlead` and `leads.change_projectlead` already exist because
the model exists; the two groups this project needs are just bundles of them:

    ADMIN   view + change     — read leads, move status, write internal notes
    VIEWER  view              — read only, no mutation of any kind

Roles are therefore data, not code. Adding a third role later is a migration
plus a group, with no change to this file. Deliberately absent:
`delete_projectlead`. A lead is a record of a real enquiry, and nothing in the
current product needs to destroy one — so no role grants it.

Public users are not represented here at all. There is no permission that
grants an unauthenticated request access to a lead, because the admin routes
require authentication before permissions are even consulted.
"""

from __future__ import annotations

from django.conf import settings
from rest_framework.permissions import (
    SAFE_METHODS, BasePermission, DjangoModelPermissions,
)

ADMIN_GROUP = "ADMIN"
VIEWER_GROUP = "VIEWER"


class WritesEnabled(BasePermission):
    """Refuse every unsafe method while Django is not the writer.

    Prisma still owns ProjectLead: the public brief endpoint on Vercel is the
    only thing that creates a lead, and it is the only thing that should be
    changing one. Django reads the same table. Two writers against one table,
    with no coordination between them, is how a lead silently loses its
    status or gains someone else's note.

    So the read-only phase is enforced here rather than promised in a
    document. `LEADS_WRITE_ENABLED` is False by default (see settings/base),
    which means a settings module that forgets to mention it fails safe.

    This is a phase gate, not an authorisation rule — the ADMIN role really
    does hold `change_projectlead`, and will be able to use it the moment
    ownership moves. The distinct error code says exactly that, so an
    operator is told "not yet" rather than "you are not allowed".
    """

    message = "read_only_phase"

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return bool(getattr(settings, "LEADS_WRITE_ENABLED", False))


class StrictModelPermissions(DjangoModelPermissions):
    """DjangoModelPermissions, but reads are also permission-gated.

    DRF's stock class leaves GET unguarded, which would let any authenticated
    account — including one created for something unrelated — list every lead.
    Requiring `view_projectlead` closes that.
    """

    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": ["%(app_label)s.view_%(model_name)s"],
        "HEAD": ["%(app_label)s.view_%(model_name)s"],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }

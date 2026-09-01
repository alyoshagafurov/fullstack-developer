"""Account shapes.

The credential serializer is write-only in the strictest sense: it never
renders, so a password cannot be echoed back by any code path, including an
error response that happens to include the input.
"""

from __future__ import annotations

from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import serializers

from apps.leads.permissions import ADMIN_GROUP, VIEWER_GROUP


class CredentialsSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True,
                                     write_only=True)
    password = serializers.CharField(max_length=256, write_only=True,
                                     trim_whitespace=False,
                                     style={"input_type": "password"})


def describe_user(user: User) -> dict:
    """What the admin UI is allowed to know about the signed-in operator.

    Permissions are reported so the interface can render honestly — showing a
    viewer a status control that always fails would be worse than not showing
    it. This is a UI convenience and nothing more: the server checks the same
    permissions again on every mutating request, and that check is the one
    that matters.
    """
    groups = set(user.groups.values_list("name", flat=True))
    if user.is_superuser or ADMIN_GROUP in groups:
        role = ADMIN_GROUP
    elif VIEWER_GROUP in groups:
        role = VIEWER_GROUP
    else:
        role = None

    return {
        "username": user.get_username(),
        "role": role,
        "permissions": {
            "viewLeads": user.has_perm("leads.view_projectlead"),
            "changeLeads": user.has_perm("leads.change_projectlead"),
            # Reported so the UI can state the rule rather than imply it.
            # No role grants this, by design.
            "deleteLeads": user.has_perm("leads.delete_projectlead"),
        },
    }


def describe_server() -> dict:
    """Capabilities of the deployment, as distinct from the operator's rights.

    `writesEnabled` is not a permission. An ADMIN genuinely holds
    `change_projectlead`; what is switched off is the whole write path, for
    every role, because Prisma still owns the table. Keeping the two apart in
    the response lets the admin UI say "not yet" instead of "you may not",
    which are different sentences an operator will act on differently.
    """
    return {"writesEnabled": bool(getattr(settings, "LEADS_WRITE_ENABLED", False))}

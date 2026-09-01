"""Django Admin — emergency backoffice only.

This is the operations and debugging surface: somewhere to look when the API
or the custom admin UI is unavailable. It is explicitly NOT the product's
admin panel. The custom admin UI, built to the site's own design system, is
the next phase; nothing here should be mistaken for a finished interface.

Two constraints are enforced rather than assumed:

- Nothing the visitor submitted can be edited. Only `status` and
  `internalNote` are writable, matching the API.
- Leads cannot be created or deleted here. A lead is a record of a real
  enquiry; the admin is not a place to invent or destroy one.
"""

from __future__ import annotations

from django.contrib import admin

from .models import ProjectLead

_SUBMITTED_FIELDS = (
    "reference", "submission_id", "project_type", "project_type_other",
    "goal", "description", "functionality", "existing_url", "reference_links",
    "notes", "budget", "timeline", "name", "company", "email", "telegram",
    "whatsapp", "consent", "locale", "started_at", "completed_at",
    "created_at", "updated_at",
)


@admin.register(ProjectLead)
class ProjectLeadAdmin(admin.ModelAdmin):
    list_display = ("reference", "name", "project_type", "status", "created_at")
    list_filter = ("status", "project_type", "created_at")
    # Reference and email only — the same restraint as the API's search.
    search_fields = ("reference", "email")
    ordering = ("-created_at",)
    readonly_fields = _SUBMITTED_FIELDS
    fields = _SUBMITTED_FIELDS + ("status", "internal_note")

    def has_add_permission(self, request) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False

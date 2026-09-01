"""ProjectLead — the same table Prisma already defines.

This model is a mirror, not a redesign. Every column name, type, default,
unique constraint and index matches prisma/schema.prisma field-for-field, so
that Django and Prisma can address one database without either one migrating
the other's data. Anything that looked worth improving was left alone: the
point of this step is a safe transition, not a better schema.

Mapping notes, all of them deliberate:

- `db_table = "ProjectLead"` is quoted-case. Prisma created a capitalised
  table, and an unquoted `projectlead` would be a different table entirely.
- Every field carries an explicit `db_column`, because Django would otherwise
  snake_case them and silently miss the existing columns.
- Every text column is TextField, matching Prisma's TEXT. Length limits are
  domain rules and live in the serializer, mirroring LIMITS in
  lib/brief/schema.ts — not as varchar caps that would truncate silently.
- `id` is TEXT. Prisma fills it with cuid(); rows written by Django get a
  uuid4 hex. Both are opaque, never exposed, and never parsed by anything,
  so a mixed column is safe. It is recorded here because it is exactly the
  kind of difference that should not be discovered later.
"""

from __future__ import annotations

import uuid

from django.db import models

from .fields import LeadStatusField, PrismaDateTimeField


def new_lead_id() -> str:
    """Opaque primary key for rows this backend creates.

    Prisma's cuid() cannot be reproduced faithfully in Python, and imitating
    it would invent a format. A uuid4 hex is the same TEXT column, the same
    opacity, and no pretence of being a cuid.
    """
    return uuid.uuid4().hex


class LeadStatus(models.TextChoices):
    """Mirrors the PostgreSQL enum `LeadStatus` exactly, in order.

    NOTE — a documented discrepancy, not resolved here: CLAUDE.md describes
    the intended pipeline as NEW → CONTACTED → DISCOVERY → PROPOSAL →
    NEGOTIATION → WON/LOST, while the enum Prisma actually created ends
    IN_PROGRESS / COMPLETED / DECLINED. The database is the source of truth
    for this model, so the shipped enum is reproduced verbatim. Changing it
    is a schema decision for the owner, not something to slip in here.
    """

    NEW = "NEW", "New"
    CONTACTED = "CONTACTED", "Contacted"
    DISCOVERY = "DISCOVERY", "Discovery"
    PROPOSAL = "PROPOSAL", "Proposal"
    IN_PROGRESS = "IN_PROGRESS", "In progress"
    COMPLETED = "COMPLETED", "Completed"
    DECLINED = "DECLINED", "Declined"


class ProjectLead(models.Model):
    id = models.TextField(primary_key=True, default=new_lead_id, editable=False,
                          db_column="id")

    # Server-issued, human-quotable: ALY-2026-4F7K2. Shown to the client.
    reference = models.TextField(unique=True, db_column="reference")

    # Client-generated once per completed brief. A retry reuses it, so the
    # unique constraint turns a duplicate POST into a lookup rather than a
    # second lead.
    submission_id = models.TextField(unique=True, db_column="submissionId")

    # ── The brief itself ──────────────────────────────────────────────────
    project_type = models.TextField(db_column="projectType")
    project_type_other = models.TextField(default="", blank=True,
                                          db_column="projectTypeOther")
    goal = models.TextField(db_column="goal")
    description = models.TextField(db_column="description")
    functionality = models.TextField(default="", blank=True, db_column="functionality")
    existing_url = models.TextField(default="", blank=True, db_column="existingUrl")
    reference_links = models.TextField(default="", blank=True, db_column="referenceLinks")
    notes = models.TextField(default="", blank=True, db_column="notes")
    budget = models.TextField(db_column="budget")
    timeline = models.TextField(db_column="timeline")

    # ── Contact ───────────────────────────────────────────────────────────
    name = models.TextField(db_column="name")
    company = models.TextField(default="", blank=True, db_column="company")
    email = models.TextField(db_column="email")
    telegram = models.TextField(default="", blank=True, db_column="telegram")
    whatsapp = models.TextField(default="", blank=True, db_column="whatsapp")

    # The visitor agreed to be contacted about this brief. Stored as proof.
    consent = models.BooleanField(default=True, db_column="consent")

    # ── Provenance ────────────────────────────────────────────────────────
    locale = models.TextField(default="ru", db_column="locale")
    # Client clock, from the brief's own meta.
    started_at = PrismaDateTimeField(db_column="startedAt")
    completed_at = PrismaDateTimeField(db_column="completedAt")
    # Server clock. The one to trust.
    created_at = PrismaDateTimeField(auto_now_add=True, db_column="createdAt")
    updated_at = PrismaDateTimeField(auto_now=True, db_column="updatedAt")

    # ── Operator fields ───────────────────────────────────────────────────
    status = LeadStatusField(max_length=32, choices=LeadStatus.choices,
                             default=LeadStatus.NEW, db_column="status")
    # Private note for the owner. Never returned by the public API, and never
    # present on any serializer a non-admin can reach.
    internal_note = models.TextField(default="", blank=True, db_column="internalNote")

    class Meta:
        db_table = "ProjectLead"
        ordering = ["-created_at"]
        # NO `indexes` here, deliberately.
        #
        # The three indexes Prisma created are named
        # ProjectLead_status_createdAt_idx, ProjectLead_createdAt_idx and
        # ProjectLead_email_idx. Django refuses index names longer than 30
        # characters (models.E034) and the first of those is 32, so the exact
        # names cannot be declared on the model at all.
        #
        # Rather than rename them — which would make a Django-created schema
        # subtly different from the Prisma-created one — they are created by
        # the raw DDL in migration 0001, which is Prisma's own SQL verbatim.
        # PostgreSQL uses an index whether or not the ORM knows it exists, so
        # every query planned here still gets them. Keeping them out of the
        # model state also means Django can never try to DROP an index it
        # named differently from the one actually in the database.
        default_permissions = ("add", "change", "delete", "view")

    def __str__(self) -> str:
        # Reference only. A __str__ ends up in admin logs and error pages, so
        # it must not carry the client's name or email.
        return self.reference

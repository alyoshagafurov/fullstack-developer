"""Field types that have to match a schema Prisma created.

The `status` column is a real PostgreSQL enum type (`"LeadStatus"`), not a
varchar with a check constraint. Django has no native enum-type field, so this
maps onto the existing type rather than asking the database to change shape.
"""

from __future__ import annotations

from datetime import timezone as dt_timezone

from django.conf import settings
from django.db import models
from django.utils import timezone

# Quoted because Prisma created the type with a capital letter, and an
# unquoted identifier would be folded to lowercase by PostgreSQL.
LEAD_STATUS_DB_TYPE = '"LeadStatus"'


class PrismaDateTimeField(models.DateTimeField):
    """A timestamp column shaped the way Prisma shapes one.

    Prisma maps `DateTime` to `TIMESTAMP(3)` — millisecond precision, no time
    zone, values stored as UTC by convention. Django's DateTimeField would
    instead emit `timestamp with time zone`, so a table Django created and a
    table Prisma created would not be the same table. For a transition where
    both may address one database, that difference is not cosmetic.

    Writes need no special handling: with USE_TZ the connection's session time
    zone is UTC, so PostgreSQL converts an aware value to the right naive UTC
    instant on assignment.

    Reads do. A naive column hands back naive datetimes, which Django then
    warns about and mis-handles in comparisons. `from_db_value` stamps them
    back as UTC — restoring the meaning the column always had, rather than
    inventing one.
    """

    def db_type(self, connection) -> str:
        return "timestamp(3)"

    def from_db_value(self, value, expression, connection):
        if value is not None and settings.USE_TZ and timezone.is_naive(value):
            return value.replace(tzinfo=dt_timezone.utc)
        return value


class LeadStatusField(models.CharField):
    """A CharField stored in PostgreSQL's `LeadStatus` enum column.

    Two overrides do the work:

    - `db_type` makes generated DDL declare the enum type instead of varchar.
    - `get_placeholder` casts every bound parameter to the enum. Without it
      psycopg sends a plain text parameter and PostgreSQL refuses the
      comparison ("column is of type LeadStatus but expression is of type
      text"), because there is no implicit text→enum cast.
    """

    def db_type(self, connection) -> str:
        return LEAD_STATUS_DB_TYPE

    def rel_db_type(self, connection) -> str:
        return LEAD_STATUS_DB_TYPE

    def get_placeholder(self, value, compiler, connection) -> str:
        return f"%s::{LEAD_STATUS_DB_TYPE}"

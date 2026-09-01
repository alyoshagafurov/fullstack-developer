"""Seed the two operator roles.

Roles are Django groups holding model permissions, not a bespoke RBAC table:

    ADMIN   view_projectlead + change_projectlead
    VIEWER  view_projectlead

`delete_projectlead` is granted to nobody. A lead records a real enquiry and
nothing in the product needs to destroy one; if that ever changes it should be
a deliberate migration, not a permission that was lying around.

Reversible: the reverse operation removes exactly the two groups this creates.
It does not touch users, and it does not touch permissions — those belong to
the model, not to this migration.
"""

from __future__ import annotations

from django.apps import apps as global_apps
from django.contrib.auth.management import create_permissions
from django.db import migrations

ROLE_PERMISSIONS = {
    "ADMIN": ("view_projectlead", "change_projectlead"),
    "VIEWER": ("view_projectlead",),
}


def create_roles(apps, schema_editor):
    # Model permissions are normally created by a post_migrate signal, which
    # has not fired yet at this point in the run. Without this the groups
    # below would be created holding nothing — a role that looks present and
    # grants no access, which is worse than a hard failure.
    create_permissions(global_apps.get_app_config("leads"), apps=apps, verbosity=0)

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    ContentType = apps.get_model("contenttypes", "ContentType")

    content_type, _ = ContentType.objects.get_or_create(
        app_label="leads", model="projectlead"
    )

    for role, codenames in ROLE_PERMISSIONS.items():
        group, _ = Group.objects.get_or_create(name=role)
        perms = list(
            Permission.objects.filter(
                content_type=content_type, codename__in=codenames
            )
        )
        # If the permissions are not present yet the migration must not
        # silently create a group with no rights — that would look like a
        # working role and grant nothing.
        if len(perms) != len(codenames):
            missing = set(codenames) - {p.codename for p in perms}
            raise RuntimeError(f"missing permissions for {role}: {sorted(missing)}")
        group.permissions.set(perms)


def remove_roles(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=ROLE_PERMISSIONS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("leads", "0001_initial"),
        ("auth", "0012_alter_user_first_name_max_length"),
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.RunPython(create_roles, remove_roles),
    ]

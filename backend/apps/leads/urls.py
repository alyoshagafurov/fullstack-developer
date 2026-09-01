"""URL map for the leads app.

    POST   /api/v1/brief                      public, unauthenticated
    GET    /api/v1/admin/leads                authenticated + view permission
    GET    /api/v1/admin/leads/<reference>    authenticated + view permission
    PATCH  /api/v1/admin/leads/<reference>    authenticated + change permission

The `admin/` prefix is naming only — it grants nothing. Every route under it
is protected by the viewset's permission classes, not by its path.
"""

from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminLeadViewSet, BriefIntakeView

router = DefaultRouter()
router.register("leads", AdminLeadViewSet, basename="admin-lead")

urlpatterns = [
    path("brief", BriefIntakeView.as_view(), name="brief-intake"),
    path("admin/", include(router.urls)),
]

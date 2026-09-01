"""Auth routes.

    GET  /api/v1/auth/csrf     public — issues a CSRF token
    POST /api/v1/auth/login    public, throttled
    POST /api/v1/auth/logout   authenticated
    GET  /api/v1/auth/me       authenticated
"""

from __future__ import annotations

from django.urls import path

from .views import CsrfView, LoginView, LogoutView, MeView

urlpatterns = [
    path("csrf", CsrfView.as_view(), name="auth-csrf"),
    path("login", LoginView.as_view(), name="auth-login"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("me", MeView.as_view(), name="auth-me"),
]

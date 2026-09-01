"""Session authentication for the admin UI.

Django's own session machinery, unchanged: `authenticate()` verifies the
password against PBKDF2, `login()` issues the session, `logout()` flushes it.
No JWT, no custom crypto, no token invented here.

The caller is always the Next.js server, never a browser — the admin UI talks
to Next.js, which forwards the session on. That is why the session cookie's
lifetime is managed there and why nothing in this module writes a credential
to a response.

Nothing here logs a username or a password. A failed login records only that
one occurred.
"""

from __future__ import annotations

import logging

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CredentialsSerializer, describe_server, describe_user
from .throttling import LoginRateThrottle

logger = logging.getLogger(__name__)


class CsrfView(APIView):
    """Hand out a CSRF token.

    DRF's SessionAuthentication enforces CSRF on every authenticated unsafe
    request, so the proxy needs a token before it can PATCH anything. Calling
    `get_token` both returns the value and sets the cookie.
    """

    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"ok": True, "csrfToken": get_token(request)})


class LoginView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = CredentialsSerializer(data=request.data)
        if not serializer.is_valid():
            # Deliberately not the serializer's field errors: naming which
            # field was malformed is a small hint, and there is nothing a
            # legitimate caller can do with it that a generic code does not
            # already tell them.
            return Response({"ok": False, "error": "invalid_credentials"},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        # One answer for "no such user", "wrong password" and "account
        # disabled". Distinguishing them turns the endpoint into a way to
        # enumerate accounts.
        if user is None or not user.is_active:
            logger.warning("[auth] failed login")
            return Response({"ok": False, "error": "invalid_credentials"},
                            status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        return Response({"ok": True, "user": describe_user(user),
                         "server": describe_server(),
                         "csrfToken": get_token(request)})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"ok": True})


class MeView(APIView):
    """Who is signed in. The gate the admin layout consults on every request."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"ok": True, "user": describe_user(request.user),
                         "server": describe_server()})

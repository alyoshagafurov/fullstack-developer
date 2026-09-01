"""Login attempt limiting.

A password endpoint that answers unlimited attempts is a password endpoint
that will eventually be guessed. Ten tries per five minutes per client leaves
a real operator who mistypes twice unaffected and makes bulk guessing
pointless.
"""

from __future__ import annotations

from apps.throttling import WindowedRateThrottle


class LoginRateThrottle(WindowedRateThrottle):
    scope = "login"

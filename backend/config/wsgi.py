"""WSGI entry point.

No settings default here on purpose: a WSGI server must be told which settings
module to use, so a production deploy cannot silently fall back to
development.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

application = get_wsgi_application()

#!/usr/bin/env python
"""Django management entry point.

Defaults to the development settings module. Production must set
DJANGO_SETTINGS_MODULE=config.settings.production explicitly, so a
misconfigured deploy fails loudly instead of silently running with DEBUG.
"""

import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()

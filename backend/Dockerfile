# Portable image.
#
# Railway and Render can build this project without a Dockerfile, from
# requirements.txt and the Procfile alone. This exists so the hosting
# decision stays reversible: Fly.io and a plain VPS both need an image, and
# having one means moving hosts is a redeploy rather than a rewrite. It also
# pins the Python version, which nixpacks otherwise infers.

FROM python:3.13-slim AS base

# PYTHONDONTWRITEBYTECODE: no .pyc in a read-only-ish container.
# PYTHONUNBUFFERED: logs reach the platform's stream immediately rather than
# sitting in a buffer when the process is killed.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# psycopg[binary] ships its own libpq, so no build toolchain is needed.
# curl is here only for the container-level healthcheck below.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Dependencies first: this layer is cached until requirements.txt changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Static files are baked into the image so a container can serve Django Admin
# without a writable volume. A dummy key is used because collectstatic reads
# settings and production.py refuses to import without one — it is discarded
# with this build step and never reaches a running container.
ENV DJANGO_SETTINGS_MODULE=config.settings.production
RUN DJANGO_SECRET_KEY=build-time-only-not-a-runtime-secret \
    DJANGO_ALLOWED_HOSTS=build.invalid \
    DATABASE_URL=postgres://build:build@localhost/build \
    python manage.py collectstatic --noinput

# Never run as root: a container escape should not start with root in it.
RUN useradd --system --uid 10001 --no-create-home aly \
    && chown -R aly:aly /app
USER aly

EXPOSE 8000

# Liveness only — see apps/health.py for why this must not touch the
# database. A database blip should not cause the orchestrator to restart a
# perfectly healthy process.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/health/live || exit 1

# Migrations are NOT run here. See the Procfile and docs/DEPLOYMENT.md: the
# first adoption of the Prisma-created schema is a manual, checked step.
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2} --threads 4 --timeout 30 --graceful-timeout 30 --forwarded-allow-ips=* --error-logfile -"]

# Deployment — Django backend

Status: **prepared, not deployed.** Everything in this document has been
written and verified locally. Nothing has been provisioned, because doing so
needs accounts and payment that only the owner can authorise.

---

## 1. Hosting decision

**Django on Railway. PostgreSQL on Neon.**

Two providers rather than one, and that split is the important part of the
decision — not a preference between dashboards.

### Why the database is not on the app host

During the transition, **two systems must reach the same database**:

```
Vercel  ── Prisma ──┐
                    ├──► one PostgreSQL
Railway ── Django ──┘
```

Prisma on Vercel is still the only writer. Django reads the same table. A
database that lives inside one platform's private network is reachable by
that platform and nothing else, so putting Postgres inside Railway would
either cut Vercel off or force the database onto a public TCP proxy — the
worse of both options.

Neon is built for exactly this: a public TLS endpoint, connection pooling,
and a free tier that comfortably holds a portfolio's lead volume. `CLAUDE.md`
already anticipated it ("Neon / Vercel Postgres"), so this is consistent with
a decision the owner already made.

### Why Railway for the application

| | Railway | Render | Fly.io | VPS |
|---|---|---|---|---|
| Django 6.1 / Python 3.13 | yes | yes | yes | yes |
| Deploy from GitHub | yes | yes | needs CLI/CI | manual |
| HTTPS + certificate | automatic | automatic | automatic | **you renew it** |
| Health checks | built in | built in | built in | you write them |
| Logs | built in | built in | built in | you ship them |
| Needs a Dockerfile | no | no | yes | yes |
| Free tier trap | — | **Postgres expires at 90 days**; web service sleeps | — | — |
| Cost | ~$5/mo | ~$14/mo (web + db) | ~$5/mo | $4–6/mo + your time |
| Ops burden | near zero | near zero | moderate | **all of it** |

- **Render** was the closest runner-up and is a fine choice; it loses on the
  free-tier Postgres expiring after 90 days, which is a data cliff, and on
  costing roughly double once paid.
- **Fly.io** is more capable than this project needs. It wants a Dockerfile,
  regions and volumes for a service that will handle a few requests a day.
- **A VPS** is cheapest on paper and the most expensive in practice: you own
  patching, certificate renewal, backups and log rotation for a CRM one
  person opens twice a week.

Railway wins on the thing that actually matters here — one person, low
traffic, and no appetite for operations.

**The Dockerfile is committed anyway.** Railway does not need it, but Fly and
a VPS do, so the decision stays reversible: changing host becomes a redeploy
rather than a rewrite.

### Not decided here

Payment method and region are the owner's. Railway bills in USD via card;
if that is awkward from Dushanbe, **Render** is the drop-in alternative and
the same `Procfile` and `Dockerfile` work unchanged.

## 2. Environment variables

No real value appears in this repository or this document. Everything below
is set in the platform's own environment UI.

### Django service (Railway)

| Variable | Purpose | Where | Required |
|---|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Must be `config.settings.production`. Anything else means DEBUG or a generated key. | Railway → Variables | **yes** |
| `DJANGO_SECRET_KEY` | Signs sessions and CSRF tokens. Rotating it logs everyone out. | Railway → Variables | **yes** |
| `DATABASE_URL` | Neon connection string. Must carry `?sslmode=require`. | Railway → Variables | **yes** |
| `DJANGO_DATABASE_URL` | Overrides `DATABASE_URL` when Django must use a different role or a read replica. | Railway → Variables | no |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hostnames Django will answer on. | Railway → Variables | **yes** |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Comma-separated origins with scheme, e.g. `https://aly.lat`. Needed only if the admin UI is on another host. | Railway → Variables | no |
| `DJANGO_ADMIN_PATH` | Moves Django Admin off `/admin/`. Cheap, and removes a whole class of drive-by scans. | Railway → Variables | recommended |
| `DJANGO_TRUSTED_PROXY_DEPTH` | **Set to `1`** for the current Railway topology. Decides which `X-Forwarded-For` entry the rate limits may believe — see below. | Railway → Variables | recommended |
| `LEADS_WRITE_ENABLED` | **Leave unset.** Setting it to `true` makes Django a writer, which is P11, not now. | Railway → Variables | no |
| `DJANGO_DB_POOLED` | `true` when pointing at a transaction-pooled endpoint (Neon's pooler). Disables server-side cursors. | Railway → Variables | no |
| `WEB_CONCURRENCY` | Gunicorn workers. Default 2 is right for this size. | Railway → Variables | no |

#### `DJANGO_TRUSTED_PROXY_DEPTH=1`

`1` is not a default; it is the count of proxies that actually sit between a
client and gunicorn on this deployment, and it was measured rather than
assumed:

- Gunicorn takes `REMOTE_ADDR` from the socket peer and never from
  `X-Forwarded-For` (`gunicorn/http/wsgi.py`, the `REMOTE_*` block). The
  `--forwarded-allow-ips=*` flag in `railway.json` governs only
  `wsgi.url_scheme`. So without this variable Django sees Railway's edge as
  the client, and every caller shares one rate-limit bucket — ten failed
  logins from anyone would pause the login endpoint for everyone.
- The production response headers carry `server: railway-hikari` and
  `x-railway-edge: ams1`, and **no `cf-ray`** — no CDN terminates the
  connection. Exactly one proxy, so exactly one trusted `X-Forwarded-For`
  entry.

`1` is correct whether Railway's edge appends to a caller-supplied header or
replaces it: the right-most entry is the one the edge wrote either way.

**Raise this only when a proxy is genuinely added** — a CDN in front of the
Railway service, or a second gateway. Setting it higher than the real number
of proxies is worse than leaving it at `0`: an over-count reads an entry the
caller supplied as though a trusted proxy had written it, which hands the
rate-limit key back to whoever is being limited.

### Next.js (Vercel)

| Variable | Purpose | Where | Required |
|---|---|---|---|
| `DJANGO_API_URL` | Where the server-side admin adapter reaches Django. **Server-only — never `NEXT_PUBLIC_*`.** | Vercel → Environment Variables | for /admin |
| `DATABASE_URL` | Prisma's connection to the same Neon database. Still the production writer. | Vercel → Environment Variables | for /api/brief |

`DJANGO_SECRET_KEY` and `DJANGO_DATABASE_URL` are never set on Vercel — the
Next.js side has no business holding them.

## 3. First deploy — the exact sequence

### What the owner must do (I cannot, and did not)

1. **Create a Neon project** and a database. Copy the pooled connection
   string; it already ends in `?sslmode=require`.
2. **Create a Railway project** from the GitHub repo, root directory
   `backend/`.
3. **Set the variables** from the table above.
4. **Deploy.** The build runs `pip install` and `collectstatic`; it does
   **not** migrate.
5. **Adopt the schema** — see §4. Applies to a *new* database only. The
   current production database is already migrated; skip this for it.
6. **Create the first operator** — see §5.
7. **Set `DJANGO_API_URL` on Vercel** to the Railway URL and redeploy.

Steps 1–3 need accounts and a payment method. They are the blocker.

This sequence is the record of how a deployment is built from nothing. The
live deployment has already been through it — see §4 for what its database
actually looks like now and what must not be re-run against it.

## 4. The schema

### Current production: already provisioned. Run nothing.

**The production Neon database is fully migrated. There is no migration step
left to perform, and none of the commands in this section should be run
against it.** Verified by read-only introspection on 2026-09-01:

| Checked | Result |
| --- | --- |
| `ProjectLead` | exists, 26 of 26 columns, same order, same types |
| `LeadStatus` enum | 7 labels, same order |
| Indexes | 6 of 6 present, under Prisma's names |
| Triggers / stray constraints | none |
| `django_migrations` | every migration applied; `showmigrations` shows no `[ ]` |
| `_prisma_migrations` | `20260831000000_init_project_lead` recorded, finished, not rolled back |
| Destructive drift | none |

So, concretely, for the database that is live right now:

- **Do not run `prisma migrate deploy`.** `_prisma_migrations` already records
  the migration as applied. The command has nothing to do, and an earlier note
  recommending it was written when the table was genuinely absent — that
  situation no longer exists.
- **Do not run `manage.py migrate leads 0001 --fake`.** It is already recorded
  as applied. It is a procedure for a *fresh* environment (below), never a
  step to repeat against this one.
- **Do not re-create `ProjectLead` by any route** — not through Prisma, not
  through Django, not by hand. Both migrations are capable of creating the
  whole schema, and running either against a database that already has it
  fails at best and destroys data at worst.

### Why there are two migrations for one table

The same DDL exists twice, deliberately, and the two copies are kept
consistent:

- `prisma/migrations/20260831000000_init_project_lead/migration.sql` — the
  Prisma migration.
- `backend/apps/leads/migrations/0001_initial.py` — the same SQL, verbatim,
  inside `SeparateDatabaseAndState(database_operations=[RunSQL(...)])`, with
  the Django model declared in `state_operations`.

Prisma is the writer: leads are created by the public brief route on Vercel.
Django reads the same table, and `LEADS_WRITE_ENABLED` is `False` so it cannot
write to it. Django's copy of the DDL exists so a database can be built from
either side — **exactly one of them may ever run against a given database.**

How production got here, for the record, since it is not what the sequence
below describes: Django's `0001` ran for real and created the schema, and the
Prisma journal was afterwards reconciled with `prisma migrate resolve
--applied` (its row carries `applied_steps_count = 0`, whereas a migration
Prisma actually executed records `1`). The end state is consistent and
correct; it simply arrived by the mirror image of the recipe below.

### Fresh environment only: adopting a schema Prisma created

Everything from here applies to a **new** database — a staging environment, a
rebuild, a Neon branch — where Prisma has created the schema and Django has
never been pointed at it. It does not apply to current production.

`migrate --fake-initial` does **not** work in that situation, and this was
verified rather than assumed: migration `0001_initial` wraps its `CreateModel`
inside `SeparateDatabaseAndState`, and Django's soft-apply detection only
looks for a top-level `CreateModel`. It therefore concludes the migration is
unapplied, runs the raw SQL, and fails with `type "LeadStatus" already exists`.

```bash
# Only against a NEW database whose schema Prisma built. Never production.

# 1. Look before touching. Confirm the table is the one you think it is.
psql "$DATABASE_URL" -c '\d "ProjectLead"'

# 2. Back up. Neon has branching; a branch is a free instant backup.
#    Otherwise: pg_dump "$DATABASE_URL" > backup-$(date +%F).sql

# 3. Dry run. Shows what WOULD be applied, changes nothing.
python manage.py migrate --plan

# 4. Adopt: record 0001 as applied WITHOUT running any DDL.
python manage.py migrate leads 0001 --fake

# 5. Apply the rest (auth, sessions, and leads 0002 which seeds the roles).
python manage.py migrate

# 6. Verify the schema is byte-identical to before.
psql "$DATABASE_URL" -c '\d "ProjectLead"'
```

Verified locally against a database built from
`prisma/migrations/20260831000000_init_project_lead/migration.sql` alone: the
`ProjectLead` DDL was **identical before and after**, and Django then read
through the enum column, the email index and the timestamp columns correctly.

### Never

- `migrate reset` — drops every table.
- Any migration command against current production. It is already migrated;
  see the top of this section.
- On a fresh Prisma-built database: `migrate` without the `--fake` step first
  — fails, and would create DDL if it did not.
- `makemigrations` against production — generates a migration from drift
  instead of telling you drift exists.
- Any migration that alters `ProjectLead` while Prisma still owns it.

### Rollback

Migration `0001` is reversible (`migrate leads zero` drops the table and the
enum) — **which is exactly why it must never be run against real data.** The
rollback for the adoption step is not a reverse migration; it is:

```sql
DELETE FROM django_migrations WHERE app = 'leads';
```

That un-records the adoption and leaves the schema untouched, because
adoption never touched it. Note that this is the rollback for a *fake*
adoption. Production's `leads.0001` really did create the schema, so there the
same statement would un-record a migration whose DDL is still in place — which
is a lie to Django, not a rollback.

## 5. The first operator account

**Not created automatically, and not by me.** A superuser committed with a
known password is a backdoor, and one created by an automated step is a
password somebody has to find in a log.

The owner runs, once, from the Railway shell:

```bash
python manage.py createsuperuser
```

Then adds the account to the `ADMIN` group — the group already exists,
created by migration `0002_roles`:

```bash
python manage.py shell -c "
from django.contrib.auth.models import Group, User
User.objects.get(username='<the-username>').groups.add(Group.objects.get(name='ADMIN'))
"
```

Roles: `ADMIN` (view + change), `VIEWER` (view only). Nobody gets delete.

## 6. Security posture in production

Verified with `manage.py check --deploy` (no issues) and by running the real
production settings under gunicorn.

| Control | Setting | Verified |
|---|---|---|
| DEBUG | `False` | yes |
| HTTPS redirect | `SECURE_SSL_REDIRECT`, `SECURE_PROXY_SSL_HEADER` | 301 without `X-Forwarded-Proto` |
| HSTS | 2 years, subdomains, preload | yes |
| Session cookie | `Secure`, `HttpOnly`, `SameSite=Lax` | yes |
| CSRF cookie | `Secure`, `SameSite=Lax` | yes |
| CSRF enforcement | DRF SessionAuthentication | a PATCH without `X-CSRFToken` is 403 |
| Password hashing | Django PBKDF2, no custom crypto | yes |
| Login throttling | 10 per 5 minutes per client | yes |
| Account enumeration | one answer for all failures | yes |
| Write path | `LEADS_WRITE_ENABLED=False` | ADMIN PATCH is 403 `read_only_phase` |
| Delete | granted to no role, no route | 403 |

### CORS is deliberately absent

No CORS package is installed and none should be. The browser never talks to
Django: it talks to Next.js, which talks to Django server-side. Adding CORS
would open a browser-reachable path that the architecture does not have, in
order to solve a problem it does not have.

If Django is ever reached from a browser directly, that is an architecture
change to be discussed — not a header to add.

### Network exposure

Railway gives the service a public URL. The only legitimate caller is the
Next.js server on Vercel. Two hardening options, in order of preference:

1. **Shared secret header** between Vercel and Django, checked by middleware.
   Small, no new infrastructure. Not implemented — it needs a secret, which
   is the owner's to create.
2. **IP allow-list** — impractical: Vercel's egress addresses are not stable
   without their Secure Compute add-on.

Until one exists, the API is protected by authentication alone. That is
adequate — every lead route requires a session and a permission, and the
health endpoints expose nothing — but it is a real, named residual risk.

## 7. Health checks

| Endpoint | Checks | Used by |
|---|---|---|
| `/health/live` | process is up. **No database query.** | Railway healthcheck, Docker HEALTHCHECK |
| `/health/ready` | process is up *and* `SELECT 1` succeeds | manual / uptime monitor |

They are separate on purpose. A liveness probe that touches the database
turns a five-second database blip into a restart loop.

Both are unauthenticated, so both bodies are public: they return
`{"status":"ok"}` and nothing about the version, host, settings or database.

## 8. Database connection

- `CONN_MAX_AGE = 60` — persistent connections; a managed Postgres charges
  for connection churn.
- `CONN_HEALTH_CHECKS = True` — a connection the server closed is revalidated
  instead of failing the next request.
- `connect_timeout = 10` — a hung TCP connect otherwise occupies a worker.
- `sslmode` is read from the URL and honoured. Dropping it, as the earlier
  parser silently did, would have downgraded production to plaintext.
- `DJANGO_DB_POOLED=true` disables server-side cursors, required behind a
  transaction pooler.

**Redis was not added.** The rate limit therefore counts per process: with
`WEB_CONCURRENCY=2` a determined attacker gets up to twice the budget. That
is the same honest limitation `lib/rate-limit.ts` documents on the Vercel
side, it is acceptable for the traffic this endpoint sees, and `CACHES` is
the single setting that fixes it when it stops being acceptable.

## 9. Logging

One line per failed or slow request: method, path, status, duration,
exception class, request id.

Never logged: query strings, bodies, headers, cookies, session values, or
any field of a lead. The query-string exclusion is not decorative — the admin
register puts the operator's search term in the URL, and operators search by
client email.

Gunicorn's own access log is **switched off** for the same reason: it records
the full request line including the query string.

`X-Request-Id` is echoed on every response and honoured from upstream, so one
request can be followed from Vercel through to Django.

## 10. What is NOT done

- Nothing is provisioned. No account, no database, no domain, no deploy.
- No production migration has been run.
- Django is not a writer and must not become one in this phase.
- Prisma remains the source of truth for every write.

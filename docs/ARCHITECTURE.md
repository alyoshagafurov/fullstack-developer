# Architecture — Aly Portfolio 2.0

Status: **transition prepared, not begun.** The Django backend in `backend/`
is a foundation. Nothing in production calls it, and Prisma remains the only
thing that stores a lead.

---

## 1. Current architecture (in production today)

```
Browser ──► Next.js 14 (Vercel)
              ├── public portfolio
              ├── Project Brief UI  (components/brief/ProjectBriefFlow.tsx)
              └── POST /api/brief   (app/api/brief/route.ts)
                        │
                        ▼
                  Prisma 6.19.3
                        │
                        ▼
                  PostgreSQL  ← NOT PROVISIONED
```

`DATABASE_URL` has never been set. `getPrisma()` returns `null`, the endpoint
answers **501 `backend_not_configured`**, and the UI tells the visitor their
brief was *not* saved. So today the site collects no leads at all — and, more
usefully for this transition, **there is no production data to migrate.**

## 2. Target architecture

```
Browser ──► Next.js (Vercel)              Browser ──► Next.js /admin/*
              │ public portfolio                        │ custom admin UI
              │ Project Brief UI                        │
              ▼                                         ▼
        POST /api/brief  ────────────┐        /api/admin/* (server-side proxy)
        (edge: size, honeypot,       │                    │
         rate limit, validation)     │                    │
                                     ▼                    ▼
                          Django 6.1 + DRF  ────────────────────
                                     │  /api/v1/brief
                                     │  /api/v1/admin/leads
                                     │  auth · permissions · domain ops
                                     ▼
                               PostgreSQL
```

Django Admin (`/django-admin/`) stays mounted as an **emergency backoffice**:
somewhere to look when the API or the custom UI is down. It is not the
product's admin panel and must not be treated as a finished interface.

### Why the browser never talks to Django directly

The admin UI calls Next.js, which calls Django server-side. This costs one hop
and buys three things: no CORS configuration, no cross-origin session cookies
(no `SameSite=None`), and no Django credential ever reaching client JavaScript.
It is also why **no CORS package is installed** — that is a deliberate absence,
not an oversight.

## 3. Why Django

Recorded honestly, because it reverses a decision:

`CLAUDE.md` → DECISIONS §1 states *"Backend stack = Next-native (DECIDED)…
NOT Django."* The owner reversed this when the admin/CRM surface came into
scope. The case for Django is the admin surface specifically: session auth,
model permissions, groups, and a working backoffice arrive built and audited
rather than hand-rolled.

The cost is equally concrete and is **not yet paid**:

| Cost | Detail |
|---|---|
| Second host | Vercel does not run Django. Needs Railway / Fly / Render / a VPS. |
| Second deploy | Two pipelines, two rollbacks, two sets of env vars. |
| Network hop | `/api/brief` becomes Next → Django → Postgres. |
| Two validators | The brief's rules now exist in TypeScript *and* Python and must stay in step. |

That last one is real coupling: `lib/brief/schema.ts` and
`backend/apps/leads/domain.py` hold the same option lists. Adding a project
type in one without the other means the wizard offers something the API
rejects.

## 4. Data model

One table, `ProjectLead`, defined by Prisma and **mirrored** by Django. The
Django model changes nothing: same table name (quoted-case), same column names
via explicit `db_column`, same types, same defaults, same constraints, same
index names.

Migration `backend/apps/leads/migrations/0001_initial.py` uses
`SeparateDatabaseAndState`: the database half is Prisma's `migration.sql`
**verbatim**, the Django half is the matching model state. Verified by
diffing `pg_dump` of a Django-migrated database against a Prisma-migrated one
— identical.

Three mapping details that had to be solved rather than assumed:

| Issue | Resolution |
|---|---|
| `status` is a real PG enum `"LeadStatus"` | `LeadStatusField` overrides `db_type` **and** `get_placeholder` to cast every bound parameter — psycopg otherwise sends text and PostgreSQL refuses (no implicit text→enum cast). |
| Prisma uses `TIMESTAMP(3)`, Django defaults to `timestamptz` | `PrismaDateTimeField` declares `timestamp(3)` and stamps reads back as UTC in `from_db_value`. |
| `ProjectLead_status_createdAt_idx` is 32 chars | Django caps index names at 30 (`models.E034`). The indexes are created by the raw DDL and deliberately left out of `Meta.indexes`, so Django can never try to drop an index it named differently. |

### Open questions — surfaced, not decided

1. **Status enum mismatch.** `CLAUDE.md` describes the pipeline as
   NEW → CONTACTED → DISCOVERY → PROPOSAL → **NEGOTIATION → WON/LOST**. The
   enum Prisma actually shipped ends **IN_PROGRESS / COMPLETED / DECLINED**.
   The database was treated as the source of truth. Reconciling them is a
   schema decision for the owner.
2. **`deadline` does not exist.** The column is `timeline`, and it holds a
   *range* (`asap`, `w1_2`, `m1_2`, `flexible`, `unsure`), not a date.
3. **Primary-key format will be mixed.** Prisma writes `cuid()`; Django writes
   `uuid4().hex`. Both opaque TEXT, never exposed, never parsed — safe, but
   worth knowing before someone assumes a format.

## 5. API ownership

| Surface | Owner today | Owner at the end |
|---|---|---|
| `POST /api/brief` | Next.js route + Prisma | Next.js edge → Django `/api/v1/brief` |
| Lead reads/writes | nothing (no admin exists) | Django `/api/v1/admin/leads` |
| Schema / migrations | Prisma | Django |
| Reference issuing | `lib/brief/reference.ts` | `backend/apps/leads/reference.py` |

Both reference generators produce the identical format; the Python one uses
`secrets` instead of `Math.random()`, which is a strengthening, not a change.

### Public contract — unchanged in every phase

```
201  { "ok": true, "reference": "ALY-2026-XXXXX" }
200  { "ok": true, "reference": "ALY-2026-XXXXX", "duplicate": true }
422  { "ok": false, "error": "validation", "fieldErrors": { … } }
415 · 413 · 400 · 202 (honeypot) · 429 · 501 · 503
```

The `fieldErrors` codes (`required`, `tooShort`, `pickOne`, `url`, `email`,
`consent`) are load-bearing: the wizard maps them back onto steps. Changing
one is a breaking UI change.

## 6. Authentication and authorisation

**Session authentication**, considered first and chosen. Django's own
`django.contrib.auth`, PBKDF2 password hashing, no custom crypto. JWT was not
adopted: it buys stateless verification this system has no use for, and costs
token storage in the browser plus a revocation story.

Authorisation is Django model permissions bundled into two groups, seeded by
migration `0002_roles`:

| Role | Permissions | Can |
|---|---|---|
| `ADMIN` | `view_projectlead`, `change_projectlead` | read leads, move status, write internal notes |
| `VIEWER` | `view_projectlead` | read only |

`delete_projectlead` is granted to **nobody**. A lead records a real enquiry.

`StrictModelPermissions` additionally gates GET on `view_projectlead` — DRF's
stock `DjangoModelPermissions` leaves reads open, which would let any
authenticated account list every lead.

Roles are data, so a third role is a migration and a group, with no code
change.

## 7. Security posture

Carried over from the Next.js boundary and re-implemented rather than trusted:

- **Pipeline order preserved**: content-type → size cap → parse → honeypot →
  rate limit → normalise → validate → idempotency → insert. DRF would run
  throttling first, so automatic throttling is off and the throttle is invoked
  by hand at the right point.
- **Rate limit**: 5 per 10 minutes. `BriefRateThrottle.parse_rate` widens DRF's
  grammar, which cannot express a multi-unit window. It **cannot be disabled by
  settings** — `DEFAULT_THROTTLE_CLASSES: []` does not switch it off.
- **Error sanitisation**: every exception becomes `{ok: false, error: <code>}`.
  No exception text, no SQL, no stack trace, no ORM internals.
- **Logging**: exception *class names* only. `str(exc)` on a database error can
  quote the failing statement, and the failing statement contains the brief.
- **`internalNote`** appears in exactly one serializer, reachable only behind
  authentication plus `view_projectlead`.
- **Leads are immutable**: only `status` and `internalNote` are writable, in
  the API and in Django Admin alike.

## 8. Transition plan

| Phase | State | Exit condition |
|---|---|---|
| **A** *(now)* | Prisma is the source of truth. Django exists, is tested, serves no traffic. | Foundation reviewed and accepted. |
| **B** | Django provisioned on a host, pointed at the same database, read-only. | Django can read leads Prisma wrote. |
| **C** | Django becomes the source of truth for writes. Django owns migrations. | Brief writes go through Django in staging. |
| **D** | Next.js `/api/brief` becomes a thin proxy to Django; admin UI built. | Public contract verified unchanged. |
| **E** | Prisma removed: `@prisma/client`, `prisma`, `lib/prisma.ts`, `prisma/`. | No import of Prisma remains. |

**Prisma may not be removed before Phase E**, and Phase E may not begin while
`/api/brief` still imports `lib/prisma.ts`.

### Why this order

Because there is no production data, B and C are unusually cheap — there is
nothing to copy and nothing to lose. The risk sits entirely in D, where the
public contract changes hands. That is why D comes after Django has already
proven it can write correctly, and why the contract tests exist.

### Rollback

| Phase | Rollback |
|---|---|
| A | Delete `backend/`. Nothing else references it. |
| B | Stop the Django process. Prisma is untouched. |
| C | Point writes back at Prisma. Schemas are identical, so no data conversion. |
| D | Revert the Next.js route to its Prisma implementation (one file, in git). |
| E | Irreversible without a revert commit — do it last, and only once D is stable. |

### Data migration

There is none to perform. If a Prisma-created database is later adopted:

```bash
python manage.py migrate leads 0001 --fake   # adopt, run no DDL
python manage.py migrate                     # apply the rest
```

`--fake` records the migration as applied without touching the schema.

**Not `--fake-initial`.** It looks like the right flag and is not: Django's
soft-apply detection only recognises a top-level `CreateModel`, which
`SeparateDatabaseAndState` hides, so it runs the raw SQL and fails on the
already-existing enum type. Verified in P10 against a Prisma-built database.

Never `migrate reset`; never a bare `migrate` before the `--fake` step. The
full procedure, with the backup and dry-run steps around it, is in
[DEPLOYMENT.md](DEPLOYMENT.md).

## 9. The admin UI

Built in P9. Next.js routes under `/admin`, talking only to Next.js.

```
/admin                     dashboard — pipeline ledger + newest briefs
/admin/leads               register — search, filters, sort, pagination
/admin/leads/[reference]   one lead — the brief as a document + operator rail
/admin/login               sign in
```

### How a request flows

```
browser ──► /admin/*            (server components, no data in the bundle)
        └─► /api/admin/*        (route handlers: session, PATCH)
                  │
                  ▼
            lib/admin-api/       server-only adapter — the ONLY caller of Django
                  │  forwards the operator's Django session + CSRF token
                  ▼
            Django /api/v1/*
```

The browser never holds a Django credential. Signing in posts to
`/api/admin/session`, which forwards to Django server-side and stores the
returned `sessionid` in an **httpOnly** cookie the page script cannot read.
Nothing goes in `localStorage`.

### Where authorisation actually lives

Three layers, and only one of them is security:

| Layer | What it does | Is it security? |
|---|---|---|
| Sidebar / disabled controls | hides what a role cannot use | **No** — cosmetic |
| `(workspace)/layout.tsx` gate | redirects anonymous to login | Helpful, not sufficient |
| Django permissions | refuses the request | **Yes** — this is the one |

Verified against a real Django instance, not asserted: a VIEWER's PATCH
returns **403 from the server**, and an ADMIN's attempt to rewrite `email` or
`reference` succeeds as a request but changes neither column, because the
serializer marks them read-only.

### What the admin cannot do

No delete, anywhere — no role holds `delete_projectlead`, there is no DELETE
route, and Django Admin has `has_delete_permission` returning False. Only
`status` and `internalNote` are writable; the brief itself is a record.

### Design

Same tokens, different instrument. The public site is an editorial spread —
enormous type, held silence. A CRM is scanned, so the serif survives only
where a number *is* the content (the total, the reference), Onest carries
everything functional, and `#00ADB5` appears on about two elements per screen.
Scoped to `app/admin/admin.css`, imported by the admin layout alone;
`globals.css` and the public portfolio are untouched.

The dashboard is deliberately **not** seven identical tiles: equal boxes give
every stage equal weight, which destroys the one thing a pipeline is for.

### Cost

`/admin` and `/admin/leads` ship **178 B** of page JavaScript each — the list's
search, filters, sort and paging are a plain GET form and links, so the whole
screen is a server component. Only the sidebar (for `aria-current`), the login
form and the operator rail are client components.

## 10. Production prerequisites

Nothing below is done. All of it must be, before Django serves any traffic.

1. **A host for Django.** Vercel cannot run it.
2. **A PostgreSQL instance**, and `DATABASE_URL` / `DJANGO_DATABASE_URL`
   pointing at it. Still unset.
3. **`DJANGO_SECRET_KEY`**, generated and stored as a secret.
4. **`DJANGO_ALLOWED_HOSTS`** and, if the admin UI is cross-origin,
   `DJANGO_CSRF_TRUSTED_ORIGINS`.
5. **`DJANGO_API_URL` in Vercel** — where the Next.js admin adapter reaches
   Django. Until it is set, every admin screen renders an honest
   "backend not configured" panel and no login is possible.
6. **A shared cache** (Redis / Memcached) via `CACHES`, or the rate limit stays
   per-process — the same honest limitation `lib/rate-limit.ts` documents.
7. **A superuser**, created with `createsuperuser`, then added to `ADMIN`.
8. **TLS terminated upstream**, since `SECURE_SSL_REDIRECT` and
   `SECURE_PROXY_SSL_HEADER` assume a proxy sets `X-Forwarded-Proto`.
9. **Session cookies over HTTPS.** `cookieOptions` sets `secure` only when
   `NODE_ENV === 'production'`, so a staging deploy served over plain HTTP
   would drop the admin session.

## 11. Running it locally

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
export DJANGO_SETTINGS_MODULE=config.settings.test
export DJANGO_DATABASE_URL="postgres://postgres@127.0.0.1:5432/aly_test"
.venv/bin/python manage.py test apps.leads
```

81 tests, covering the model constraints, the public contract, both roles, the
permission gate, error sanitisation, idempotency, login and account
enumeration, the register's filters and sort allow-list, and schema parity
with Prisma's own SQL.

To drive the admin UI against it, run Django on :8000 and point Next at it:

```bash
# backend/  — serves the API
DJANGO_SETTINGS_MODULE=config.settings.development \
DJANGO_DATABASE_URL="postgres://postgres@127.0.0.1:5432/aly_dev" \
  .venv/bin/python manage.py runserver 127.0.0.1:8000

# repo root — .env.local (git-ignored)
echo 'DJANGO_API_URL=http://127.0.0.1:8000' > .env.local
npm run dev
```

Create operators with `manage.py createsuperuser`, then add them to the
`ADMIN` or `VIEWER` group. Both groups already exist — migration `0002_roles`
creates them.

# ALY OS mobile integration

Status: implementation for review. Disabled by default. No production migration or live delivery has been performed.

## Deploy
1. Use a staging database and a separate test bot for end-to-end validation.
2. Run `prisma/manual/alyos-mobile.sql` explicitly with a trusted PostgreSQL client. It creates only `aly_mobile_*` tables and indexes; never run `prisma db push` against the shared database. The migration is idempotent and tested in isolated PGlite.
3. Deploy the branch. Existing DATABASE_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET remain server-only. Set ALYOS_MOBILE_ENABLED=true only after the migration is applied.
4. Open ALY OS → Settings → CRM and synchronization. Enter the HTTPS origin and existing admin credentials. Device sessions are random 256-bit tokens; only SHA-256 hashes are stored server-side. Expiry slides: 90 days from sign-in, renewed to 90 days on use once fewer than 83 remain (at most about one write a week per device); a device unused for 90 days signs in again. Logout revokes the current session. To revoke a lost device: delete its row in aly_mobile_session by owner/device, through the trusted database console.
5. Sign into the same account on the other device. Enable automatic sync on both or synchronize manually. Automatic synchronization occurs once a minute while the app is active; it is not background push.
6. Smoke-test with disposable data on two devices: independent edits merge, simultaneous edits prompt for resolution, deletion propagates, offline edits survive relaunch. Use a test Telegram chat to verify incoming capture and explicit outgoing send. Never test by messaging real clients without approval.

## Endpoints
All responses are no-store. All except login require Bearer auth. A missing/disabled feature flag returns 503.
- POST /api/mobile/v1/session {email,password,device}: existing owner login, durable per-email attempt limit, sliding 90-day device session (expiresAt in the reply is the initial ISO expiry; every authenticated request renews it once fewer than 83 days remain).
- DELETE /api/mobile/v1/session: revoke current device.
- GET/PUT /api/mobile/v1/workspace: revisioned snapshot, compare-and-swap, 409 conflict, max 4MB. Dates retain Swift seconds since 2001. Money is validated to two decimal places and currencies are explicit.
  - One database for phone and Mac (2026-11-27). Optional top-level arrays `projects` [{id, name, customerID?, taskIDs, deadline?, stage?}], `sessions` [{id, projectID, startedAt, seconds, resumedAt?, endedAt?}], `debts` [{id, person, amount, currency TJS|USD|RUB, owedToMe, due?, payments[]}], exactly as Swift's Codable writes them (Date = seconds since 2001, Decimal = number, nil = key omitted); ids unique per array. An absent array is not part of the push; an explicit array, empty included, replaces the stored one.
  - Ledger entries are stored converted (amount, currency TJS) and may carry `originalAmount` (two decimals, > 0), `originalCurrency` (ISO code, `^[A-Z]{3}$`) and `rate` (stored currency per one original unit, 0 < rate < 1e9, any precision; the server keeps it as an IEEE double).
  - Carry-forward: PUT reads the stored row inside the same compare-and-swap. A push without `projects`/`sessions`/`debts` keeps the stored arrays, and a ledger entry without `originalCurrency` whose stored version has one with the same amount, currency and type keeps the stored conversion fields, so an older app version cannot erase them. The reply is exactly what is stored. A GET of a new account still returns the five original arrays only. No table change: the snapshot is JSONB.
- GET /api/mobile/v1/crm?after=: paginated leads, payments and notes. Decimal amounts are strings. CRM remains the source of truth, and its payments are not copied into local finance, avoiding double counting.
- POST /api/mobile/v1/crm/note {clientID,body}: existing CRM writeNote business logic, owner authorization.
- GET /api/mobile/v1/messages?clientID=&after=: paginated text history for a CRM lead with an already linked Telegram chat.
- POST /api/mobile/v1/messages {clientID,text,operationID}: explicit send through the existing bot, no arbitrary chat destination. Persist before send, deduplicate operation IDs, never retry uncertain Telegram delivery. Pending/unknown is not success. Device preserves pending operation ID/text in Keychain across relaunch.

## Scope and limits
CRM supports viewing leads/payments and adding notes; editing CRM payments, stages and lead fields stays in the existing admin UI. Local tasks/notes/clients/finances/messages synchronize between devices independently of CRM models. This avoids lossy mapping of local tasks into the existing CRM date-range task model.

History starts when enabled; older Telegram conversations cannot be recovered. Inbound private text (excluding commands) is captured before legacy bot dedup; capture failure returns 503 so Telegram can redeliver. Mobile outgoing text is persisted with pending/sent/failed/unknown status. Replies sent by the owner through the legacy bot are recorded best-effort after delivery. Automated bot replies, attachments, edits, deletions and read receipts are not mirrored.

Conflict resolution operates per record; choosing local/server only affects conflicting records. A remote parent deletion concurrent with a new local child is rejected by referential validation instead of dropping the child. Preserve the record or remove/reassign the child, then retry. Encrypted pre-sync backup remains on device. Different account/server cannot reuse an existing checkpoint; no silent cross-account upload.

Database access control and existing ownership: CRM has a shared owner workspace (no tenant column). Any existing AdminUser has the same CRM access as web admin; local synced workspace is scoped by AdminUser.id.

Rollback: disable ALYOS_MOBILE_ENABLED, redeploy previous application code. Keep additive tables to preserve history. No table drop is required. Code from before 2026-11-27 refuses pushes that carry projects/sessions/debts (400) and does not carry them forward, so roll back only together with the apps, or keep sync off until the server is current again.

## Verification
- TypeScript typecheck passed after Prisma generation.
- Run the mobile tests with Node 24 (type stripping): `node --test tests/mobile.test.mjs`.
- Node tests: schema validation, reference checks, additive migration rerun, CAS race, owner isolation, session expiry/revocation, outgoing operation deduplication; projects/sessions/debts and ledger conversion schema, carry-forward against older apps, CAS on the carried row (PGlite), sliding session renewal.
- Swift tests: disjoint merge, same-record conflicts, explicit choice, deletion, delete/edit conflict, reference integrity, initial synchronization.
- Native macOS/iOS Simulator builds pass. Live production credentials, two real devices and real Telegram delivery are not verified.

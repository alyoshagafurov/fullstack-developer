-- Additive migration. Apply explicitly to staging first. Never prisma db push.
BEGIN;
CREATE TABLE IF NOT EXISTS aly_mobile_session (
 token_hash TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES aly_admin_user(id) ON DELETE CASCADE,
 device TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS aly_mobile_session_owner ON aly_mobile_session(owner_id);
CREATE TABLE IF NOT EXISTS aly_mobile_login_limit (
 key TEXT PRIMARY KEY, count INTEGER NOT NULL, started_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS aly_mobile_workspace (
 owner_id TEXT PRIMARY KEY REFERENCES aly_admin_user(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL DEFAULT 0, snapshot JSONB NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aly_mobile_message (
 id BIGSERIAL PRIMARY KEY, operation_id TEXT UNIQUE NOT NULL,
 chat_id TEXT NOT NULL, direction TEXT NOT NULL CHECK(direction IN ('incoming','outgoing')),
 text TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('received','pending','sent','failed','unknown')),
 telegram_id BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS aly_mobile_message_chat ON aly_mobile_message(chat_id,id);
COMMIT;

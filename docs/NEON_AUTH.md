# Neon Auth — development integration

Project: alyos-auth-dev (`wispy-morning-78591030`), AWS Frankfurt, PostgreSQL 18.
Database: alyos. Branch: development (`br-summer-dew-b9ix8j6q`). Managed Better Auth enabled.
Compute fixed at 0.25 CU, suspends after 5 idle minutes. Project is in the existing Launch organization and can incur usage charges.

The Next.js companion backend now exposes /auth/sign-in (email/password registration and login), /account (server-protected session page), /api/account (401 when signed out), and the SDK /api/auth proxy. Sign-out revokes the Auth session; the SDK maintains cookies across reloads. Existing CRM/admin/mobile authorization stays separate. A newly registered account receives no CRM access. Native SwiftUI login still uses the existing owner session: this change does not migrate its credentials or connect Neon users to workspace owners.

Configuration: NEON_AUTH_BASE_URL (the branch Auth URL) and NEON_AUTH_COOKIE_SECRET (random 32+ characters). Neither DATABASE_URL nor a Neon API key is required for Managed Auth calls. Local .env.local is excluded from git. Add each exact preview origin to the branch trusted-domain list. No wildcard allowlist.

Working CRM data remains in the existing database; this new project is a separate development database, not a migration or copy. No production domain has been switched. Production release also needs custom SMTP and account-linking/authorization design before native CRM login is migrated.

Checks: Next.js production build, TypeScript, live HTTP signup/login/logout/session and unauthorized API checks against the isolated development Auth service. Disposable example.invalid test users are retained in development for inspection; no real customer messages or emails are used.

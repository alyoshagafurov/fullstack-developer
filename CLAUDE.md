# Aly Portfolio 2.0 — Project Context (CLAUDE.md)

Premium interactive portfolio + lead-generation platform + client-project system
for **Alisher Gafurov (brand: ALY)**, Full-Stack developer, Dushanbe, Tajikistan.
Primary UI language: **Russian** (site also has TJ / EN). Goal: turn portfolio
visitors into qualified leads and give the owner one place to receive, view and
process project requests.

## Repository & Git — HARD RULES (never violate)
- This is an existing repo; keep it. **NEVER** delete `.git`, change the remote,
  or create a new repository.
- Remote: `origin = https://github.com/alyoshagafurov/fullstack-developer.git`
- Branch: `main`. Pushing `main` auto-deploys to **Vercel** (alyosha-dev.vercel.app;
  brand/canonical domain intended = **aly.lat**).
- Never commit secrets/`.env`. Secrets live in Vercel env vars.

## Verified current state (as of reconnaissance)
- Stack: **Next.js 14 (App Router) + TypeScript + Tailwind**. No Python/Django,
  no database yet. Deployed on Vercel (serverless/static).
- Libs: gsap, @gsap/react, lenis, framer-motion, split-type, lucide-react,
  **grammy** (Telegram bot at `app/api/bot`).
- Content via i18n dictionaries `lib/i18n/{ru,tg,en}.ts`; multi-page
  (`/services /work /process /pricing /about /contact`, cases at `/work/[slug]`).
- Current brand: **strict monochrome** (matte black + white/grey) + **AlyMark**
  SVG logo used across nav/footer/loader/404/hero; enterprise SEO (canonical
  aly.lat, JSON-LD Person/Org/WebSite/ProfilePage, robots/sitemap/OG).
- Leads today: contact form → `app/api/contact` → **Telegram (grammy)** with a
  mailto fallback. **No database.** (This is what Aly Portfolio 2.0 upgrades.)

## Target system (Aly Portfolio 2.0)
1. Public premium portfolio (as now, evolved to the approved visual direction).
2. **Backend + database** that stores project requests (leads) — authoritative
   store. Leads are **never** stored in Telegram.
3. **Admin area** to view/filter/search leads, change status
   (NEW→CONTACTED→DISCOVERY→PROPOSAL→NEGOTIATION→WON/LOST), add notes, see source.
4. **Telegram = assistant only**: notify owner of new leads + quick actions
   (open/change status/remind). NOT the CRM; never accepts the Project Brief.
- Flow: social source → portfolio → Project Brief form → DB → admin → Telegram notify.

## Visual direction — CONFIRMED (owner sent Dark Luxury references + palette)
- Dark Luxury / Quiet Wealth / Private Office / Creative Technology; cinematic,
  restrained, masculine, editorial. Motion: expensive, smooth, meaningful — no
  neon, no cyberpunk, no excessive gradients/glassmorphism, no visual noise.
- Palette: `#1D1D1D #242323 #363636 #3B3B3A #525254 #6C6C6A #959595 #B6B6B4
  #AEA7A3` + accent **`#795238`** (brown).
- 6 real photos form ONE visual world (hero-workspace, about-portrait-dark-office,
  workspace-detail, lifestyle-macbook, lifestyle-car, lifestyle-accessories) —
  used as punctuation, not in every section; no heavy filters/recolor.
- ⚠️ This introduces a **brown accent + photography** and REPLACES the current
  strict-monochrome ALY look. Treat as a deliberate pivot — confirm with owner.

## DECISIONS (made by owner)
1. **Backend stack = Next-native (DECIDED).** Next.js route handlers + PostgreSQL
   (Neon / Vercel Postgres) + Prisma + a protected admin route, all inside the
   existing Next.js app on Vercel. One codebase, one deploy. NOT Django.
2. **Design = Dark Luxury (DECIDED).** Adopt the Dark-Luxury + brown `#795238`
   direction with the 6 photos; this replaces the current monochrome ALY look.
3. **Photos — STILL PENDING.** The 6 assets are NOT in the repo yet. Owner must
   drop the real files into `/public` (chat-pasted references cannot be saved as
   files). Needed before the visual build.
4. **Workflow.** Owner is installing the ECC plugin to run the pack literally in
   fresh sessions; until then this session lacks `/ecc:*`.

## Constraints
- Server-side validation at boundaries; never log sensitive PII; never accept
  real secrets from the frontend; leads never live in Telegram; no payments.
- Keep files reasonable; read before edit; run build before pushing.

## Environment note — ECC plugin is NOT installed here
- The pack + PDF spec assume the **ECC plugin** (`ecc@ecc` v2.2.0 from
  github.com/affaan-m/ECC: 68 agents, 286 skills, `/ecc:*` commands, chrome-devtools
  MCP). **This session does not have ECC** — it is the ruflo/claude-flow setup
  (global CLAUDE.md is ruflo; repo has `.claude-flow/`), which the spec says is
  "not used". So `/ecc:*` commands, the ECC agents (architect, react-reviewer,
  security-reviewer, database-reviewer, python-reviewer) and ECC skills
  (frontend-design-direction, design-system, motion-ui, tdd-workflow, api-design,
  dashboard-builder, django-security, api-connector-builder, django-celery,
  deployment-patterns, verification-loop, e2e-testing) are unavailable.
- Do NOT pretend to run ECC commands/agents/skills. Execute each phase's *intent*
  with the tools that ARE here (Read/Edit/Write/Bash, available agents, the
  Browser pane for QA, and built-in skills like code-review/security-review/verify).
- To run the pack literally, the owner must install ECC in Claude Code first.

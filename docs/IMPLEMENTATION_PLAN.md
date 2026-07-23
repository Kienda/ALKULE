# Alkule implementation plan

This plan adapts the full-stack Alkule blueprint to the **actual stack in this
repository**, per the architecture decisions made at kickoff:

- **Backend:** existing Node.js + Express (`Backend/*.mjs`) — extended, not
  replaced by FastAPI.
- **Database:** PostgreSQL via Prisma ORM (replacing the previous
  `Backend/storage/data.json` flat file).
- **Frontend:** existing Next.js App Router + TypeScript + Tailwind (preserved).
- **Deployment target:** Railway (not AWS). AWS-specific infrastructure
  (Cognito, ECS, RDS, S3, SES, SQS, Terraform) is intentionally **out of scope**;
  local/sandbox adapters or Railway-native equivalents are used instead.

Where the original blueprint mandates FastAPI/SQLAlchemy/Alembic/AWS, the
equivalent capability is delivered with Express/Prisma/Railway. The product
requirements (RBAC, ownership checks, audited privileged actions, real
persistence, workflow states) are honored regardless of framework.

Legend: `[x]` done · `[~]` partial · `[ ]` not started

---

## Phase 0 — Audit & stabilize
- [x] `git status`; preserve uncommitted work
- [x] Inspect package/tsconfig/tailwind/next config and `.env.example`
- [x] Read existing `app/`, `components/`, `data/`, `lib/`, `Backend/`
- [x] Read product blueprint and implementation-status doc
- [x] Run current lint (`tsc --noEmit`), tests, and production build — all green, no pre-existing errors
- [x] Confirm local toolchain: Node 24, PostgreSQL 17 service on :5432, Docker available

## Phase 1 — Auth, users, RBAC, owner bootstrap, audit foundation
- [x] Provision dedicated least-privilege `alkule` Postgres role + `alkule` / `alkule_test` databases
- [x] Prisma schema: `User`, `UserRole`, `AdminPermission`, `AuditLog`, `TypingProgress`, `NewsletterSubscriber`
- [x] Initial migration applied to dev and test databases
- [x] Replace JSON-file store with Prisma across all existing endpoints (contracts preserved)
- [x] Roles: `owner`, `admin`, `instructor`, `moderator`, `learner`; granular admin permissions
- [x] RBAC middleware: `requireAuth`, `requireRole`, `requireOwner`, `requireAdminPermission`, object/ownership checks
- [x] Owner protections: signup grants `learner` only; admins can't modify owners; last active owner can't be removed/suspended/demoted
- [x] `requireRecentAuth` reauthentication gate for sensitive owner actions; `sessionVersion` invalidation on role/status change
- [x] Idempotent `bootstrap-owner` CLI (no hardcoded password, no unauthenticated HTTP owner-creation)
- [x] Audit log writes for privileged actions (owner bootstrap, admin grant/revoke, status change)
- [x] Owner/admin API surface: list users, change status, grant/revoke admin, read audit log
- [x] Integration tests against real Postgres (auth, RBAC, admin permissions, owner protections, reauth)
- [x] Docs: DATABASE_SCHEMA.md, IMPLEMENTATION_STATUS.md, this plan

## Phase 2 — Instructor application, course schema, public catalog
- [ ] Instructor application model + states (draft→submitted→under_review→changes_requested→approved/rejected/suspended)
- [ ] Admin review + audited approval granting `instructor` role
- [ ] Course/module/lesson schema with translations
- [ ] Move catalog from `Backend/catalog.mjs` static array to Postgres-backed catalog API

## Phase 3 — Course builder, media, assessments, publication workflow
- [ ] Autosaving course wizard; module/lesson CRUD + reorder
- [ ] Media upload intent → confirm → ready workflow (local private-media adapter)
- [ ] Quiz & assignment authoring
- [ ] Course states + admin review/request-changes/publish workflow, all audited

## Phase 4 — Learner enrollment, player, progress, real dashboard
- [ ] Enrollment + entitlement checks enforced in backend
- [ ] Course player with resume, notes, bookmarks, progress
- [ ] Dashboard fully backed by Postgres (name/stats already de-hardcoded)

## Phase 5 — Assessments, grading, certificates, verification
- [ ] Authoritative quiz scoring; assignment submission + grading
- [ ] Certificate rules, issuance, public verification URL, revocation

## Phase 6 — Commerce (sandbox), orders, subscriptions, refunds, entitlements, revenue
- [ ] Payment-provider abstraction with deterministic sandbox provider
- [ ] Cart/checkout/order/webhook (verified, idempotent), entitlements granted only after backend confirmation
- [ ] Money as integer minor units + ISO currency; instructor revenue ledger

## Phase 7 — Live cohorts, schedules, attendance, announcements, payouts
- [ ] Cohorts, sessions, capacity, enrollment windows, secure join info, payout requests

## Phase 8 — Owner & admin portals, feature flags, finance, audit UI, system health
- [ ] Owner/admin Next.js portals extending existing design system
- [ ] Feature flags, platform settings, failed-job visibility, audit log UI

## Phase 9 — Library, podcast, literature, history, art & culture, community, moderation
- [ ] Editorial publishing workflows; community threads + moderation queue (audited)

## Phase 10 — Deployment hardening (Railway), CI/CD, logging, monitoring, security review
- [ ] Railway Postgres provisioning + migration deploy step; container/security review
- [ ] (AWS/Terraform intentionally out of scope for this project)

---

### After every phase
1. Run migrations · 2. Backend tests · 3. Frontend tests · 4. Lint + type check ·
5. Production build · 6. Manual smoke of the primary flow · 7. Update
`docs/IMPLEMENTATION_STATUS.md`.

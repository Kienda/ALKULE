# Firebase integration audit

**Date:** 2026-07-22 · **Branch inspected:** `main` (local) vs `origin/main` (remote)
**Status:** Audit complete. Integration **paused pending decisions** (see "Open
questions / decisions required"). No auth/database code has been changed yet.

> This document is Phase 1 (audit) of the Firebase integration request. It records
> the true state of the repository so that no existing functionality or contributor
> work is broken. Credential protection (Phase 2) has been applied; all other
> phases are blocked on the decisions listed at the bottom.

---

## 1. Critical: three-way divergence discovered

`git fetch` revealed the remote has moved substantially since local work began.
There are **three independent lines of work**, and they must be reconciled before
Firebase is wired in:

| Line | Where | Auth model | Data store |
| --- | --- | --- | --- |
| **A. Learning suite** (contributor "abubakar", 22 commits, merged to `origin/main` via PR #2) | `origin/main`, ahead of local `main` | **Client-side local device profile** (`lib/profile.ts`, `localStorage`) — explicitly a placeholder | Client-side `localStorage` stores (`typingStore`, `examStore`, `masteryStore`, `progress`) |
| **B. Phase 1 backend** (this assistant, previous turn, **uncommitted** in working tree) | Local working tree, built on the now-stale base `d9a5f0c` | **Server-side** scrypt + HMAC session cookies + Postgres RBAC | **PostgreSQL via Prisma** |
| **C. Firebase** (this request) | Not yet implemented; a real service-account key is present locally | **Firebase Authentication** (ID tokens) | Firestore / Storage (strategy TBD) |

**The contributor's own intent (from `origin/main:lib/profile.ts`):**
> "Local device profile. This is NOT real authentication ... Swap for real auth
> (Auth.js + a database, or Supabase) when the backend lands; the shape here ports
> directly to a server session."

So line **A explicitly anticipates** a real auth + backend replacing the local
profile. Lines **B** and **C** are two different ways to be that "real auth." They
are **not** in irreconcilable conflict, but **exactly one** should become the
authoritative auth system to avoid the "second conflicting auth system" the
request forbids.

### Git divergence facts
- Local `main` is **22 commits behind** `origin/main` (`d9a5f0c` → `7d7b353`).
- Local `HEAD` is **0 commits ahead** (Phase 1 work is uncommitted, not committed).
- New remote branches: `origin/abubakar/learn-suite` (source of the merge),
  `origin/ci/mirror-to-dialloni`.
- **Only ONE file conflicts** between the uncommitted Phase 1 work and
  `origin/main`: **`Backend/run.mjs`** (both modified). Everything else in Phase 1
  is new files (`Backend/{db,rbac,audit,cli,test-runner}.mjs`, `prisma/`, docs) or
  files `origin/main` did not touch (`package.json`, `Backend/api.mjs`,
  `Backend/auth.mjs`, `Backend/index.mjs`, `Backend/api.test.mjs`).
- `origin/main` did **not** retire `/courses` in the final merge — `app/courses/`,
  `Backend/catalog.mjs`, and `components/courses/CourseCatalog.tsx` all still exist
  ("preserving main product shell").

---

## 2. Current architecture (ground truth)

- **Frontend:** Next.js 16 (App Router) + React 18 + TypeScript strict + Tailwind.
  On `origin/main`, learning features (alphabet, lessons, typing, flashcards, SRS
  review, tiered exam, profile/dashboard) are implemented **client-side** with
  `localStorage`-backed stores under `lib/`.
- **Backend:** Node + **Express** under `Backend/` (started via `Backend/run.mjs`,
  which spawns both the API on `:4000` and Next on `:3000`). This is the trusted
  server surface Firebase Admin would extend.
- **Database:**
  - `origin/main`: **none server-side** — data lives in the browser.
  - Local uncommitted Phase 1: **PostgreSQL + Prisma** (`prisma/schema.prisma`,
    migration applied; `User`, `UserRole`, `AdminPermission`, `AuditLog`,
    `TypingProgress`, `NewsletterSubscriber`).
- **Auth (current, per line):** local device profile (A) or scrypt+session RBAC (B).
- **Storage:** none yet (no upload flow exists in either line).
- **Deployment:** Railway (`railway.json`): build `npm run build`, start
  `npm start` (`node Backend/run.mjs`), health check `/api/health`.

## 3. Existing functionality to preserve
Public learning site; ADLaM alphabet + per-letter detail; curriculum modules &
lessons; typing practice + ADLaM writer keyboard; SRS review; flashcards; tiered
exam; local profile + dashboard; home/culture/library/newsletter pages;
`/courses` catalog; newsletter signup; `GET /api/health`. Brand, slogan, and
visual identity must remain unchanged. **Alkule is a learning platform, not an AI
platform** — no AI rebranding.

## 4. Security review
- ✅ **Service-account key present but never committed.** `Backend/secrets/alkule-firebase-adminsdk-fbsvc-843b293210.json`
  exists in the working tree. `git log --all -- Backend/secrets` and
  `git ls-files Backend/secrets` are both **empty** → the key has **never** been
  tracked. **No revocation required at this time.** Keep it out of git.
- ✅ **`.gitignore` hardened (Phase 2 applied).** `Backend/secrets` already ignored
  it; added `backend/secrets/`, plus globs for `*service-account*.json`,
  `*serviceAccount*.json`, `*firebase-adminsdk*.json`, `*-adminsdk-*.json`
  (the actual key uses the `-adminsdk-` naming, which the request's suggested
  `*service-account*.json` glob would have **missed**), and `.env.*` with
  `!.env.example`. Verified with `git check-ignore`.
- ⚠️ The key must never be moved into a frontend/public dir or imported client-side,
  and must not be required in production (Railway env vars instead).

## 5. Firebase integration plan (proposed, not yet executed)
1. **Reconcile git** — create `feature/firebase-integration` from **`origin/main`**,
   then replay the uncommitted Phase 1 backend onto it (resolving the single
   `Backend/run.mjs` conflict), *if* strategy keeps the Postgres backend.
2. **Env standardization** — support `FIREBASE_PROJECT_ID || project_id`, etc.;
   `FIREBASE_STORAGE_BUCKET=alkule.firebasestorage.app`; normalize `\n` in the key.
3. **`Backend/firebase-admin.mjs`** — single lazy initialization of `firebase-admin`,
   exporting `adminAuth`, `firestore`, `storageBucket`, `FieldValue`, `Timestamp`;
   safe errors when unconfigured.
4. **Auth bridge** — frontend gets a Firebase ID token → sends
   `Authorization: Bearer <token>` → backend verifies via `adminAuth.verifyIdToken`
   → loads the app profile → applies existing RBAC. Roles never trusted from the
   browser.
5. **Storage** — backend-validated uploads (role + ownership + MIME + size +
   server-controlled paths) to Firebase Storage.
6. **Rules** — restrictive `firestore.rules` / `storage.rules` (client goes through
   the trusted backend; Admin SDK bypasses rules so backend authz stays mandatory).
7. **Tests, docs, Railway env** — extend `Backend/api.test.mjs`; add setup docs.

## 6. Files likely to change / must NOT change
- **Likely to change (additive where possible):** `.gitignore` (done),
  `.env.example`, `package.json` (add `firebase-admin`), new `Backend/firebase-admin.mjs`,
  `Backend/auth.mjs` / `Backend/rbac.mjs` (add token-verification path), tests, docs.
- **Must NOT change:** all `origin/main` learning-suite `lib/` stores, `app/`
  learning pages, `data/`, `design/`, brand assets, slogan; `Backend/catalog.mjs`
  and `/courses`. Minimize edits to `Backend/run.mjs` (the one conflict file).

## 7. Backward-compatibility strategy
Firebase Admin module initializes **lazily** and only when configured, so the app
still boots and `/api/health` still responds without Firebase env vars. During
migration, env reads accept both legacy raw-JSON names and standardized
`FIREBASE_*` names. Existing endpoints keep their contracts.

## 8. Open questions / decisions required (BLOCKING)
These change the entire shape of the work and are not safe to decide unilaterally:

1. **Auth authority:** Should **Firebase Auth** become the single real auth system,
   *replacing* the Phase 1 scrypt/session auth? Or keep Phase 1 auth and use
   Firebase for Storage only?
2. **Database strategy (request Phase 7):** (a) Firestore primary, (b) **Prisma/
   Postgres primary + Firebase for Auth/Storage only** (recommended — least
   disruption, keeps Phase 1 + a real relational model), (c) hybrid, (d) gradual
   migration. Two sources of truth for the same data must be avoided.
3. **Git reconciliation:** Confirm creating `feature/firebase-integration` from
   `origin/main` and replaying the uncommitted Phase 1 work onto it. (The Phase 1
   work is currently on a 22-commit-stale base and is **not** yet committed
   anywhere.)
4. **Is there a Firebase requirement doc?** No existing repo doc specifies Firebase;
   this request is the only source. Per "follow the repository document," the
   contributor's `profile.ts` note ("Auth.js + a database, or Supabase") is the
   only prior written intent, and it does **not** name Firebase. Confirm Firebase
   is the intended direction over those alternatives.

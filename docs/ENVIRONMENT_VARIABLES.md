# Environment variables

Copy `.env.example` to `.env` for local development. **Never commit `.env` or any
secret.** In production, set these in the Railway service variables.

## Firebase — server (secret, backend only)
Do **not** prefix these with `NEXT_PUBLIC_`; that would expose them to the browser.

| Variable | Required | Notes |
| --- | --- | --- |
| `FIREBASE_PROJECT_ID` | yes* | Firebase project id (e.g. `alkule`). Legacy alias: `project_id`. |
| `FIREBASE_CLIENT_EMAIL` | yes* | Service-account email. Legacy alias: `client_email`. |
| `FIREBASE_PRIVATE_KEY` | yes* | Service-account private key. Store with literal `\n`; the backend normalizes them. Legacy alias: `private_key`. |
| `FIREBASE_STORAGE_BUCKET` | yes | `alkule.firebasestorage.app`. Legacy alias: `storage_bucket`. |

\* Not required **locally** if a service-account JSON is present in
`Backend/secrets/` (git-ignored) — the backend falls back to it automatically.
Never rely on the file in production; use the env vars.

**Compatibility:** during migration the backend reads either the standardized
`FIREBASE_*` name or the legacy raw-JSON name (`project_id`, etc.), so existing
Railway variables keep working. Prefer the `FIREBASE_*` names going forward.

## Firebase — Web client (safe to expose)
These `NEXT_PUBLIC_` values are **not secret**; they identify the project to the
browser SDK. From Firebase console → Project settings → Your apps → SDK config.

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key (public identifier, not a secret). |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com`. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `alkule.firebasestorage.app`. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender id. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App id. |

## Runtime
| Variable | Notes |
| --- | --- |
| `PORT` | Frontend port (Railway supplies this). Default 3000. |
| `API_PORT` | Express API port. Default 4000. |
| `NODE_ENV` | `development` / `production`. |

## Legacy / parked — PostgreSQL + Prisma
The Phase 1 Postgres backend is parked in favor of Firestore but retained so its
snapshot and tests run during migration. Remove once the Firestore migration is
complete.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Postgres connection (app). |
| `TEST_DATABASE_URL` | Postgres connection (tests). Must contain `test`. |
| `SESSION_SECRET` | Signs legacy session cookies (≥32 chars). |
| `OWNER_BOOTSTRAP_PASSWORD` | Optional, legacy owner-bootstrap CLI only. |

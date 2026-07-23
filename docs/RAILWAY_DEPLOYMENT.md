# Railway deployment

The existing Railway service and its configuration are preserved. Firebase adds
environment variables only — no new service, no changed build/start commands.

## How the service runs
- `railway.json`: build `npm run build`, start `npm start`, health check
  `/api/health` (timeout 120s), restart on failure.
- `npm start` → `node Backend/run.mjs` spawns **two** processes in one container:
  - **Next.js** on `process.env.PORT` (Railway-supplied), bound to `0.0.0.0` —
    this is the public web process.
  - **Express API** on `API_PORT` (default 4000), bound to `127.0.0.1` —
    internal only. Next proxies `/api/:path*` → `BACKEND_URL`
    (`next.config.mjs`, default `http://127.0.0.1:4000`).
- So `GET /api/health` reaches the public port and is rewritten to Express. It
  returns only non-sensitive status (`{ ok, service, time }`).

## Firebase on Railway
Set as **service variables** (Settings → Variables):
- Server (secret): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
  `FIREBASE_PRIVATE_KEY` (paste with literal `\n`), `FIREBASE_STORAGE_BUCKET`.
- Web (public): `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
  `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.

The service-account **JSON file is not used in production** — it stays local and
git-ignored. Do not bake it into the image.

## Persistence
Uploaded files go to **Firebase Storage**, not the container filesystem
(ephemeral on Railway). The parked Postgres data layer, if still used during
migration, must point at a managed Postgres (Railway plugin or external), never
local files.

## Do not
- Create a second Railway service unless the architecture requires it.
- Change the build/start commands or the health-check path.
- Expose server Firebase secrets via `NEXT_PUBLIC_`.
- Commit `.env` or the service-account key.

## Pre-deploy checklist
`npm run lint` · `npm run test:firebase` · (`npm run test:api` if Postgres is
reachable) · `npm run build` — all green. Confirm required Railway variables are
set. Confirm `/api/health` responds.

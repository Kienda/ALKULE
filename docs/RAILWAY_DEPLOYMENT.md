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

## Custom domain: Cloudflare → Railway
The production domain is managed in **Cloudflare** and points at the Railway
service. For Firebase to work through it:

1. **Firebase authorized domains (required).** Firebase console → Authentication →
   Settings → **Authorized domains** → add **`alkule.com`** and **`www.alkule.com`**.
   Without this, browser sign-in fails in production with
   `auth/unauthorized-domain`. `localhost` and `alkule.firebaseapp.com` are allowed
   by default; the custom domain is not.
2. **Cloudflare SSL/TLS mode = Full (strict).** Railway terminates TLS with a
   valid cert, so "Flexible" causes redirect loops / mixed content. Use Full
   (strict).
3. **Do not cache the API.** Ensure `/api/*` is not cached by Cloudflare (auth
   token requests are POST/GET with `Authorization` and must reach Railway every
   time). Static assets can be cached normally. The `Authorization: Bearer` header
   passes through Cloudflare unchanged — no action needed there.
4. **Disable Rocket Loader for the app** (Cloudflare → Speed → Optimization).
   Rocket Loader defers/injects `<script>` handling and can break the Firebase Web
   SDK's initialization. Auto-Minify JS is usually fine but disable it if you see
   SDK errors.
5. **Railway health check is internal.** Railway probes the container directly at
   `/api/health`, not through Cloudflare, so proxy settings don't affect it.

`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` stays `alkule.firebaseapp.com` (Firebase's own
auth handler domain) — do **not** change it to the custom domain unless you have
explicitly set up custom-domain hosting of the auth handler.

## Do not
- Create a second Railway service unless the architecture requires it.
- Change the build/start commands or the health-check path.
- Expose server Firebase secrets via `NEXT_PUBLIC_`.
- Commit `.env` or the service-account key.
- Set Cloudflare SSL to "Flexible", or leave `/api/*` cached.

## Pre-deploy checklist
`npm run lint` · `npm run test:firebase` · (`npm run test:api` if Postgres is
reachable) · `npm run build` — all green. Confirm required Railway variables are
set. Confirm `/api/health` responds.

# Contributor workflow

Alkule has more than one active contributor. These practices keep work from
colliding and keep secrets and the Railway deploy safe.

## Before you change shared backend files
1. Sync first:
   ```
   git fetch
   git status -sb          # see how far ahead/behind you are
   git log --oneline -15 origin/main
   ```
2. For a file another contributor recently touched, **read the whole file and its
   history** (`git log -p -- <file>`) before editing. Keep changes minimal.
3. Work on a dedicated branch, e.g. `feature/<topic>`. Do not commit straight to
   `main`.

## Keeping your branch current
- Prefer **merge** over history-rewriting rebases when the branch is shared:
  ```
  git fetch
  git merge origin/main
  ```
- Resolve conflicts by preserving **both** intents where possible (see how
  `Backend/run.mjs` was merged: contributor's `require.resolve` + the env flag).
- Never `git reset --hard`, `git clean -fd`, force-push a shared branch, or
  rebase shared history.

## Sensitive files — never commit
- `Backend/secrets/**` (Firebase service-account JSON).
- `.env` and `.env.*` (except `.env.example`).
- Any `*-adminsdk-*.json` / `*service-account*.json`.

Verify before pushing:
```
git status --ignored --short        # secrets should show as ignored, not staged
git check-ignore -v Backend/secrets/<key>.json
```
If you ever see a key staged, unstage it (`git restore --staged`), and if it was
ever committed, treat the key as compromised: revoke + regenerate (see
`docs/FIREBASE_SETUP.md`).

## Migrations & data
- The data layer is migrating from Postgres/Prisma (parked) to Firestore. Do not
  reintroduce a second source of truth for the same data.
- Never auto-migrate production data. Migrations run as documented, reviewed
  scripts (dry-run first).

## Tests to run before pushing
```
npm run lint            # tsc --noEmit (a.k.a. npm run typecheck)
npm run test:firebase   # offline Firebase unit tests
npm run test:api        # backend integration (needs a reachable Postgres)
npm run build           # Next.js production build
```
Do not push (or claim done) with failing tests or a failing build.

## Don't break Railway
- Keep `railway.json` build/start commands and `/api/health` intact.
- Keep server Firebase secrets off `NEXT_PUBLIC_`.
- Uploads go to Firebase Storage, not the ephemeral container filesystem.

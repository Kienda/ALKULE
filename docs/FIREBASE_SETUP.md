# Firebase setup

How to configure Firebase for Alkule locally and on Railway. Alkule is a
**learning platform**; Firebase provides Authentication, Cloud Firestore, and
Storage. It does not change the product's identity.

## Prerequisites
- A Firebase project (this repo targets project id `alkule`, bucket
  `alkule.firebasestorage.app`).
- A service-account key (Firebase console → Project settings → Service accounts →
  Generate new private key).

## Local development
1. **Do not commit the key.** Place the downloaded JSON in `Backend/secrets/`.
   That directory and `*-adminsdk-*.json` / `*service-account*.json` are
   git-ignored. Verify with:
   ```
   git check-ignore -v Backend/secrets/<your-key>.json
   ```
2. Copy `.env.example` → `.env`. For local dev you may leave the server
   `FIREBASE_*` vars blank — the backend falls back to the JSON in
   `Backend/secrets/`.
3. Add the **Web** config (`NEXT_PUBLIC_FIREBASE_*`) from Firebase console →
   Project settings → Your apps. These are safe to expose.
4. Start the app: `npm run dev` (Express API on :4000, Next on :3000).
5. Verify the backend can reach Firebase:
   ```
   npm run test:firebase
   ```

## Enable providers
Firebase console → Authentication → Sign-in method:
- **Email/Password** (initial provider).
- **Google** (if/when the design calls for it).

## Production (Railway)
Set server vars (never `NEXT_PUBLIC_` for these):
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (with
literal `\n`), `FIREBASE_STORAGE_BUCKET`. Also set the `NEXT_PUBLIC_FIREBASE_*`
Web vars. The service-account **file is not used in production** — the env vars
are the source of truth. See `docs/RAILWAY_DEPLOYMENT.md`.

## Security rules
`firestore.rules` and `storage.rules` are **deny-by-default**: the app reaches
Firestore/Storage only through the trusted backend (Admin SDK, which bypasses
rules), so client access stays closed. Deploy rules with the Firebase CLI
(`firebase deploy --only firestore:rules,storage`) when ready; document any
intentional direct-client exception.

## If the key is ever leaked
Revoke it immediately (Firebase console → Service accounts → manage keys → delete),
generate a new one, and update `Backend/secrets/` + Railway. As of this writing
the key has **never been committed** to git (verified via `git log --all`).

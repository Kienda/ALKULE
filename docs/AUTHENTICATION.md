# Authentication

## Chosen strategy: Firebase ID token on every API request
Decided with the maintainer: **Firebase Authentication is the single real auth
system** (Firebase all-in). The prior client-side "local device profile"
(`lib/profile.ts`) was explicitly a placeholder; the Phase 1 Postgres session
auth is parked. There must be exactly **one** auth system — no conflicting second.

### Flow
1. Browser signs in with the Firebase Web SDK (email/password; Google later).
2. Browser obtains a Firebase **ID token** and sends it on API calls:
   ```
   Authorization: Bearer <firebase-id-token>
   ```
3. The trusted backend verifies it with the Admin SDK
   (`Backend/firebase-auth.mjs` → `adminAuth().verifyIdToken`).
4. The backend loads the user's **application profile** from Firestore by `uid`.
5. **Roles/permissions come from Firestore, never from the token or the browser.**

### Backend modules
- `Backend/firebase-admin.mjs` — single lazy Admin initialization; exports
  `adminAuth()`, `firestore()`, `storageBucket()`, `FieldValue`, `Timestamp`,
  `isFirebaseConfigured()`.
- `Backend/firebase-auth.mjs` — `getBearerToken`, `verifyRequestToken`,
  `attachFirebaseUser` (non-rejecting), `requireFirebaseAuth` (401 if no valid
  token). Identity only; authorization is applied separately by role.

### Roles
Roles remain as defined by the project RBAC: **owner, admin, instructor,
moderator, learner** (see `Backend/rbac.mjs`). Under Firestore-all-in, a user's
roles live in their Firestore profile document and are read server-side by `uid`.
Never trust a role sent from the browser.

## Status
- ✅ Backend token verification implemented and unit-tested (missing/invalid-token
  paths; live Admin init verified read-only).
- ⏳ **Pending the Web config**: frontend Firebase sign-in wiring, the
  Firestore user-profile/roles read on the backend, and an end-to-end test with a
  real ID token. These land together once `NEXT_PUBLIC_FIREBASE_*` is provided.

## Security notes
- ID tokens, the private key, and `Authorization` headers are never logged.
- Session revocation: on role/status change, revoke refresh tokens
  (`adminAuth().revokeRefreshTokens(uid)`) and verify with `checkRevoked: true`.
- Sensitive actions should re-check the token's `auth_time` for recency.

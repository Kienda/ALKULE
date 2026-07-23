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

## Implemented pieces
- **Frontend**: `lib/firebase-client.ts` (Web SDK init), `lib/api-client.ts`
  (`authedFetch` attaches the ID token), `lib/ProfileProvider.tsx` (Firebase-backed
  app-wide auth state, mounted in `app/layout.tsx`), and `components/AuthForm.tsx`
  (email/password sign-up/sign-in, same UI). `DashboardClient` and `TypingGame`
  now send the token.
- **Backend**: `Backend/firebase-api.mjs` router (mounted by `index.mjs`) with
  `POST /auth/session` (get-or-create Firestore profile), `GET /auth/me`,
  `PATCH /auth/profile`, `GET /dashboard`, `PUT /progress/typing`,
  `POST /newsletter`, `GET /owner/users`, `PATCH /owner/users/:uid/roles`.
- **Data**: `Backend/firestore-users.mjs` — `users/{uid}` profiles with roles;
  progress in `typingProgress/{uid}`.

## Owner bootstrap
```
npm run bootstrap-owner -- --email=owner@example.com
```
Grants `owner` (Firestore roles + custom claim) to an **existing** Firebase Auth
user (they must sign up first). Never creates an unauthenticated owner. The user
must sign out/in for the refreshed claim; role checks read Firestore immediately.

## Status
- ✅ Backend token verification (unit-tested) and full **live e2e** verified:
  401 gate, session+profile creation, learner RBAC (403 on owner route), progress
  persistence, owner bootstrap → owner access. The e2e test creates and then
  **deletes** its ephemeral user/docs (`npm run test:e2e`).
- ⏳ **Manual console step**: enable **Email/Password** (Authentication → Sign-in
  method) so real users can sign up from the UI. Backend/e2e do not require it
  (they use Admin + custom-token exchange), but the browser sign-up form does.
- ⏳ Remaining data migration: other endpoints (owner/admin management, catalog
  authoring, etc.) still to move onto Firestore in later slices.

## Security notes
- ID tokens, the private key, and `Authorization` headers are never logged.
- Session revocation: on role/status change, revoke refresh tokens
  (`adminAuth().revokeRefreshTokens(uid)`) and verify with `checkRevoked: true`.
- Sensitive actions should re-check the token's `auth_time` for recency.

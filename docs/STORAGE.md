# Storage

Alkule uses **Firebase Storage** for uploaded files. All protected content is
mediated by the trusted backend, which validates the request and uses the Admin
SDK (bypassing client rules) to read/write objects under server-controlled paths.

## Path conventions (server-controlled)
Derive paths on the server from verified identifiers; never from raw client input.

```
users/{uid}/avatar/
courses/{courseId}/thumbnail/
courses/{courseId}/lessons/{lessonId}/
courses/{courseId}/documents/
courses/{courseId}/audio/
courses/{courseId}/video/
assignments/{assignmentId}/
submissions/{submissionId}/
certificates/{certificateId}/
books/{bookId}/
podcasts/{podcastId}/
typing/
marketing/            # the only candidate for public read; keep it explicit
```
Confirm the concrete set of content types against the product requirements as
features are implemented.

## Upload checklist (enforced in the backend)
1. Authenticate the user (valid Firebase ID token).
2. Verify the role for the action.
3. Verify resource ownership (e.g. instructor owns the course).
4. Validate MIME type **and** extension against an allowlist.
5. Validate file size against a per-type limit.
6. Generate the storage path server-side; reject `..` / path traversal.
7. Block executable/script types.
8. Store file metadata (owner uid, content type, size, createdAt).
9. Keep private course material private — no permanent public URLs; use
   short-lived signed URLs (`file.getSignedUrl({ action: "read", expires })`).

## Rules
`storage.rules` is deny-by-default. Direct browser access is closed; the backend
is the gateway. If a specific public prefix (e.g. `marketing/`) must be
world-readable, add a narrow read-only rule for exactly that prefix and note it
here.

## Implemented
- `Backend/storage.mjs` — the pipeline: `validateUpload` (magic-byte sniff so a
  spoofed `Content-Type` cannot pass; size + blocked-extension checks),
  `buildObjectPath` (server-generated filename, identifier sanitization, traversal
  guard), `uploadObject`, `signedReadUrl` (private reads), `deleteObject` /
  `deletePrefix`.
- **Avatar** (self-owned) is live end-to-end:
  - `POST /api/uploads/avatar` (multipart, `requireAuth`) — validates, stores at
    `users/{uid}/avatar/<generated>.<ext>`, records `avatarPath` on the profile,
    returns a signed URL. Max 2 MB; PNG/JPEG/WebP only.
  - `GET /api/uploads/avatar` — returns a fresh signed URL.
  - Frontend: `components/ProfileClient.tsx` on `/profile` (upload + preview).
- Tests: `npm run test:storage` (12 offline assertions incl. spoof + traversal)
  and the live `npm run test:e2e` (upload → signed URL → spoof-rejection → cleanup).

## Next (needs resource ownership models)
Course/lesson/assignment/etc. uploads: add each as a purpose in `storage.mjs`
`PURPOSES` with a role check (e.g. instructor) and an **ownership** check (e.g. the
instructor owns `courseId`) once those Firestore collections exist. The pipeline
and rules already support them; only the per-purpose authorization is pending.

The service-account JSON must never be uploaded to Storage.

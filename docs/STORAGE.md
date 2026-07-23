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

## Status
⏳ Not yet wired into an upload flow — no upload UI exists in the current product
shell. The bucket (`alkule.firebasestorage.app`) and access path
(`storageBucket()` in `Backend/firebase-admin.mjs`) are verified and ready. The
service-account JSON must never be uploaded to Storage.

/**
 * Firebase Authentication bridge for the trusted backend.
 *
 * Flow: the browser signs in with Firebase Auth, obtains a Firebase ID token,
 * and sends it as `Authorization: Bearer <token>` on API requests. The backend
 * verifies the token here with the Admin SDK. ROLES ARE NEVER TAKEN FROM THE
 * TOKEN OR THE BROWSER — they are looked up server-side (Firestore) by uid.
 *
 * This module only establishes *identity*. Authorization (roles/permissions) is
 * applied by the RBAC layer using the verified uid.
 */
import { adminAuth, isFirebaseConfigured } from "./firebase-admin.mjs";

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || "";
  if (typeof header !== "string") return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Verify the request's Firebase ID token. Returns the decoded token, or null if
 * no/invalid token. Never throws for a missing token; throws only on unexpected
 * internal errors (which callers convert into a safe 401/500).
 */
export async function verifyRequestToken(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  if (!isFirebaseConfigured()) return null;
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    // Invalid signature, expired, wrong audience/issuer, revoked, etc.
    return null;
  }
}

/** Express middleware: attaches req.firebaseUser (decoded token) if present and
 *  valid; leaves it null otherwise. Does not reject on its own. */
export async function attachFirebaseUser(req, _res, next) {
  try {
    req.firebaseUser = await verifyRequestToken(req);
  } catch {
    req.firebaseUser = null;
  }
  next();
}

/** Express middleware: rejects with 401 unless a valid Firebase ID token is
 *  present. Use on routes that require authentication. */
export function requireFirebaseAuth(req, res, next) {
  verifyRequestToken(req)
    .then((decoded) => {
      if (!decoded) {
        return res.status(401).json({ error: "A valid Firebase ID token is required." });
      }
      req.firebaseUser = decoded;
      next();
    })
    .catch(() => res.status(401).json({ error: "A valid Firebase ID token is required." }));
}

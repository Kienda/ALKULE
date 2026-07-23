/**
 * Authorization for the Firebase-backed API. Identity is established by
 * firebase-auth (verified ID token → req.firebaseUser); this layer loads the
 * Firestore profile (with roles) by uid and enforces role checks server-side.
 */
import { verifyRequestToken } from "./firebase-auth.mjs";
import { getProfile, getOrCreateProfile, hasRole } from "./firestore-users.mjs";

/** Attach req.firebaseUser (decoded token) and req.profile (Firestore profile,
 *  created on first sight) when a valid token is present. Never rejects. */
export async function attachProfile(req, _res, next) {
  try {
    const decoded = await verifyRequestToken(req);
    req.firebaseUser = decoded;
    req.profile = decoded ? await getOrCreateProfile(decoded) : null;
  } catch {
    req.firebaseUser = null;
    req.profile = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.firebaseUser || !req.profile) {
    return res.status(401).json({ error: "Sign in to continue." });
  }
  if (req.profile.status !== "active") {
    return res.status(403).json({ error: "This account is not active." });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.firebaseUser || !req.profile) {
      return res.status(401).json({ error: "Sign in to continue." });
    }
    if (!hasRole(req.profile, ...roles)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

export { getProfile };

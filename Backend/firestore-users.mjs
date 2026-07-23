/**
 * Firestore-backed user profiles and roles (Firebase all-in data layer).
 *
 * Identity comes from Firebase Auth (uid). The application profile — display
 * name, preferred locale, status, and ROLES — lives in Firestore under
 * `users/{uid}`. Roles are authoritative here and are always read server-side by
 * uid; they are never taken from the browser or from the ID token body.
 */
import { firestore, adminAuth, FieldValue } from "./firebase-admin.mjs";

export const ROLES = ["owner", "admin", "instructor", "moderator", "learner"];

function usersCollection() {
  return firestore().collection("users");
}

function shapeProfile(uid, data) {
  return {
    uid,
    email: data.email ?? null,
    name: data.name ?? null,
    status: data.status ?? "active",
    preferredLocale: data.preferredLocale ?? "en",
    roles: Array.isArray(data.roles) && data.roles.length ? data.roles : ["learner"],
    avatarPath: data.avatarPath ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? null,
  };
}

/**
 * Return the profile for a verified Firebase user, creating it on first sight.
 * New accounts always start as `learner` — never owner/admin via this path.
 * `decoded` is the verified ID token; `overrides` may carry a display name from
 * the signup form.
 */
export async function getOrCreateProfile(decoded, overrides = {}) {
  const uid = decoded.uid;
  const ref = usersCollection().doc(uid);
  const snap = await ref.get();

  if (!snap.exists) {
    const name = (overrides.name || decoded.name || decoded.email?.split("@")[0] || "Learner").toString().trim();
    const profile = {
      email: decoded.email ?? null,
      name,
      status: "active",
      preferredLocale: overrides.preferredLocale || "en",
      roles: ["learner"],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(profile);
    const created = await ref.get();
    return shapeProfile(uid, created.data());
  }

  // Keep email in sync if it changed at the auth provider; never touch roles here.
  const data = snap.data();
  if (decoded.email && data.email !== decoded.email) {
    await ref.update({ email: decoded.email, updatedAt: FieldValue.serverTimestamp() });
  }
  return shapeProfile(uid, data);
}

export async function getProfile(uid) {
  const snap = await usersCollection().doc(uid).get();
  return snap.exists ? shapeProfile(uid, snap.data()) : null;
}

export async function updateProfileFields(uid, fields) {
  const allowed = {};
  if (typeof fields.name === "string" && fields.name.trim().length >= 2) allowed.name = fields.name.trim();
  if (typeof fields.preferredLocale === "string") allowed.preferredLocale = fields.preferredLocale;
  if (Object.keys(allowed).length === 0) return getProfile(uid);
  allowed.updatedAt = FieldValue.serverTimestamp();
  await usersCollection().doc(uid).update(allowed);
  return getProfile(uid);
}

export function hasRole(profile, ...roles) {
  return Boolean(profile) && profile.roles.some((r) => roles.includes(r));
}

/** Count active owners, optionally excluding one uid (owner-protection checks). */
export async function countActiveOwners(excludeUid = null) {
  const snap = await usersCollection().where("roles", "array-contains", "owner").get();
  return snap.docs.filter((d) => d.id !== excludeUid && (d.data().status ?? "active") === "active").length;
}

/**
 * Idempotently grant the owner role by email. Looks the user up in Firebase Auth
 * (they must have signed up first), ensures a profile, adds `owner`, and mirrors
 * roles into a custom claim. Returns { uid, roles }.
 */
export async function grantOwnerByEmail(email) {
  const userRecord = await adminAuth().getUserByEmail(email);
  const uid = userRecord.uid;
  const ref = usersCollection().doc(uid);
  const snap = await ref.get();

  const existingRoles = snap.exists && Array.isArray(snap.data().roles) ? snap.data().roles : ["learner"];
  const roles = Array.from(new Set([...existingRoles, "owner"]));

  if (snap.exists) {
    await ref.update({ roles, status: "active", updatedAt: FieldValue.serverTimestamp() });
  } else {
    await ref.set({
      email: userRecord.email ?? email,
      name: userRecord.displayName || email.split("@")[0],
      status: "active",
      preferredLocale: "en",
      roles,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await adminAuth().setCustomUserClaims(uid, { roles });
  return { uid, roles };
}

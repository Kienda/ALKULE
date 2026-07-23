/**
 * End-to-end test of the Firebase-backed API against the LIVE Firebase project.
 *
 * It creates an ephemeral user + a real ID token (via a custom-token exchange, so
 * it does not depend on the Email/Password provider being enabled yet), exercises
 * the auth/session, RBAC, progress, and owner-bootstrap flows, then DELETES the
 * user and its Firestore documents. Nothing is left behind.
 *
 * Skips cleanly (exit 0) when Firebase or the Web API key is unavailable, or when
 * the custom-token exchange is not permitted, so CI without credentials passes.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import express from "express";
import api from "./firebase-api.mjs";
import { adminAuth, firestore, isFirebaseConfigured } from "./firebase-admin.mjs";
import { grantOwnerByEmail } from "./firestore-users.mjs";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!isFirebaseConfigured() || !apiKey) {
  console.log("Firebase e2e test SKIPPED: Firebase not configured or NEXT_PUBLIC_FIREBASE_API_KEY missing.");
  process.exit(0);
}

async function exchangeCustomTokenForIdToken(customToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const reason = data?.error?.message || `HTTP ${res.status}`;
    const err = new Error(reason);
    err.reason = reason;
    throw err;
  }
  return data.idToken;
}

const email = `e2e-${Date.now()}@alkule-e2e.invalid`;
let uid = null;
const app = express();
app.use("/api", api);
const server = app.listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const auth = (t) => ({ authorization: `Bearer ${t}`, "content-type": "application/json" });

let skipped = false;
try {
  const record = await adminAuth().createUser({ email, displayName: "E2E Tester" });
  uid = record.uid;

  let idToken;
  try {
    const customToken = await adminAuth().createCustomToken(uid);
    idToken = await exchangeCustomTokenForIdToken(customToken);
  } catch (e) {
    skipped = true;
    console.log(`Firebase e2e test SKIPPED: could not mint an ID token (${e.reason || e.message}).`);
    console.log("Enable a sign-in method / allow the Identity Toolkit API for the Web key, then re-run.");
  }

  if (!skipped) {
    // Unauthenticated protected route → 401
    let res = await fetch(`${base}/auth/me`);
    assert.equal(res.status, 401);

    // Session get-or-create → profile with default learner role
    res = await fetch(`${base}/auth/session`, {
      method: "POST",
      headers: auth(idToken),
      body: JSON.stringify({ name: "E2E Tester" }),
    });
    assert.equal(res.status, 200);
    let body = await res.json();
    assert.equal(body.user.uid, uid);
    assert.deepEqual(body.user.roles, ["learner"]);

    // Learner is forbidden from an owner route
    res = await fetch(`${base}/owner/users`, { headers: auth(idToken) });
    assert.equal(res.status, 403);

    // Progress persists in Firestore
    res = await fetch(`${base}/progress/typing`, {
      method: "PUT",
      headers: auth(idToken),
      body: JSON.stringify({ score: 42, attempts: 5, correct: 4, streak: 3 }),
    });
    assert.equal(res.status, 200);
    res = await fetch(`${base}/dashboard`, { headers: auth(idToken) });
    body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.progress.score, 42);
    assert.equal(body.user.name, "E2E Tester");

    // Owner bootstrap grants owner; the owner route is now allowed (roles are read
    // from Firestore, not the token).
    await grantOwnerByEmail(email);
    res = await fetch(`${base}/owner/users`, { headers: auth(idToken) });
    assert.equal(res.status, 200);
    body = await res.json();
    assert.ok(body.users.some((u) => u.uid === uid));

    console.log(
      "Firebase e2e tests passed: 401 gate, session+profile, learner RBAC (403), progress persistence, owner bootstrap (live project, cleaned up)."
    );
  }
} finally {
  server.close();
  try {
    await firestore().collection("users").doc(uid).delete();
  } catch {
    /* ignore */
  }
  try {
    await firestore().collection("typingProgress").doc(uid).delete();
  } catch {
    /* ignore */
  }
  if (uid) {
    try {
      await adminAuth().deleteUser(uid);
    } catch {
      /* ignore */
    }
  }
  await new Promise((r) => setTimeout(r, 100));
}

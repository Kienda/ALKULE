/**
 * End-to-end test of the Firebase-backed API against the LIVE Firebase project.
 *
 * It creates an ephemeral user, signs in via the REAL Email/Password provider to
 * get an ID token (falling back to a custom-token exchange if that provider is
 * off), then exercises auth/session, RBAC, progress, avatar upload, and owner
 * bootstrap — and finally DELETES the user, its Firestore docs, and its uploaded
 * Storage objects. Nothing is left behind.
 *
 * Skips cleanly (exit 0) when Firebase or the Web API key is unavailable, or when
 * no ID token can be minted, so CI without credentials passes.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import express from "express";
import api from "./firebase-api.mjs";
import { adminAuth, firestore, isFirebaseConfigured } from "./firebase-admin.mjs";
import { grantOwnerByEmail } from "./firestore-users.mjs";
import { deletePrefix } from "./storage.mjs";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!isFirebaseConfigured() || !apiKey) {
  console.log("Firebase e2e test SKIPPED: Firebase not configured or NEXT_PUBLIC_FIREBASE_API_KEY missing.");
  process.exit(0);
}

async function identityToolkit(method, payload) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || `HTTP ${res.status}`);
    err.reason = data?.error?.message || `HTTP ${res.status}`;
    throw err;
  }
  return data.idToken;
}

const signInWithPassword = (email, password) => identityToolkit("signInWithPassword", { email, password });
const exchangeCustomTokenForIdToken = (token) => identityToolkit("signInWithCustomToken", { token });

// A real 1x1 PNG (valid magic bytes) for the upload round-trip.
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

const email = `e2e-${Date.now()}@example.com`;
const password = "E2e-Test-Password-123!";
let uid = null;
const app = express();
app.use("/api", api);
const server = app.listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const auth = (t) => ({ authorization: `Bearer ${t}`, "content-type": "application/json" });

let skipped = false;
try {
  const record = await adminAuth().createUser({ email, password, displayName: "E2E Tester" });
  uid = record.uid;

  let idToken;
  let authPath = "";
  try {
    // Real production path: Email/Password sign-in.
    idToken = await signInWithPassword(email, password);
    authPath = "email/password";
  } catch {
    try {
      // Fallback if Email/Password is not enabled in this project.
      idToken = await exchangeCustomTokenForIdToken(await adminAuth().createCustomToken(uid));
      authPath = "custom-token";
    } catch (e) {
      skipped = true;
      console.log(`Firebase e2e test SKIPPED: could not mint an ID token (${e.reason || e.message}).`);
      console.log("Enable a sign-in method / allow the Identity Toolkit API for the Web key, then re-run.");
    }
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

    // Avatar upload round-trip (multipart → Storage → signed URL).
    let form = new FormData();
    form.append("file", new Blob([PNG_1x1], { type: "image/png" }), "avatar.png");
    res = await fetch(`${base}/uploads/avatar`, { method: "POST", headers: { authorization: `Bearer ${idToken}` }, body: form });
    assert.equal(res.status, 201, "avatar upload should succeed");
    body = await res.json();
    assert.match(body.avatarPath, new RegExp(`^users/${uid}/avatar/`));
    assert.ok(typeof body.url === "string" && body.url.startsWith("http"), "a signed URL is returned");

    // A non-image masquerading as PNG is rejected by the magic-byte check.
    form = new FormData();
    form.append("file", new Blob([Buffer.from("not really an image")], { type: "image/png" }), "x.png");
    res = await fetch(`${base}/uploads/avatar`, { method: "POST", headers: { authorization: `Bearer ${idToken}` }, body: form });
    assert.equal(res.status, 400, "spoofed image upload should be rejected");

    // The stored avatar is retrievable as a signed URL.
    res = await fetch(`${base}/uploads/avatar`, { headers: auth(idToken) });
    body = await res.json();
    assert.ok(body.url, "GET /uploads/avatar returns a signed URL");

    // Owner bootstrap grants owner; the owner route is now allowed (roles are read
    // from Firestore, not the token).
    await grantOwnerByEmail(email);
    res = await fetch(`${base}/owner/users`, { headers: auth(idToken) });
    assert.equal(res.status, 200);
    body = await res.json();
    assert.ok(body.users.some((u) => u.uid === uid));

    console.log(
      `Firebase e2e tests passed (auth via ${authPath}): 401 gate, session+profile, learner RBAC (403), ` +
        "progress persistence, avatar upload + signed URL, spoof rejection, owner bootstrap (live project, cleaned up)."
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
    await deletePrefix(`users/${uid}`);
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

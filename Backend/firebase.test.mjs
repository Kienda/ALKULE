/**
 * Offline unit tests for the Firebase backend layer. These do NOT require a
 * network connection, a running database, or a real ID token — they exercise
 * configuration resolution and the missing/invalid-token contract. End-to-end
 * verification with a real ID token happens once the frontend Web config lands.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { isFirebaseConfigured, getFirebaseApp } from "./firebase-admin.mjs";
import { getBearerToken, verifyRequestToken, attachFirebaseUser, requireFirebaseAuth } from "./firebase-auth.mjs";

let passed = 0;
function ok(label) {
  passed += 1;
  console.log("  ok -", label);
}

// getBearerToken parsing
assert.equal(getBearerToken({ headers: {} }), null);
ok("getBearerToken returns null with no Authorization header");
assert.equal(getBearerToken({ headers: { authorization: "Basic abc" } }), null);
ok("getBearerToken returns null for non-Bearer scheme");
assert.equal(getBearerToken({ headers: { authorization: "Bearer abc.def.ghi" } }), "abc.def.ghi");
ok("getBearerToken extracts the token from a Bearer header");
assert.equal(getBearerToken({ headers: { authorization: "bearer   spaced.token  " } }), "spaced.token");
ok("getBearerToken is case-insensitive and trims");

// verifyRequestToken with no token never throws and returns null (no network)
assert.equal(await verifyRequestToken({ headers: {} }), null);
ok("verifyRequestToken returns null when no token is present");

// attachFirebaseUser sets null and calls next, never throws
await new Promise((resolve) => {
  const req = { headers: {} };
  attachFirebaseUser(req, {}, () => {
    assert.equal(req.firebaseUser, null);
    resolve();
  });
});
ok("attachFirebaseUser sets req.firebaseUser=null and calls next when unauthenticated");

// requireFirebaseAuth rejects with 401 when no token
await new Promise((resolve) => {
  let status = null;
  let body = null;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    json(payload) {
      body = payload;
      resolve();
      return this;
    },
  };
  requireFirebaseAuth({ headers: {} }, res, () => {
    throw new Error("next() should not be called without a valid token");
  });
  // allow the promise chain in requireFirebaseAuth to settle
  setTimeout(() => {
    assert.equal(status, 401);
    assert.ok(body && typeof body.error === "string");
    assert.doesNotMatch(JSON.stringify(body), /BEGIN PRIVATE KEY|Bearer /, "error must not leak secrets");
    resolve();
  }, 50);
});
ok("requireFirebaseAuth responds 401 (no secret leakage) when unauthenticated");

// Admin config resolution — offline (reads the git-ignored service-account file
// in local dev; cert() does not hit the network until an operation is issued).
if (isFirebaseConfigured()) {
  const app = getFirebaseApp();
  assert.ok(app, "an app instance is returned when configured");
  ok(`Firebase Admin initializes when configured (projectId: ${app.options.projectId || "from credential"})`);
} else {
  ok("Firebase Admin reports not-configured cleanly (no credential available in this environment)");
}

console.log(`\nFirebase unit tests passed: ${passed} assertions.`);

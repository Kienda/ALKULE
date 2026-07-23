/**
 * Unit tests for the Google/Firebase auth error mapping (pure functions).
 */
import assert from "node:assert/strict";
import { googleAuthErrorMessage, shouldFallbackToRedirect } from "./auth-errors.mjs";

let passed = 0;
const ok = (label) => {
  passed += 1;
  console.log("  ok -", label);
};

// Every documented case maps to a distinct, friendly, non-empty message.
const cases = {
  "auth/popup-closed-by-user": /cancelled/i,
  "auth/popup-blocked": /pop-?ups?/i,
  "auth/unauthorized-domain": /address/i,
  "auth/account-exists-with-different-credential": /different sign-in method/i,
  "auth/network-request-failed": /network/i,
};
for (const [code, pattern] of Object.entries(cases)) {
  const msg = googleAuthErrorMessage(code);
  assert.ok(typeof msg === "string" && msg.length > 0, `${code} yields a message`);
  assert.match(msg, pattern, `${code} message reads correctly`);
  ok(`maps ${code}`);
}

// Unknown codes fall back to a safe generic message (never blank, never a code).
const generic = googleAuthErrorMessage("auth/something-unexpected");
assert.match(generic, /unable to sign in with google/i);
assert.doesNotMatch(generic, /auth\//);
ok("unknown code falls back to a generic message without leaking the code");

// Empty/undefined codes are handled.
assert.ok(googleAuthErrorMessage("").length > 0);
assert.ok(googleAuthErrorMessage(undefined).length > 0);
ok("empty/undefined codes still return a message");

// Redirect fallback selection.
assert.equal(shouldFallbackToRedirect("auth/popup-blocked"), true);
assert.equal(shouldFallbackToRedirect("auth/operation-not-supported-in-environment"), true);
assert.equal(shouldFallbackToRedirect("auth/popup-closed-by-user"), false);
assert.equal(shouldFallbackToRedirect("auth/network-request-failed"), false);
ok("shouldFallbackToRedirect only triggers for popup-capability failures");

console.log(`\nAuth error-mapping tests passed: ${passed} checks.`);

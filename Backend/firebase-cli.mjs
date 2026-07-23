/**
 * Firebase all-in admin CLI.
 *
 *   node Backend/firebase-cli.mjs bootstrap-owner --email=owner@example.com
 *
 * Idempotently grants the `owner` role (Firestore profile + custom claim) to an
 * existing Firebase Auth user. The user must sign up first via the app; this
 * never creates an unauthenticated owner and never sets a password.
 */
import "dotenv/config";
import { grantOwnerByEmail } from "./firestore-users.mjs";
import { isFirebaseConfigured } from "./firebase-admin.mjs";

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const m = raw.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

try {
  if (!isFirebaseConfigured()) {
    console.error("Firebase is not configured. Set FIREBASE_* env vars or add Backend/secrets/<key>.json.");
    process.exitCode = 1;
  } else if (command === "bootstrap-owner") {
    const email = String(args.email || "").trim().toLowerCase();
    if (!email.includes("@")) {
      console.error('Usage: node Backend/firebase-cli.mjs bootstrap-owner --email=owner@example.com');
      process.exitCode = 1;
    } else {
      const { uid, roles } = await grantOwnerByEmail(email);
      console.log(`Owner role ensured for ${email} (uid ${uid}). Roles: ${roles.join(", ")}.`);
      console.log("The user must sign out and back in for the updated role claim to take effect.");
    }
  } else {
    console.error("Unknown command. Available: bootstrap-owner");
    process.exitCode = 1;
  }
} catch (error) {
  // auth/user-not-found etc. — surface the message without secrets.
  console.error("Bootstrap failed:", error?.message || String(error));
  process.exitCode = 1;
}

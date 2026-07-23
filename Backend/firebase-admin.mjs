/**
 * Centralized Firebase Admin initialization for the Alkule trusted backend.
 *
 * SERVER-ONLY. Never import this from client/browser code, and never expose the
 * service-account credential, private key, or ID tokens it handles.
 *
 * Configuration is resolved in this order (first complete source wins):
 *   1. Standardized env vars: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL /
 *      FIREBASE_PRIVATE_KEY (+ FIREBASE_STORAGE_BUCKET). Preferred on Railway.
 *   2. Legacy raw-JSON env var names: project_id / client_email / private_key
 *      (compatibility during migration).
 *   3. A local service-account JSON file under Backend/secrets/*.json
 *      (local development only; the directory is git-ignored).
 *
 * Initialization is lazy and memoized: the app boots and /api/health responds
 * even when Firebase is not configured. Trusted services are only constructed on
 * first use, and a missing/invalid configuration produces a safe error that never
 * includes secret material.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const here = path.dirname(fileURLToPath(import.meta.url));
const SECRETS_DIR = path.join(here, "secrets");

function normalizePrivateKey(key) {
  // Env-stored keys carry literal "\n" sequences; restore real newlines.
  return key ? key.replace(/\\n/g, "\n") : key;
}

/** Resolve credentials without ever returning or logging secret values. */
function resolveConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.project_id || null;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.client_email || null;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || process.env.private_key);
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.storage_bucket || undefined;

  if (projectId && clientEmail && privateKey) {
    return { source: "env", credential: cert({ projectId, clientEmail, privateKey }), projectId, storageBucket };
  }

  // Local-dev fallback: any *.json service account dropped into Backend/secrets/.
  let files = [];
  try {
    files = readdirSync(SECRETS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    files = [];
  }
  if (files.length > 0) {
    const file = path.join(SECRETS_DIR, files[0]);
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      throw new Error("Firebase service-account file in Backend/secrets is not valid JSON.");
    }
    return {
      source: "file",
      credential: cert(file),
      projectId: parsed.project_id || projectId || undefined,
      storageBucket:
        storageBucket || (parsed.project_id ? `${parsed.project_id}.firebasestorage.app` : undefined),
    };
  }

  // Last resort: GOOGLE_APPLICATION_CREDENTIALS / ADC if the platform supplies it.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { source: "adc", credential: applicationDefault(), projectId: projectId || undefined, storageBucket };
  }

  return null;
}

let cachedApp = null;
let cachedConfig = null;

export function isFirebaseConfigured() {
  if (cachedConfig !== null) return Boolean(cachedConfig?.credential);
  try {
    cachedConfig = resolveConfig();
  } catch {
    cachedConfig = null;
  }
  return Boolean(cachedConfig?.credential);
}

/** Returns the initialized Firebase Admin app, creating it once. Throws a safe
 *  (secret-free) error if Firebase is not configured. */
export function getFirebaseApp() {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0];
    return cachedApp;
  }
  const config = cachedConfig ?? (cachedConfig = resolveConfig());
  if (!config || !config.credential) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and " +
        "FIREBASE_PRIVATE_KEY (and FIREBASE_STORAGE_BUCKET), or place a service-account JSON in " +
        "Backend/secrets/ for local development."
    );
  }
  cachedApp = initializeApp({
    credential: config.credential,
    ...(config.projectId ? { projectId: config.projectId } : {}),
    ...(config.storageBucket ? { storageBucket: config.storageBucket } : {}),
  });
  return cachedApp;
}

export function adminAuth() {
  return getAuth(getFirebaseApp());
}

export function firestore() {
  return getFirestore(getFirebaseApp());
}

export function storageBucket() {
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.storage_bucket ||
    (cachedConfig?.storageBucket ?? undefined);
  return getStorage(getFirebaseApp()).bucket(bucketName);
}

export { FieldValue, Timestamp };

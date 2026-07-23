/**
 * Firebase Storage upload pipeline for the trusted backend.
 *
 * All protected uploads go through here: the caller is authenticated and
 * authorized by the route, then this module validates the actual file bytes
 * (magic-byte sniff, not just the client-declared MIME), enforces size limits,
 * generates a SERVER-controlled object path (no client filename, no traversal),
 * uploads via the Admin SDK (which bypasses the deny-by-default storage rules),
 * and hands back a short-lived signed URL for private reads.
 */
import path from "node:path";
import { randomBytes } from "node:crypto";
import { storageBucket } from "./firebase-admin.mjs";

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.publicMessage = message;
  return err;
}

// Extensions that must never be accepted, even if the MIME sniff somehow passed.
const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".dll", ".bat", ".cmd", ".com", ".sh", ".bash", ".ps1", ".msi",
  ".js", ".mjs", ".cjs", ".jar", ".php", ".phtml", ".html", ".htm", ".svg",
  ".xhtml", ".vbs", ".scr", ".app", ".deb", ".rpm",
]);

const IMAGE_TYPES = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

// Upload purposes. `prefix(ctx)` builds a server-controlled path prefix from
// already-validated identifiers. Add course/lesson/etc. purposes here as those
// resources gain ownership models.
const PURPOSES = {
  avatar: { prefix: (ctx) => `users/${ctx.uid}/avatar`, types: IMAGE_TYPES, maxBytes: 2 * 1024 * 1024 },
};

/** Identify an image from its magic bytes. Returns a MIME string or null. Never
 *  trusts the client-declared content type. */
export function sniffImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Validate an uploaded file for a purpose. Returns the canonical extension.
 * Throws httpError(status, message) on any rejection.
 */
export function validateUpload(purpose, file) {
  const spec = PURPOSES[purpose];
  if (!spec) throw httpError(400, "Unknown upload type.");
  if (!file || !file.buffer || file.size === 0) throw httpError(400, "No file was uploaded.");
  if (file.size > spec.maxBytes) {
    throw httpError(413, `File is too large. Maximum ${Math.round(spec.maxBytes / 1024 / 1024)} MB.`);
  }

  const originalExt = path.extname(file.originalname || "").toLowerCase();
  if (BLOCKED_EXTENSIONS.has(originalExt)) throw httpError(400, "This file type is not allowed.");

  // Authoritative content check: sniff the bytes; the declared MIME is advisory.
  const sniffed = sniffImageType(file.buffer);
  if (!sniffed || !spec.types[sniffed]) {
    throw httpError(400, "Unsupported file. Allowed: PNG, JPEG, WebP images.");
  }
  return spec.types[sniffed];
}

function sanitizeSegment(value) {
  // Defense in depth: identifiers going into a path may only be [A-Za-z0-9_-].
  return String(value).replace(/[^A-Za-z0-9_-]/g, "");
}

/** Build a server-controlled object path. The filename is generated, never taken
 *  from the client. Rejects anything that could escape the intended prefix. */
export function buildObjectPath(purpose, ctx, ext) {
  const spec = PURPOSES[purpose];
  if (!spec) throw httpError(400, "Unknown upload type.");

  const safeCtx = Object.fromEntries(Object.entries(ctx).map(([k, v]) => [k, sanitizeSegment(v)]));
  for (const [k, v] of Object.entries(safeCtx)) {
    if (!v) throw httpError(400, `Missing or invalid ${k}.`);
  }

  const prefix = spec.prefix(safeCtx);
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const objectPath = `${prefix}/${filename}`;
  if (objectPath.includes("..") || objectPath.includes("//")) {
    throw httpError(400, "Invalid upload path.");
  }
  return objectPath;
}

export async function uploadObject({ objectPath, buffer, contentType, metadata = {} }) {
  const file = storageBucket().file(objectPath);
  await file.save(buffer, {
    resumable: false,
    contentType,
    metadata: { contentType, metadata },
  });
  return objectPath;
}

/** Short-lived signed URL for reading a private object. */
export async function signedReadUrl(objectPath, ttlMs = 60 * 60 * 1000) {
  const [url] = await storageBucket()
    .file(objectPath)
    .getSignedUrl({ action: "read", expires: Date.now() + ttlMs });
  return url;
}

export async function deleteObject(objectPath) {
  try {
    await storageBucket().file(objectPath).delete();
    return true;
  } catch {
    return false;
  }
}

/** Delete every object under a prefix (used for cleanup / account deletion). */
export async function deletePrefix(prefix) {
  try {
    await storageBucket().deleteFiles({ prefix });
    return true;
  } catch {
    return false;
  }
}

export { httpError, PURPOSES, BLOCKED_EXTENSIONS };

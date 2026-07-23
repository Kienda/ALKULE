/**
 * Offline unit tests for the Storage validation pipeline. No network, no bucket
 * access — these exercise magic-byte sniffing, size/type/extension rules, and
 * server-controlled path generation (including traversal defenses).
 */
import assert from "node:assert/strict";
import { sniffImageType, validateUpload, buildObjectPath } from "./storage.mjs";

let passed = 0;
const ok = (label) => {
  passed += 1;
  console.log("  ok -", label);
};

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 2, 3, 4, 5]);
const NOT_IMAGE = Buffer.from("this is definitely not an image, just text bytes here", "utf8");

// --- sniffImageType ---
assert.equal(sniffImageType(PNG), "image/png");
ok("sniffImageType detects PNG by magic bytes");
assert.equal(sniffImageType(JPEG), "image/jpeg");
ok("sniffImageType detects JPEG by magic bytes");
assert.equal(sniffImageType(NOT_IMAGE), null);
ok("sniffImageType returns null for non-image bytes");

// --- validateUpload ---
assert.equal(validateUpload("avatar", { buffer: PNG, size: PNG.length, originalname: "me.png", mimetype: "image/png" }), ".png");
ok("validateUpload accepts a real PNG and returns .png");

assert.throws(
  () => validateUpload("avatar", { buffer: NOT_IMAGE, size: NOT_IMAGE.length, originalname: "x.png", mimetype: "image/png" }),
  /Unsupported file/,
);
ok("validateUpload rejects a spoofed image/png that is actually text (magic-byte check)");

assert.throws(
  () => validateUpload("avatar", { buffer: PNG, size: 5 * 1024 * 1024, originalname: "big.png", mimetype: "image/png" }),
  (e) => e.status === 413,
);
ok("validateUpload rejects oversized files with 413");

assert.throws(
  () => validateUpload("avatar", { buffer: PNG, size: PNG.length, originalname: "evil.exe", mimetype: "image/png" }),
  /not allowed/,
);
ok("validateUpload rejects blocked extensions (.exe)");

assert.throws(() => validateUpload("nope", { buffer: PNG, size: PNG.length }), /Unknown upload type/);
ok("validateUpload rejects unknown purposes");

assert.throws(() => validateUpload("avatar", { buffer: Buffer.alloc(0), size: 0 }), /No file/);
ok("validateUpload rejects empty uploads");

// --- buildObjectPath ---
const p = buildObjectPath("avatar", { uid: "abc123" }, ".png");
assert.match(p, /^users\/abc123\/avatar\/\d+-[0-9a-f]{16}\.png$/);
ok("buildObjectPath builds a server-controlled path with a generated filename");

const sanitized = buildObjectPath("avatar", { uid: "../../etc/passwd" }, ".png");
assert.doesNotMatch(sanitized, /\.\./);
assert.match(sanitized, /^users\/etcpasswd\/avatar\//);
ok("buildObjectPath strips traversal characters from identifiers");

assert.throws(() => buildObjectPath("avatar", { uid: "/////" }, ".png"), (e) => e.status === 400);
ok("buildObjectPath rejects identifiers that sanitize to empty");

console.log(`\nStorage unit tests passed: ${passed} assertions.`);

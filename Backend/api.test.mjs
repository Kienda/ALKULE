import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import express from "express";
import api from "./api.mjs";
import { prisma } from "./db.mjs";

const execFileAsync = promisify(execFile);

await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "NewsletterSubscriber", "AuditLog" RESTART IDENTITY CASCADE;');

const app = express();
app.use("/api", api);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}/api`;

function cookieOf(response) {
  return response.headers.get("set-cookie").split(";")[0];
}

async function signup(name, email, password) {
  const response = await fetch(`${base}/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  assert.equal(response.status, 201);
  return cookieOf(response);
}

async function login(email, password) {
  const response = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200, `login failed for ${email}: ${await response.text()}`);
  return cookieOf(response);
}

try {
  // ---- Baseline: catalog, signup, session, progress, dashboard, newsletter ----

  let response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);

  response = await fetch(`${base}/courses`);
  assert.equal(response.status, 200);
  assert.ok((await response.json()).length >= 4);

  const learnerEmail = `learner-${Date.now()}@example.com`;
  const learnerCookie = await signup("Test Learner", learnerEmail, "StrongPass123");

  response = await fetch(`${base}/auth/me`, { headers: { cookie: learnerCookie } });
  assert.equal(response.status, 200);
  const learnerMe = await response.json();
  assert.equal(learnerMe.user.email, learnerEmail);
  assert.deepEqual(learnerMe.user.roles, ["learner"]);

  response = await fetch(`${base}/progress/typing`, {
    method: "PUT",
    headers: { cookie: learnerCookie, "content-type": "application/json" },
    body: JSON.stringify({ score: 30, attempts: 4, correct: 3, streak: 2 }),
  });
  assert.equal(response.status, 200);

  response = await fetch(`${base}/dashboard`, { headers: { cookie: learnerCookie } });
  const dashboard = await response.json();
  assert.equal(response.status, 200);
  assert.equal(dashboard.progress.score, 30);

  response = await fetch(`${base}/newsletter`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: `updates-${Date.now()}@example.com` }),
  });
  assert.equal(response.status, 201);

  // ---- Unauthenticated access is rejected ----

  response = await fetch(`${base}/auth/me`);
  assert.equal(response.status, 401);
  response = await fetch(`${base}/owner/users`);
  assert.equal(response.status, 401);

  // ---- A plain learner cannot reach owner/admin routes ----

  response = await fetch(`${base}/owner/users`, { headers: { cookie: learnerCookie } });
  assert.equal(response.status, 403);

  // ---- Owner bootstrap via CLI is idempotent and never reachable over HTTP ----

  const ownerEmail = `owner-${Date.now()}@example.com`;
  const ownerPassword = "Owner-Bootstrap-Pass-1";
  const cliEnv = { ...process.env, OWNER_BOOTSTRAP_PASSWORD: ownerPassword };

  let cli = await execFileAsync(process.execPath, ["Backend/cli.mjs", "bootstrap-owner", `--email=${ownerEmail}`], {
    env: cliEnv,
  });
  assert.match(cli.stdout, /Owner role ensured/);
  assert.match(cli.stdout, /one-time generated password/i);

  cli = await execFileAsync(process.execPath, ["Backend/cli.mjs", "bootstrap-owner", `--email=${ownerEmail}`], {
    env: cliEnv,
  });
  assert.match(cli.stdout, /password was not changed/);

  const ownerUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
  assert.ok(ownerUser, "owner account should exist after bootstrap");

  const ownerCookie = await login(ownerEmail, ownerPassword);
  response = await fetch(`${base}/auth/me`, { headers: { cookie: ownerCookie } });
  const ownerMe = await response.json();
  assert.deepEqual(ownerMe.user.roles, ["owner"]);

  // ---- Owner creates an admin with scoped permissions ----

  const adminEmail = `admin-candidate-${Date.now()}@example.com`;
  await signup("Admin Candidate", adminEmail, "StrongPass123");

  response = await fetch(`${base}/owner/admins`, {
    method: "POST",
    headers: { cookie: ownerCookie, "content-type": "application/json" },
    body: JSON.stringify({ email: adminEmail, permissions: ["manage_users", "view_audit_logs"] }),
  });
  assert.equal(response.status, 201);
  const grantResult = await response.json();
  assert.ok(grantResult.user.roles.includes("admin"));
  assert.ok(grantResult.user.adminPermissions.includes("manage_users"));

  const adminCookie = await login(adminEmail, "StrongPass123");

  response = await fetch(`${base}/owner/users`, { headers: { cookie: adminCookie } });
  assert.equal(response.status, 200, "admin with manage_users should list users");
  const usersList = await response.json();
  assert.ok(usersList.users.some((u) => u.email === ownerEmail));

  response = await fetch(`${base}/owner/audit-logs`, { headers: { cookie: adminCookie } });
  assert.equal(response.status, 200, "admin with view_audit_logs should read the audit log");
  const auditLogs = await response.json();
  assert.ok(auditLogs.auditLogs.some((entry) => entry.action === "owner.bootstrap"));
  assert.ok(auditLogs.auditLogs.some((entry) => entry.action === "admin.granted"));

  // ---- A non-owner (even an admin) cannot grant admin or touch the owner role ----

  response = await fetch(`${base}/owner/admins`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ email: learnerEmail, permissions: [] }),
  });
  assert.equal(response.status, 403);

  response = await fetch(`${base}/owner/users/${ownerUser.id}/status`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ status: "suspended" }),
  });
  assert.equal(response.status, 403, "admin must not be able to change an owner's status");

  response = await fetch(`${base}/owner/admins/${ownerUser.id}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  });
  assert.equal(response.status, 403, "admin must not be able to revoke an owner");

  // ---- The final active owner cannot be suspended, even by an owner ----

  response = await fetch(`${base}/owner/users/${ownerUser.id}/status`, {
    method: "PATCH",
    headers: { cookie: ownerCookie, "content-type": "application/json" },
    body: JSON.stringify({ status: "suspended" }),
  });
  assert.equal(response.status, 409, "the last active owner must be protected from suspension");

  // ---- Reauth endpoint ----

  response = await fetch(`${base}/auth/reauth`, {
    method: "POST",
    headers: { cookie: ownerCookie, "content-type": "application/json" },
    body: JSON.stringify({ password: "wrong-password" }),
  });
  assert.equal(response.status, 401);

  response = await fetch(`${base}/auth/reauth`, {
    method: "POST",
    headers: { cookie: ownerCookie, "content-type": "application/json" },
    body: JSON.stringify({ password: ownerPassword }),
  });
  assert.equal(response.status, 200);

  console.log(
    "API integration tests passed: catalog, signup, session, progress, dashboard, newsletter, owner bootstrap, RBAC, admin permissions, owner protections"
  );
} finally {
  server.close();
  await prisma.$disconnect();
}

import express from "express";
import { courses } from "./catalog.mjs";
import { hashPassword, verifyPassword, issueSession, clearSession } from "./auth.mjs";
import { prisma } from "./db.mjs";
import { attachUser, requireAuth, requireRole, requireOwner, requireAdminPermission, requireRecentAuth, countActiveOwners, toSafeUser, userInclude } from "./rbac.mjs";
import { writeAuditLog } from "./audit.mjs";

const router = express.Router();
router.use(express.json({ limit: "100kb" }));
router.use(attachUser);

router.get("/health", (_req, res) => res.json({ ok: true, service: "alkule-api", time: new Date().toISOString() }));

router.get("/courses", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const level = String(req.query.level || "");
  const format = String(req.query.format || "");
  res.json(
    courses.filter(
      (c) =>
        (!q || `${c.title} ${c.description}`.toLowerCase().includes(q)) &&
        (!level || level === "All" || c.level === level) &&
        (!format || format === "All" || c.format === format)
    )
  );
});

// ---- Authentication ----

router.post("/auth/signup", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (name.length < 2 || !email.includes("@") || password.length < 8) {
    return res.status(400).json({ error: "Enter a name, valid email, and password of at least 8 characters." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "An account with this email already exists." });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      roles: { create: [{ role: "learner" }] },
    },
    include: userInclude,
  });

  issueSession(res, user);
  res.status(201).json({ user: toSafeUser(user) });
});

router.post("/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = await prisma.user.findUnique({ where: { email }, include: userInclude });
  if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  issueSession(res, user);
  res.json({ user: toSafeUser(user) });
});

router.post("/auth/logout", (_req, res) => {
  clearSession(res);
  res.status(204).end();
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/auth/reauth", requireAuth, async (req, res) => {
  const password = String(req.body.password || "");
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Password is incorrect." });
  }
  issueSession(res, { id: user.id, sessionVersion: user.sessionVersion });
  res.json({ ok: true });
});

// ---- Learner dashboard & progress ----

router.get("/dashboard", requireAuth, async (req, res) => {
  const progress = (await prisma.typingProgress.findUnique({ where: { userId: req.user.id } })) || {
    score: 0,
    attempts: 0,
    correct: 0,
    streak: 0,
    updatedAt: null,
  };
  res.json({
    user: req.user,
    progress,
    reviewsDue: Math.min(3, Math.max(0, progress.attempts - progress.correct)),
    nextCourse: courses[0],
  });
});

router.put("/progress/typing", requireAuth, async (req, res) => {
  const clean = {
    score: Math.max(0, Number(req.body.score) || 0),
    attempts: Math.max(0, Number(req.body.attempts) || 0),
    correct: Math.max(0, Number(req.body.correct) || 0),
    streak: Math.max(0, Number(req.body.streak) || 0),
  };
  await prisma.typingProgress.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, ...clean },
    update: clean,
  });
  res.json({ progress: { ...clean, updatedAt: new Date().toISOString() } });
});

router.post("/newsletter", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {},
  });
  res.status(201).json({ message: "You are on the Alkule update list." });
});

// ---- Owner & admin: users, roles, audit ----

router.get("/owner/users", requireAdminPermission("manage_users"), async (req, res) => {
  const users = await prisma.user.findMany({
    include: userInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ users: users.map(toSafeUser) });
});

router.patch("/owner/users/:userId/status", requireAdminPermission("manage_users"), requireRecentAuth, async (req, res) => {
  const { userId } = req.params;
  const status = String(req.body.status || "");
  if (!["active", "suspended", "deactivated"].includes(status)) {
    return res.status(400).json({ error: "Status must be active, suspended, or deactivated." });
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, include: userInclude });
  if (!target) return res.status(404).json({ error: "User not found." });

  const targetIsOwner = target.roles.some((r) => r.role === "owner");
  if (targetIsOwner && !req.user.roles.includes("owner")) {
    return res.status(403).json({ error: "Only an owner can change another owner's status." });
  }
  if (targetIsOwner && status !== "active" && (await countActiveOwners(userId)) === 0) {
    return res.status(409).json({ error: "The final active owner cannot be suspended or deactivated." });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status, sessionVersion: { increment: 1 } },
    include: userInclude,
  });

  await writeAuditLog({
    actorId: req.user.id,
    action: "user.status_changed",
    targetType: "user",
    targetId: userId,
    metadata: { from: target.status, to: status },
  });

  res.json({ user: toSafeUser(updated) });
});

router.post("/owner/admins", requireOwner, requireRecentAuth, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
  const target = await prisma.user.findUnique({ where: { email }, include: userInclude });
  if (!target) return res.status(404).json({ error: "No account with that email exists." });

  await prisma.$transaction(async (tx) => {
    await tx.userRole.upsert({
      where: { userId_role: { userId: target.id, role: "admin" } },
      create: { userId: target.id, role: "admin" },
      update: {},
    });
    for (const permission of permissions) {
      await tx.adminPermission.upsert({
        where: { userId_permission: { userId: target.id, permission } },
        create: { userId: target.id, permission, grantedBy: req.user.id },
        update: { grantedBy: req.user.id },
      });
    }
  });

  await writeAuditLog({
    actorId: req.user.id,
    action: "admin.granted",
    targetType: "user",
    targetId: target.id,
    metadata: { permissions },
  });

  const updated = await prisma.user.findUnique({ where: { id: target.id }, include: userInclude });
  res.status(201).json({ user: toSafeUser(updated) });
});

router.delete("/owner/admins/:userId", requireOwner, requireRecentAuth, async (req, res) => {
  const { userId } = req.params;
  const target = await prisma.user.findUnique({ where: { id: userId }, include: userInclude });
  if (!target) return res.status(404).json({ error: "User not found." });
  if (target.roles.some((r) => r.role === "owner")) {
    return res.status(403).json({ error: "Owner accounts cannot be modified this way." });
  }

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId, role: "admin" } }),
    prisma.adminPermission.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } }),
  ]);

  await writeAuditLog({ actorId: req.user.id, action: "admin.revoked", targetType: "user", targetId: userId });

  const updated = await prisma.user.findUnique({ where: { id: userId }, include: userInclude });
  res.json({ user: toSafeUser(updated) });
});

router.get("/owner/audit-logs", requireAdminPermission("view_audit_logs"), async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { id: true, name: true, email: true } } },
  });
  res.json({ auditLogs: logs });
});

router.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "The server could not complete this request." });
});

export default router;

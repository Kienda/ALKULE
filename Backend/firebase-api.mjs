/**
 * Alkule API — Firebase all-in edition (Firebase Auth + Firestore).
 *
 * This router is the going-forward API. Identity is a verified Firebase ID token
 * (Authorization: Bearer <token>); the application profile and roles live in
 * Firestore. The prior Postgres/Prisma router (Backend/api.mjs) is parked.
 */
import express from "express";
import { courses } from "./catalog.mjs";
import { isFirebaseConfigured, firestore, FieldValue } from "./firebase-admin.mjs";
import { attachProfile, requireAuth, requireRole } from "./firebase-rbac.mjs";
import { getOrCreateProfile, getProfile, updateProfileFields, countActiveOwners } from "./firestore-users.mjs";

const router = express.Router();
router.use(express.json({ limit: "100kb" }));
router.use(attachProfile);

router.get("/health", (_req, res) =>
  res.json({ ok: true, service: "alkule-api", firebase: isFirebaseConfigured(), time: new Date().toISOString() })
);

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

// ---- Authentication: the browser signs in with Firebase, then registers the
//      session here so the backend can create/read the Firestore profile. ----

router.post("/auth/session", requireAuth, async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name : undefined;
  const profile = await getOrCreateProfile(req.firebaseUser, name ? { name } : {});
  res.json({ user: profile });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.profile });
});

router.patch("/auth/profile", requireAuth, async (req, res) => {
  const profile = await updateProfileFields(req.firebaseUser.uid, {
    name: req.body?.name,
    preferredLocale: req.body?.preferredLocale,
  });
  res.json({ user: profile });
});

// ---- Learner dashboard & typing progress (Firestore) ----

function progressDoc(uid) {
  return firestore().collection("typingProgress").doc(uid);
}

router.get("/dashboard", requireAuth, async (req, res) => {
  const snap = await progressDoc(req.firebaseUser.uid).get();
  const progress = snap.exists
    ? snap.data()
    : { score: 0, attempts: 0, correct: 0, streak: 0, updatedAt: null };
  res.json({
    user: req.profile,
    progress: {
      score: progress.score ?? 0,
      attempts: progress.attempts ?? 0,
      correct: progress.correct ?? 0,
      streak: progress.streak ?? 0,
      updatedAt: progress.updatedAt?.toDate?.().toISOString?.() ?? progress.updatedAt ?? null,
    },
    reviewsDue: Math.min(3, Math.max(0, (progress.attempts ?? 0) - (progress.correct ?? 0))),
    nextCourse: courses[0],
  });
});

router.put("/progress/typing", requireAuth, async (req, res) => {
  const clean = {
    score: Math.max(0, Number(req.body.score) || 0),
    attempts: Math.max(0, Number(req.body.attempts) || 0),
    correct: Math.max(0, Number(req.body.correct) || 0),
    streak: Math.max(0, Number(req.body.streak) || 0),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await progressDoc(req.firebaseUser.uid).set(clean, { merge: true });
  res.json({ progress: { ...clean, updatedAt: new Date().toISOString() } });
});

// ---- Newsletter (open) ----

router.post("/newsletter", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  const id = Buffer.from(email).toString("base64url");
  await firestore().collection("newsletter").doc(id).set({ email, createdAt: FieldValue.serverTimestamp() }, { merge: true });
  res.status(201).json({ message: "You are on the Alkule update list." });
});

// ---- Owner/admin: list users (roles enforced server-side) ----

router.get("/owner/users", requireRole("owner", "admin"), async (_req, res) => {
  const snap = await firestore().collection("users").orderBy("createdAt", "desc").limit(200).get();
  const users = snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email ?? null,
      name: data.name ?? null,
      status: data.status ?? "active",
      roles: data.roles ?? ["learner"],
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? null,
    };
  });
  res.json({ users });
});

router.patch("/owner/users/:uid/roles", requireRole("owner"), async (req, res) => {
  const target = req.params.uid;
  const roles = Array.isArray(req.body.roles) ? req.body.roles : null;
  if (!roles) return res.status(400).json({ error: "roles must be an array." });

  const targetProfile = await getProfile(target);
  if (!targetProfile) return res.status(404).json({ error: "User not found." });

  // Owner protection: never strip the final active owner.
  const removingOwner = targetProfile.roles.includes("owner") && !roles.includes("owner");
  if (removingOwner && (await countActiveOwners(target)) === 0) {
    return res.status(409).json({ error: "The final active owner cannot be demoted." });
  }

  await firestore().collection("users").doc(target).update({ roles, updatedAt: FieldValue.serverTimestamp() });
  res.json({ user: await getProfile(target) });
});

router.use((error, _req, res, _next) => {
  console.error("[firebase-api]", error?.message || error);
  res.status(500).json({ error: "The server could not complete this request." });
});

export default router;

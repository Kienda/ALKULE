import { prisma } from "./db.mjs";
import { cookieValue, verifySession, RECENT_AUTH_WINDOW_MS, SESSION_COOKIE } from "./auth.mjs";

const userInclude = { roles: true, adminPermissions: true };

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    preferredLocale: user.preferredLocale,
    timezone: user.timezone,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    roles: user.roles.map((r) => r.role),
    adminPermissions: user.adminPermissions.map((p) => p.permission),
  };
}

export async function resolveSession(req) {
  const token = cookieValue(req.headers.cookie, SESSION_COOKIE);
  const session = token && verifySession(token);
  if (!session) return { session: null, user: null };
  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: userInclude });
  if (!user || user.status !== "active" || user.sessionVersion !== session.sessionVersion) {
    return { session: null, user: null };
  }
  return { session, user };
}

export async function attachUser(req, _res, next) {
  const { session, user } = await resolveSession(req);
  req.session = session;
  req.user = user ? toSafeUser(user) : null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Sign in to continue." });
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Sign in to continue." });
    if (!req.user.roles.some((role) => roles.includes(role))) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

export const requireOwner = requireRole("owner");

export function requireAdminPermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Sign in to continue." });
    if (req.user.roles.includes("owner")) return next();
    const isAdmin = req.user.roles.includes("admin");
    if (isAdmin && req.user.adminPermissions.includes(permission)) return next();
    return res.status(403).json({ error: "You do not have permission to perform this action." });
  };
}

export function requireRecentAuth(req, res, next) {
  if (!req.session || Date.now() - req.session.authTime > RECENT_AUTH_WINDOW_MS) {
    return res.status(401).json({ error: "Please re-enter your password to confirm this action.", code: "REAUTH_REQUIRED" });
  }
  next();
}

export async function countActiveOwners(excludingUserId = null) {
  return prisma.userRole.count({
    where: {
      role: "owner",
      user: { status: "active", ...(excludingUserId ? { id: { not: excludingUserId } } : {}) },
    },
  });
}

export { toSafeUser, userInclude };

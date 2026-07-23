import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const secret = process.env.SESSION_SECRET || "development-only-change-me";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const RECENT_AUTH_WINDOW_MS = 15 * 60 * 1000;
export const SESSION_COOKIE = "alkule_session";

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password, saved) {
  const [salt, hex] = saved.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifySession(token) {
  try {
    const [body, signature] = token.split(".");
    const expected = createHmac("sha256", secret).update(body).digest("base64url");
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function cookieValue(header, name) {
  return header
    ?.split(";")
    .map((x) => x.trim().split("="))
    .find(([key]) => key === name)?.[1] || null;
}

export function issueSession(res, user, { authTime = Date.now() } = {}) {
  const token = signSession({
    userId: user.id,
    sessionVersion: user.sessionVersion,
    authTime,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  return token;
}

export function clearSession(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

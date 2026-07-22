/**
 * Local device profile. This is NOT real authentication — it stores a display
 * name on this device so the progress dashboard has an owner. Swap for real
 * auth (Auth.js + a database, or Supabase) when the backend lands; the shape
 * here ports directly to a server session.
 */

export interface Profile {
  name: string;
  email?: string;
  createdAt: number;
}

const KEY = "alkule.profile.v1";

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage blocked */
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

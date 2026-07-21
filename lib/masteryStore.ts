/**
 * Client-side persistence for SRS mastery records, keyed by letter index.
 * localStorage for now; swap for per-user server storage when auth lands.
 */

import type { MasteryRecord } from "./srs";

const KEY = "alkule.mastery.v1";

export type MasteryMap = Record<number, MasteryRecord>;

export function loadMastery(): MasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveMastery(mastery: MasteryMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(mastery));
  } catch {
    // Storage full or blocked (private mode) — progress just won't persist.
  }
}

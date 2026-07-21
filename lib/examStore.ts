/**
 * Persisted exam results (localStorage), per difficulty tier. Feeds the
 * dashboard. Swap for server storage with auth later.
 */

export type Tier = "beginner" | "intermediate" | "advanced";

export interface ExamStats {
  best: Record<Tier, number>; // best % per tier
  taken: number;
}

const KEY = "alkule.exam.v1";
const EMPTY: ExamStats = {
  best: { beginner: 0, intermediate: 0, advanced: 0 },
  taken: 0,
};

export function loadExam(): ExamStats {
  if (typeof window === "undefined") return { ...EMPTY, best: { ...EMPTY.best } };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, best: { ...EMPTY.best } };
    const p = JSON.parse(raw);
    return { taken: p.taken ?? 0, best: { ...EMPTY.best, ...p.best } };
  } catch {
    return { ...EMPTY, best: { ...EMPTY.best } };
  }
}

export function recordExam(tier: Tier, pct: number): void {
  if (typeof window === "undefined") return;
  const cur = loadExam();
  const next: ExamStats = {
    taken: cur.taken + 1,
    best: { ...cur.best, [tier]: Math.max(cur.best[tier], pct) },
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* blocked */
  }
}

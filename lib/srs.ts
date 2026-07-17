/**
 * Spaced-repetition scheduling — deliberately tiny SM-2-style stub.
 * Each letter carries a mastery record; correct answers grow the review
 * interval, mistakes shrink it. Persist per-user server-side later.
 */

export interface MasteryRecord {
  letterIndex: number;
  /** 0 = new … 5 = mastered. Drives the sidebar mastery rings. */
  level: number;
  /** Next review time (epoch ms). */
  dueAt: number;
  correct: number;
  wrong: number;
}

/** Review intervals per level, in hours. */
const INTERVALS_H = [0, 4, 24, 72, 168, 384]; // now, 4h, 1d, 3d, 7d, 16d

export function newRecord(letterIndex: number): MasteryRecord {
  return { letterIndex, level: 0, dueAt: Date.now(), correct: 0, wrong: 0 };
}

export function applyAnswer(
  rec: MasteryRecord,
  wasCorrect: boolean
): MasteryRecord {
  const level = wasCorrect
    ? Math.min(rec.level + 1, INTERVALS_H.length - 1)
    : Math.max(rec.level - 2, 0);
  return {
    ...rec,
    level,
    dueAt: Date.now() + INTERVALS_H[level] * 3_600_000,
    correct: rec.correct + (wasCorrect ? 1 : 0),
    wrong: rec.wrong + (wasCorrect ? 0 : 1),
  };
}

export function dueRecords(records: MasteryRecord[]): MasteryRecord[] {
  const now = Date.now();
  return records.filter((r) => r.dueAt <= now);
}

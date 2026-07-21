/**
 * Aggregate learner progress from the SRS mastery records + typing stats.
 * Pure function so the dashboard just reads the two localStorage stores.
 */

import { ADLAM_LETTERS, type AdlamLetter } from "@/data/adlam";
import { dueRecords } from "./srs";
import type { MasteryMap } from "./masteryStore";
import type { TypingStats } from "./typingStore";

export interface Progress {
  lettersSeen: number;
  lettersMastered: number;
  totalLetters: number;
  masteryPct: number; // 0–100, average mastery across all letters
  dueCount: number;
  accuracy: number; // combined game + typing, 0–100
  bestScore: number;
  bestWpm: number;
  /** Letters the learner gets wrong most — the "what you did wrong" list. */
  weakest: { letter: AdlamLetter; wrong: number }[];
}

export function computeProgress(
  mastery: MasteryMap,
  typing: TypingStats
): Progress {
  const records = Object.values(mastery);
  const totalLetters = ADLAM_LETTERS.length;
  const lettersSeen = records.length;
  const lettersMastered = records.filter((r) => r.level >= 5).length;

  // Average mastery: each letter contributes level/5; unseen letters count 0.
  const masterySum = records.reduce((s, r) => s + r.level / 5, 0);
  const masteryPct = Math.round((masterySum / totalLetters) * 100);

  const gameCorrect = records.reduce((s, r) => s + r.correct, 0);
  const gameWrong = records.reduce((s, r) => s + r.wrong, 0);
  const totalCorrect = gameCorrect + typing.totalCorrect;
  const totalWrong = gameWrong + typing.totalWrong;
  const totalAttempts = totalCorrect + totalWrong;
  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

  const weakest = records
    .filter((r) => r.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 6)
    .map((r) => ({ letter: ADLAM_LETTERS[r.letterIndex], wrong: r.wrong }));

  return {
    lettersSeen,
    lettersMastered,
    totalLetters,
    masteryPct,
    dueCount: dueRecords(records).length,
    accuracy,
    bestScore: typing.bestScore,
    bestWpm: typing.bestWpm,
    weakest,
  };
}

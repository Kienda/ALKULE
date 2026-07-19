/**
 * Persisted typing-practice stats (localStorage). Feeds the progress
 * dashboard. Swap for server storage alongside auth later.
 */

export interface TypingStats {
  sessions: number;
  bestScore: number;
  bestWpm: number;
  totalCorrect: number;
  totalWrong: number;
}

const KEY = "alkule.typing.v1";

const EMPTY: TypingStats = {
  sessions: 0,
  bestScore: 0,
  bestWpm: 0,
  totalCorrect: 0,
  totalWrong: 0,
};

export function loadTyping(): TypingStats {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function recordTypingSession(s: {
  score: number;
  wpm: number;
  correct: number;
  wrong: number;
}): void {
  if (typeof window === "undefined") return;
  const cur = loadTyping();
  const next: TypingStats = {
    sessions: cur.sessions + 1,
    bestScore: Math.max(cur.bestScore, s.score),
    bestWpm: Math.max(cur.bestWpm, s.wpm),
    totalCorrect: cur.totalCorrect + s.correct,
    totalWrong: cur.totalWrong + s.wrong,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
}

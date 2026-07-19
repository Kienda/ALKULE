"use client";

/**
 * Typing game MVP: glyph recognition.
 * A letter name is shown; the learner taps the matching ADLaM glyph among
 * six options. Correct answers raise that letter's mastery level (SRS);
 * mistakes lower it. This is the free acquisition funnel from the wireframe.
 *
 * Next iterations: physical-keyboard input via an ADLaM layout,
 * sound → glyph rounds (audio), and word-level drills.
 */

import { useEffect, useMemo, useState } from "react";
import { ADLAM_LETTERS, type AdlamLetter } from "@/data/adlam";
import { applyAnswer, newRecord, type MasteryRecord } from "@/lib/srs";
import { loadMastery, saveMastery } from "@/lib/masteryStore";
import { useLocale } from "@/lib/LocaleProvider";

const OPTION_COUNT = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRound(): { target: AdlamLetter; options: AdlamLetter[] } {
  const target =
    ADLAM_LETTERS[Math.floor(Math.random() * ADLAM_LETTERS.length)];
  const distractors = shuffle(
    ADLAM_LETTERS.filter((l) => l.index !== target.index)
  ).slice(0, OPTION_COUNT - 1);
  return { target, options: shuffle([target, ...distractors]) };
}

export default function TypingGame() {
  const { t } = useLocale();
  // Round starts null and is created after mount: makeRound() is random, so
  // running it during SSR would mismatch the client render (hydration error).
  const [round, setRound] = useState<ReturnType<typeof makeRound> | null>(null);

  useEffect(() => {
    setRound(makeRound());
  }, []);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [mastery, setMastery] = useState<Record<number, MasteryRecord>>({});

  // Hydrate from localStorage after mount (SSR renders with empty mastery).
  useEffect(() => {
    setMastery((m) => ({ ...loadMastery(), ...m }));
  }, []);

  useEffect(() => {
    if (Object.keys(mastery).length > 0) saveMastery(mastery);
  }, [mastery]);

  const weakest = useMemo(() => {
    const recs = Object.values(mastery).filter((r) => r.wrong > 0);
    return recs
      .sort((a, b) => a.level - b.level)
      .slice(0, 3)
      .map((r) => ADLAM_LETTERS[r.letterIndex]);
  }, [mastery]);

  function answer(letter: AdlamLetter) {
    if (!round) return;
    const wasCorrect = letter.index === round.target.index;
    setFeedback(wasCorrect ? "correct" : "wrong");
    setScore((s) => s + (wasCorrect ? 10 : 0));
    setStreak((s) => (wasCorrect ? s + 1 : 0));
    setMastery((m) => {
      const rec = m[round.target.index] ?? newRecord(round.target.index);
      return { ...m, [round.target.index]: applyAnswer(rec, wasCorrect) };
    });
    window.setTimeout(() => {
      setFeedback(null);
      setRound(makeRound());
    }, 550);
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10 text-center">
      <div className="mb-6 flex justify-center gap-6 text-sm font-medium text-ink/70">
        <span>
          {t.typing.score}: <strong className="text-ink">{score}</strong>
        </span>
        <span>
          {t.typing.streak}: <strong className="text-ink">🔥 {streak}</strong>
        </span>
      </div>

      <p className="text-sm uppercase tracking-wide text-ink/60">
        {t.typing.prompt}
      </p>
      <p className="mt-2 h-10 font-display text-4xl font-bold text-indigo-brand">
        {round && (
          <>
            {round.target.name}
            <span className="ms-2 text-2xl font-normal text-ink/50">
              ({round.target.roman})
            </span>
          </>
        )}
      </p>

      <div
        className={`mt-8 grid grid-cols-3 gap-3 transition-opacity ${
          feedback === "wrong" ? "animate-pulse" : ""
        }`}
      >
        {(round?.options ?? []).map((letter) => (
          <button
            key={letter.index}
            onClick={() => answer(letter)}
            className="adlam rounded-xl border border-indigo-soft bg-white py-5 text-4xl shadow-sm transition hover:border-indigo-brand hover:shadow focus-visible:border-indigo-brand"
            aria-label={letter.name}
          >
            {letter.capital}
          </button>
        ))}
      </div>

      <p
        className={`mt-6 h-6 text-lg font-semibold ${
          feedback === "correct"
            ? "text-green-600"
            : feedback === "wrong"
              ? "text-red-500"
              : "text-transparent"
        }`}
        aria-live="polite"
      >
        {feedback === "correct" ? "✓" : feedback === "wrong" ? "✗" : "·"}
      </p>

      {weakest.length > 0 && (
        <p className="mt-4 text-sm text-ink/60">
          Practice these:{" "}
          {weakest.map((l) => (
            <span key={l.index} className="adlam mx-1 text-lg text-brass">
              {l.capital}
            </span>
          ))}
        </p>
      )}
    </section>
  );
}

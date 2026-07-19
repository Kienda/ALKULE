"use client";

/**
 * Review mode: the SRS payoff. Pulls due mastery records (dueRecords) and
 * quizzes them in the reverse direction of the typing game — show the glyph,
 * pick the name — so both recall directions get trained. Ends when the due
 * queue is empty.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ADLAM_LETTERS, type AdlamLetter } from "@/data/adlam";
import { applyAnswer, dueRecords, newRecord } from "@/lib/srs";
import { loadMastery, saveMastery, type MasteryMap } from "@/lib/masteryStore";

const OPTION_COUNT = 4;
/** Mastery level colors, 0 (new) → 5 (mastered). */
const LEVEL_CLASSES = [
  "bg-ink/10",
  "bg-red-300",
  "bg-orange-300",
  "bg-yellow-300",
  "bg-lime-300",
  "bg-green-400",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(target: AdlamLetter): AdlamLetter[] {
  const distractors = shuffle(
    ADLAM_LETTERS.filter((l) => l.index !== target.index)
  ).slice(0, OPTION_COUNT - 1);
  return shuffle([target, ...distractors]);
}

export default function ReviewSession() {
  const [mastery, setMastery] = useState<MasteryMap | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const [options, setOptions] = useState<AdlamLetter[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [reviewed, setReviewed] = useState(0);

  // Load persisted mastery and build the due queue once, on mount.
  useEffect(() => {
    const m = loadMastery();
    setMastery(m);
    const due = shuffle(dueRecords(Object.values(m)).map((r) => r.letterIndex));
    setQueue(due);
    if (due.length > 0) setOptions(makeOptions(ADLAM_LETTERS[due[0]]));
  }, []);

  const target = queue.length > 0 ? ADLAM_LETTERS[queue[0]] : null;

  const masteredCount = useMemo(() => {
    if (!mastery) return 0;
    return Object.values(mastery).filter((r) => r.level >= 5).length;
  }, [mastery]);

  function answer(letter: AdlamLetter) {
    if (!target || !mastery || feedback) return;
    const wasCorrect = letter.index === target.index;
    setFeedback(wasCorrect ? "correct" : "wrong");

    const rec = mastery[target.index] ?? newRecord(target.index);
    const nextMastery = { ...mastery, [target.index]: applyAnswer(rec, wasCorrect) };
    setMastery(nextMastery);
    saveMastery(nextMastery);

    window.setTimeout(() => {
      setFeedback(null);
      setReviewed((n) => n + 1);
      setQueue((q) => {
        // Correct: letter leaves the session. Wrong: goes to the back for retry.
        const rest = q.slice(1);
        const nextQueue = wasCorrect ? rest : [...rest, q[0]];
        if (nextQueue.length > 0) {
          setOptions(makeOptions(ADLAM_LETTERS[nextQueue[0]]));
        }
        return nextQueue;
      });
    }, 550);
  }

  if (mastery === null) return null; // avoid SSR/client flash

  return (
    <section dir="rtl" className="mx-auto max-w-xl px-4 py-10 text-center">
      {target ? (
        <>
          <p className="text-sm text-ink/60">
            {queue.length} to review · {reviewed} done
          </p>
          <p className="adlam mt-6 text-8xl text-indigo-brand">
            {target.capital}
          </p>
          <p className="mt-2 text-sm uppercase tracking-wide text-ink/60">
            Which letter is this?
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {options.map((letter) => (
              <button
                key={letter.index}
                onClick={() => answer(letter)}
                className="rounded-xl border border-indigo-soft bg-white py-4 font-display text-lg font-bold text-ink shadow-sm transition hover:border-indigo-brand hover:shadow"
              >
                {letter.name}
                <span className="ms-2 text-sm font-normal text-ink/50">
                  ({letter.roman})
                </span>
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
        </>
      ) : (
        <div className="rounded-2xl border border-indigo-soft bg-white p-8">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink">
            {reviewed > 0 ? "Review complete!" : "Nothing due right now"}
          </h2>
          <p className="mt-2 text-ink/70">
            {reviewed > 0
              ? `You reviewed ${reviewed} letters. Come back when the next batch is due.`
              : "Play the typing game to start learning letters — they'll show up here when it's time to review."}
          </p>
          <Link
            href="/learn/typing"
            className="mt-6 inline-block rounded-full bg-indigo-brand px-6 py-3 font-semibold text-white hover:bg-indigo-deep"
          >
            Go to typing game
          </Link>
        </div>
      )}

      {/* Mastery overview: one cell per letter, colored by SRS level. */}
      <div className="mt-12">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
          Mastery · {masteredCount}/{ADLAM_LETTERS.length} mastered
        </h3>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {ADLAM_LETTERS.map((l) => {
            const level = mastery[l.index]?.level ?? 0;
            return (
              <Link
                key={l.index}
                href={`/alphabet/${l.slug}`}
                title={`${l.name} — level ${level}/5`}
                className={`adlam rounded-lg py-2 text-xl text-ink/80 transition hover:ring-2 hover:ring-indigo-brand ${LEVEL_CLASSES[level]}`}
              >
                {l.capital}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

/**
 * Tiered exam. Beginner = recognize a glyph (multiple choice). Intermediate =
 * unscramble a word (click letters into ADLaM order). Advanced = spell a word
 * from its meaning (click letters from the full alphabet). Scored, saved to the
 * exam store. Questions are built after mount to avoid SSR/client mismatch.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ADLAM_LETTERS, toAdlam, type AdlamLetter } from "@/data/adlam";
import { CODE_TO_LETTER } from "@/data/keyboardLayout";
import { PRACTICE_WORDS } from "@/data/words";
import { recordExam, type Tier } from "@/lib/examStore";
import AdlamKeys from "./AdlamKeys";

const N = 6; // questions per exam

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample<T>(arr: T[], n: number): T[] {
  const s = shuffle(arr);
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(s[i % s.length]);
  return out;
}

type Word = { roman: string; gloss?: string };
type Q =
  | { kind: "recognize"; letter: AdlamLetter; options: string[] }
  | { kind: "scramble"; word: Word; target: string[]; tiles: { id: number; glyph: string }[] }
  | { kind: "spell"; word: Word; target: string };

function buildQuestions(tier: Tier): Q[] {
  if (tier === "beginner") {
    return sample(ADLAM_LETTERS, N).map((letter) => {
      const distractors = shuffle(ADLAM_LETTERS.filter((l) => l.index !== letter.index))
        .slice(0, 3)
        .map((l) => l.name);
      return { kind: "recognize", letter, options: shuffle([letter.name, ...distractors]) };
    });
  }
  const words = sample(PRACTICE_WORDS, N);
  if (tier === "intermediate") {
    return words.map((word) => {
      const target = Array.from(word.roman.toLowerCase()).map((c) => toAdlam(c));
      const tiles = shuffle(target.map((glyph, id) => ({ id, glyph })));
      return { kind: "scramble", word, target, tiles };
    });
  }
  return words.map((word) => ({ kind: "spell", word, target: toAdlam(word.roman) }));
}

export default function ExamSession({ tier }: { tier: Tier }) {
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "err" | null>(null);
  const [done, setDone] = useState(false);
  const [chosen, setChosen] = useState<number[]>([]); // scramble tile ids
  const [built, setBuilt] = useState<string[]>([]); // advanced spelled glyphs
  const [activeCode, setActiveCode] = useState<string | null>(null); // key flash

  useEffect(() => {
    setQuestions(buildQuestions(tier));
  }, [tier]);

  // Physical keyboard for the typing questions (scramble + spell). Position-based
  // via event.code, same mapping as the on-screen keyboard. Backspace deletes,
  // Enter submits. Re-registers on state change to avoid stale closures.
  useEffect(() => {
    if (!questions || done) return;
    const q = questions[idx];
    if (q.kind === "recognize") return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (e.code === "Enter") {
        e.preventDefault();
        submit();
      } else {
        const letter = CODE_TO_LETTER.get(e.code);
        if (!letter) return;
        e.preventDefault();
        setActiveCode(e.code);
        window.setTimeout(() => setActiveCode((a) => (a === e.code ? null : a)), 150);
        typeLetter(letter.index);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, idx, chosen, built, feedback, done]);

  if (!questions) return null;
  const q = questions[idx];
  const pct = Math.round((score / questions.length) * 100);

  // Enter a letter by its alphabet index (from physical key or on-screen keyboard).
  function typeLetter(letterIndex: number) {
    if (feedback) return;
    const cur = questions![idx];
    const glyph = ADLAM_LETTERS[letterIndex].small;
    if (cur.kind === "spell") {
      setBuilt((b) => [...b, glyph]);
    } else if (cur.kind === "scramble") {
      const tile = cur.tiles.find((t) => t.glyph === glyph && !chosen.includes(t.id));
      if (!tile) return; // no matching unused tile — ignore
      const nextChosen = [...chosen, tile.id];
      setChosen(nextChosen);
      if (nextChosen.length === cur.target.length) {
        const ok = nextChosen.every(
          (id, i) => cur.tiles.find((x) => x.id === id)!.glyph === cur.target[i]
        );
        next(ok);
      }
    }
  }

  function backspace() {
    if (feedback) return;
    const cur = questions![idx];
    if (cur.kind === "spell") setBuilt((b) => b.slice(0, -1));
    else if (cur.kind === "scramble") setChosen((c) => c.slice(0, -1));
  }

  function submit() {
    if (feedback) return;
    const cur = questions![idx];
    if (cur.kind === "spell" && built.length > 0) next(built.join("") === cur.target);
  }

  function next(correct: boolean) {
    setFeedback(correct ? "ok" : "err");
    if (correct) setScore((s) => s + 1);
    window.setTimeout(() => {
      setFeedback(null);
      setChosen([]);
      setBuilt([]);
      if (idx + 1 >= questions!.length) {
        setDone(true);
        recordExam(tier, Math.round(((score + (correct ? 1 : 0)) / questions!.length) * 100));
      } else {
        setIdx((i) => i + 1);
      }
    }, 650);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-tertiary">
          {pct >= 70 ? "workspace_premium" : "school"}
        </span>
        <h2 className="mt-3 font-headline-md text-headline-md text-primary">
          {pct}% — {score}/{questions.length}
        </h2>
        <p className="mt-1 text-on-surface-variant capitalize">{tier} exam</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              setQuestions(buildQuestions(tier));
              setIdx(0);
              setScore(0);
              setDone(false);
            }}
            className="rounded-full bg-primary px-6 py-3 font-semibold text-on-primary hover:opacity-90"
          >
            Retake
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary hover:text-on-primary"
          >
            My progress
          </Link>
        </div>
      </div>
    );
  }

  const flashClass =
    feedback === "ok" ? "border-tertiary" : feedback === "err" ? "border-error" : "border-outline-variant";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-label-md text-on-surface-variant">
        <span className="capitalize">{tier}</span>
        <span>
          Question {idx + 1} / {questions.length} · Score {score}
        </span>
      </div>

      <div className={`rounded-2xl border-2 bg-surface-container-lowest p-8 transition-colors ${flashClass}`}>
        {q.kind === "recognize" && (
          <>
            <p className="text-center text-label-md uppercase text-secondary">
              Which letter is this?
            </p>
            <p className="adlam mt-4 text-center text-8xl text-primary">
              {q.letter.capital}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {q.options.map((name) => (
                <button
                  key={name}
                  disabled={!!feedback}
                  onClick={() => next(name === q.letter.name)}
                  className="rounded-xl border border-outline-variant bg-surface py-4 font-semibold text-on-surface transition hover:border-primary"
                >
                  {name}
                </button>
              ))}
            </div>
          </>
        )}

        {q.kind === "scramble" && (
          <>
            <p className="text-center text-label-md uppercase text-secondary">
              Unscramble — &ldquo;{q.word.gloss}&rdquo;
            </p>
            {/* Built answer (RTL) */}
            <div dir="rtl" className="mt-4 flex min-h-[4rem] flex-wrap justify-center gap-1 rounded-xl bg-surface p-3">
              {chosen.map((id) => (
                <span key={id} className="adlam text-4xl text-primary">
                  {q.tiles.find((t) => t.id === id)?.glyph}
                </span>
              ))}
            </div>
            {/* Tiles */}
            <div dir="rtl" className="mt-4 flex flex-wrap justify-center gap-2">
              {q.tiles.map((t) => (
                <button
                  key={t.id}
                  disabled={chosen.includes(t.id) || !!feedback}
                  onClick={() => {
                    const nextChosen = [...chosen, t.id];
                    setChosen(nextChosen);
                    if (nextChosen.length === q.target.length) {
                      const ok = nextChosen.every(
                        (id, i) => q.tiles.find((x) => x.id === id)!.glyph === q.target[i]
                      );
                      next(ok);
                    }
                  }}
                  className="adlam rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-3xl text-on-surface transition enabled:hover:border-primary disabled:opacity-30"
                >
                  {t.glyph}
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setChosen([])}
                disabled={!!feedback}
                className="text-label-md text-primary hover:underline"
              >
                Clear
              </button>
            </div>
            <p className="mt-4 mb-2 text-center text-body-md text-on-surface-variant">
              Click the tiles, or type on your keyboard (⌫ to delete).
            </p>
            <AdlamKeys
              onLetter={typeLetter}
              onBackspace={backspace}
              activeCode={activeCode}
              disabled={!!feedback}
            />
          </>
        )}

        {q.kind === "spell" && (
          <>
            <p className="text-center text-label-md uppercase text-secondary">
              Spell the ADLaM word for
            </p>
            <p className="mt-2 text-center font-headline-md text-headline-md text-on-surface">
              &ldquo;{q.word.gloss}&rdquo;
            </p>
            <div dir="rtl" className="mt-4 flex min-h-[4rem] flex-wrap justify-center gap-1 rounded-xl bg-surface p-3">
              {built.map((g, i) => (
                <span key={i} className="adlam text-4xl text-primary">
                  {g}
                </span>
              ))}
            </div>
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => next(built.join("") === q.target)}
                disabled={built.length === 0 || !!feedback}
                className="rounded-full bg-primary px-6 py-1.5 text-label-md font-semibold text-on-primary hover:opacity-90 disabled:opacity-40"
              >
                Check (or press Enter)
              </button>
            </div>
            <p className="mt-4 mb-2 text-center text-body-md text-on-surface-variant">
              Type on your keyboard or tap below — ⌫ deletes, Enter checks.
            </p>
            <AdlamKeys
              onLetter={typeLetter}
              onBackspace={backspace}
              onEnter={submit}
              activeCode={activeCode}
              disabled={!!feedback}
            />
          </>
        )}
      </div>
    </div>
  );
}

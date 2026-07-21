"use client";

/**
 * Interactive ADLaM typing practice using the official ADLaM Basic layout
 * (position-based). The physical keyboard is linked to the on-screen keyboard
 * (full on desktop, compact on mobile): pressing the correct QWERTY-position
 * key types the ADLaM letter and advances the target. Tracks Score / Accuracy
 * / WPM. Modes: letters, alphabet, words.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADLAM_LETTERS, ROMAN_TO_LETTER } from "@/data/adlam";
import {
  DESKTOP_ROWS,
  MOBILE_ROWS,
  CODE_TO_LETTER,
  LETTER_INDEX_TO_CODE,
  type KeyDef,
} from "@/data/keyboardLayout";
import { PRACTICE_WORDS } from "@/data/words";
import { recordTypingSession } from "@/lib/typingStore";

type Mode = "letters" | "alphabet" | "words";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Word = { roman: string; gloss?: string };

function buildTargets(mode: Mode, wordList: Word[]): Word[] {
  if (mode === "alphabet") {
    return [{ roman: ADLAM_LETTERS.map((l) => l.roman).join("") }];
  }
  if (mode === "words") return shuffle(wordList);
  return ADLAM_LETTERS.map((l) => ({ roman: l.roman }));
}

/**
 * @param words  Optional fixed word list (e.g. one letter's example words).
 *               When given, the practice locks to those words — no mode tabs.
 * @param heading  Optional label shown when a custom word list is used.
 */
export default function TypingPractice({
  words,
  heading,
}: {
  words?: Word[];
  heading?: string;
} = {}) {
  const custom = words && words.length > 0;
  const wordList = custom ? words! : PRACTICE_WORDS;
  const initialMode: Mode = custom ? "words" : "letters";
  const [mode, setMode] = useState<Mode>(initialMode);
  // Initial targets are deterministic (no shuffle) so SSR and the first client
  // render match; words get shuffled after mount in the effect below.
  const [targets, setTargets] = useState<Word[]>(() =>
    initialMode === "words" ? wordList : buildTargets(initialMode, wordList)
  );
  const [tIndex, setTIndex] = useState(0);
  const [pos, setPos] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const [done, setDone] = useState(false);
  const flashTimer = useRef<number | null>(null);

  const target = targets[tIndex];
  const targetChars = useMemo(
    () => (target ? Array.from(target.roman.toLowerCase()) : []),
    [target]
  );
  const nextRoman = targetChars[pos];
  const expected = nextRoman ? ROMAN_TO_LETTER.get(nextRoman) : undefined;
  const expectedCode = expected ? LETTER_INDEX_TO_CODE[expected.index] : null;

  const reset = useCallback(
    (m: Mode) => {
      setTargets(buildTargets(m, wordList));
      setTIndex(0);
    setPos(0);
    setCorrect(0);
    setWrong(0);
    setStartedAt(null);
    setNow(null);
    setDone(false);
    setFlash(null);
    },
    [wordList]
  );

  const flashResult = useCallback((kind: "ok" | "err") => {
    setFlash(kind);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 250);
  }, []);

  // Shuffle the word list once, after mount (avoids an SSR/client mismatch).
  useEffect(() => {
    if (initialMode === "words") setTargets(shuffle(wordList));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A letter was entered (by physical code or on-screen click).
  const enterLetter = useCallback(
    (letterIndex: number) => {
      if (done || !expected) return;
      const t = Date.now();
      if (startedAt === null) setStartedAt(t);
      setNow(t);
      if (letterIndex === expected.index) {
        setCorrect((c) => c + 1);
        flashResult("ok");
        const nextPos = pos + 1;
        if (nextPos >= targetChars.length) {
          if (tIndex + 1 >= targets.length) setDone(true);
          else {
            setTIndex((i) => i + 1);
            setPos(0);
          }
        } else setPos(nextPos);
      } else {
        setWrong((w) => w + 1);
        flashResult("err");
      }
    },
    [done, expected, startedAt, pos, targetChars.length, tIndex, targets.length, flashResult]
  );

  // Physical keyboard, position-based via event.code.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const letter = CODE_TO_LETTER.get(e.code);
      if (letter) {
        e.preventDefault();
        setActiveCode(e.code);
        window.setTimeout(
          () => setActiveCode((a) => (a === e.code ? null : a)),
          150
        );
        enterLetter(letter.index);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterLetter]);

  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const minutes =
    startedAt && now ? Math.max((now - startedAt) / 60000, 1 / 60) : 0;
  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;
  const score = correct * 10;

  // Persist the session's stats once, when it finishes.
  useEffect(() => {
    if (done) recordTypingSession({ score, wpm, correct, wrong });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function onKeyClick(key: KeyDef) {
    if (!key.code) return;
    const letter = CODE_TO_LETTER.get(key.code);
    if (!letter) return;
    setActiveCode(key.code);
    window.setTimeout(
      () => setActiveCode((a) => (a === key.code ? null : a)),
      150
    );
    enterLetter(letter.index);
  }

  function renderKey(key: KeyDef, i: number) {
    const isMod = key.kind === "mod" || key.kind === "space";
    const isActive = key.code && activeCode === key.code;
    const isTarget = key.code && key.code === expectedCode;
    return (
      <button
        key={key.code ?? `${key.label}-${i}`}
        onClick={() => onKeyClick(key)}
        style={{ flexGrow: key.w ?? 1, flexBasis: 0 }}
        className={`flex h-11 min-w-0 flex-col items-center justify-center rounded border text-center transition ${
          isActive
            ? "scale-95 border-primary bg-primary text-on-primary"
            : isTarget
              ? "border-primary bg-primary-container/30 text-primary ring-2 ring-primary"
              : isMod
                ? "border-outline-variant bg-surface-container-high text-on-surface-variant"
                : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-primary-container hover:text-on-primary-container"
        }`}
      >
        {key.glyph ? (
          <>
            <span className="adlam text-lg leading-none">{key.glyph}</span>
            {key.legend && (
              <span className="text-[9px] opacity-50">{key.legend}</span>
            )}
          </>
        ) : (
          <span className="text-[11px] font-medium">{key.label}</span>
        )}
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Mode switch — hidden when drilling a fixed word list. */}
      {custom ? (
        heading && (
          <p className="mb-6 text-center font-headline-md text-lg font-semibold text-primary">
            {heading}
          </p>
        )
      ) : (
        <div className="mb-8 flex justify-center gap-2">
          {(["letters", "alphabet", "words"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                reset(m);
              }}
              className={`rounded-full px-5 py-2 text-label-md font-semibold capitalize transition ${
                mode === m
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant hover:border-primary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-gutter">
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <span className="text-label-md uppercase text-secondary">Words / min</span>
          <span className="font-headline-lg text-headline-lg text-primary">{wpm}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <span className="text-label-md uppercase text-secondary">Accuracy</span>
          <span className="font-headline-lg text-headline-lg text-tertiary">{accuracy}%</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-primary bg-primary-container p-6 text-on-primary">
          <span className="text-label-md uppercase text-primary-fixed">Score</span>
          <span className="font-headline-lg text-headline-lg font-bold">{score}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 md:p-10">
        {done ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-tertiary">emoji_events</span>
            <h2 className="mt-3 font-headline-md text-headline-md text-primary">Session complete</h2>
            <p className="mt-2 text-on-surface-variant">
              Score {score} · {accuracy}% accuracy · {wpm} WPM
            </p>
            <button
              onClick={() => reset(mode)}
              className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:opacity-90"
            >
              <span className="material-symbols-outlined">restart_alt</span>
              Practice again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-2 text-center text-label-md uppercase tracking-wide text-secondary">
              {mode === "words" && target?.gloss
                ? `Type this word — "${target.gloss}"`
                : mode === "alphabet"
                  ? "Type the whole alphabet"
                  : "Type this letter"}
            </div>
            <div
              dir="rtl"
              className={`mb-6 flex flex-wrap justify-center gap-1 rounded-xl border-2 p-6 transition-colors ${
                flash === "ok"
                  ? "border-tertiary"
                  : flash === "err"
                    ? "border-error"
                    : "border-outline-variant"
              }`}
            >
              {targetChars.map((ch, i) => {
                const glyph = ROMAN_TO_LETTER.get(ch)?.small ?? ch;
                const typed = i < pos;
                const current = i === pos;
                return (
                  <span
                    key={i}
                    className={`adlam text-5xl transition-colors ${
                      typed
                        ? "text-tertiary"
                        : current
                          ? "border-b-4 border-primary text-primary"
                          : "text-on-surface-variant/40"
                    }`}
                  >
                    {glyph}
                  </span>
                );
              })}
            </div>

            {expected && (
              <p className="mb-6 text-center text-body-md text-on-surface-variant">
                Press <strong className="text-primary">{expected.name}</strong> —
                the highlighted key below
                <span className="hidden md:inline"> (or its position on your keyboard)</span>.
              </p>
            )}

            {/* Desktop full keyboard */}
            <div className="hidden rounded-2xl border border-outline-variant bg-surface-container-low p-3 md:block">
              {DESKTOP_ROWS.map((row, ri) => (
                <div key={ri} className="mb-1.5 flex gap-1.5 last:mb-0">
                  {row.map(renderKey)}
                </div>
              ))}
            </div>
            {/* Mobile compact keyboard */}
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-2 md:hidden">
              {MOBILE_ROWS.map((row, ri) => (
                <div key={ri} className="mb-1.5 flex gap-1.5 last:mb-0">
                  {row.map(renderKey)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-outline-variant bg-surface-variant p-4">
        <button
          onClick={() => reset(mode)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-medium text-on-primary transition hover:opacity-90"
        >
          <span className="material-symbols-outlined">restart_alt</span>
          Reset
        </button>
        <span className="text-label-md text-on-surface-variant">
          {mode === "alphabet"
            ? `${pos} / ${targetChars.length} letters`
            : `${Math.min(tIndex + 1, targets.length)} / ${targets.length}`}
        </span>
      </div>
    </div>
  );
}

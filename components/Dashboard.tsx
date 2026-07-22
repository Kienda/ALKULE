"use client";

/**
 * Progress dashboard shown after sign-in: a progress bar, key stats, a mastery
 * grid, and the "what you got wrong" review list — all read from the local
 * mastery + typing stores.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/ProfileProvider";
import { loadMastery, type MasteryMap } from "@/lib/masteryStore";
import { loadTyping } from "@/lib/typingStore";
import { loadExam, type ExamStats } from "@/lib/examStore";
import { computeProgress, type Progress } from "@/lib/progress";
import { ADLAM_LETTERS } from "@/data/adlam";

const LEVEL_CLASSES = [
  "bg-surface-container-high",
  "bg-red-300",
  "bg-orange-300",
  "bg-yellow-300",
  "bg-lime-300",
  "bg-green-400",
];

function Stat({ label, value, tone = "text-primary" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-center">
      <p className="text-label-md uppercase text-secondary">{label}</p>
      <p className={`mt-1 font-headline-lg text-headline-lg font-bold ${tone}`}>
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useProfile();
  const [mastery, setMastery] = useState<MasteryMap | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [exam, setExam] = useState<ExamStats | null>(null);

  useEffect(() => {
    const m = loadMastery();
    setMastery(m);
    setProgress(computeProgress(m, loadTyping()));
    setExam(loadExam());
  }, []);

  if (!progress || mastery === null) return null;

  return (
    <div className="mx-auto max-w-4xl px-margin-mobile py-10 md:px-margin-desktop">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label-md uppercase text-secondary">Welcome back</p>
          <h1 className="font-headline-lg text-3xl font-bold text-on-surface">
            {profile?.name ?? "Learner"}
          </h1>
        </div>
        <Link
          href={progress.dueCount > 0 ? "/learn/review" : "/learn/lessons"}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:opacity-90"
        >
          <span className="material-symbols-outlined">play_arrow</span>
          {progress.dueCount > 0
            ? `Review ${progress.dueCount} due`
            : "Continue learning"}
        </Link>
      </div>

      {/* Overall progress bar */}
      <div className="mt-8 rounded-2xl border border-outline-variant bg-surface-container-low p-6">
        <div className="flex items-center justify-between">
          <span className="font-headline-md text-lg font-bold text-on-surface">
            Overall mastery
          </span>
          <span className="font-headline-md text-lg font-bold text-primary">
            {progress.masteryPct}%
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${progress.masteryPct}%` }}
          />
        </div>
        <p className="mt-2 text-label-md text-on-surface-variant">
          {progress.lettersMastered} of {progress.totalLetters} letters mastered
          · {progress.lettersSeen} started
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Accuracy" value={`${progress.accuracy}%`} tone="text-tertiary" />
        <Stat label="Due now" value={progress.dueCount} />
        <Stat label="Best score" value={progress.bestScore} />
        <Stat label="Best WPM" value={progress.bestWpm} />
      </div>

      {/* Exam best scores */}
      {exam && (
        <div className="mt-6">
          <h2 className="mb-3 font-headline-md text-lg font-bold text-on-surface">
            Exam best scores
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {(["beginner", "intermediate", "advanced"] as const).map((t) => (
              <Link
                key={t}
                href="/learn/exam"
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center capitalize"
              >
                <p className="text-label-md text-secondary">{t}</p>
                <p className="mt-1 font-headline-md text-lg font-bold text-primary">
                  {exam.best[t]}%
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mastery grid */}
      <div className="mt-8">
        <h2 className="mb-3 font-headline-md text-lg font-bold text-on-surface">
          Your letters
        </h2>
        <div dir="rtl" className="grid grid-cols-7 gap-2">
          {ADLAM_LETTERS.map((l) => {
            const level = mastery[l.index]?.level ?? 0;
            return (
              <Link
                key={l.index}
                href={`/alphabet/${l.slug}`}
                title={`${l.name} — level ${level}/5`}
                className={`adlam rounded-lg py-2 text-center text-xl text-on-surface/80 transition hover:ring-2 hover:ring-primary ${LEVEL_CLASSES[level]}`}
              >
                {l.capital}
              </Link>
            );
          })}
        </div>
      </div>

      {/* What you got wrong */}
      <div className="mt-8">
        <h2 className="mb-3 font-headline-md text-lg font-bold text-on-surface">
          What to work on
        </h2>
        {progress.weakest.length === 0 ? (
          <p className="rounded-xl border border-outline-variant bg-surface-container-low p-5 text-on-surface-variant">
            No mistakes tracked yet — play the typing game and review to see your
            weak spots here.
          </p>
        ) : (
          <div dir="rtl" className="flex flex-wrap gap-3">
            {progress.weakest.map(({ letter, wrong }) => (
              <Link
                key={letter.index}
                href={`/alphabet/${letter.slug}`}
                dir="ltr"
                className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2"
              >
                <span className="adlam text-2xl text-primary">{letter.capital}</span>
                <span className="text-label-md text-on-surface-variant">
                  {letter.name} · {wrong} missed
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

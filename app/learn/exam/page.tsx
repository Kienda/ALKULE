"use client";

import { useState } from "react";
import LearnTabs from "@/components/LearnTabs";
import ExamSession from "@/components/ExamSession";
import type { Tier } from "@/lib/examStore";

const TIERS: { tier: Tier; title: string; desc: string; icon: string }[] = [
  { tier: "beginner", title: "Beginner", desc: "Recognize a letter from its glyph.", icon: "school" },
  { tier: "intermediate", title: "Intermediate", desc: "Unscramble a word into ADLaM order.", icon: "extension" },
  { tier: "advanced", title: "Advanced", desc: "Spell the ADLaM word from its meaning.", icon: "workspace_premium" },
];

export default function ExamPage() {
  const [tier, setTier] = useState<Tier | null>(null);

  return (
    <div className="px-margin-mobile py-6 md:px-margin-desktop">
      <LearnTabs />
      <h1 className="mt-2 text-center font-headline-lg text-3xl font-bold text-primary">
        Exam
      </h1>

      {tier ? (
        <div className="mt-8">
          <div className="mx-auto mb-6 max-w-2xl">
            <button
              onClick={() => setTier(null)}
              className="text-label-md text-primary hover:underline"
            >
              ← Choose another level
            </button>
          </div>
          <ExamSession tier={tier} />
        </div>
      ) : (
        <>
          <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-on-surface-variant">
            Pick a level. Your best score for each is saved to your dashboard.
          </p>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {TIERS.map((t) => (
              <button
                key={t.tier}
                onClick={() => setTier(t.tier)}
                className="tonal-card flex flex-col items-center rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">{t.icon}</span>
                </span>
                <h2 className="mt-4 font-headline-md text-lg font-bold text-primary">
                  {t.title}
                </h2>
                <p className="mt-2 text-body-md text-on-surface-variant">{t.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

/**
 * Proverb-of-the-day teaser for the homepage. The proverb is chosen by
 * day-of-year so it's stable for a whole day but rotates. Selection happens
 * after mount (not during SSR) because the date differs between the server
 * (UTC) and the client (local time) and would otherwise cause a hydration
 * mismatch — same reason the typing game builds its round in useEffect.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { PROVERBS } from "@/data/proverbs";
import { toAdlam } from "@/data/adlam";

function proverbForToday() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return PROVERBS[day % PROVERBS.length];
}

export default function ProverbOfDay() {
  const [proverb, setProverb] = useState<(typeof PROVERBS)[number] | null>(null);

  useEffect(() => {
    setProverb(proverbForToday());
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-4 pb-16">
      <Link
        href="/culture/proverbs"
        className="block rounded-2xl border border-indigo-soft bg-white p-6 text-center shadow-sm transition hover:border-indigo-brand hover:shadow"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brass">
          Proverb of the day
        </p>
        {/* Reserve height so the card doesn't jump when the proverb mounts. */}
        <div className="mt-4 min-h-[7rem]">
          {proverb && (
            <>
              <p
                dir="rtl"
                lang="ff-Adlm"
                className="adlam text-2xl leading-relaxed text-indigo-brand"
              >
                {toAdlam(proverb.fulfulde)}
              </p>
              <p className="mt-3 text-ink/80">“{proverb.translation}”</p>
              <p className="mt-1 text-sm text-ink/50">{proverb.fulfulde}</p>
            </>
          )}
        </div>
        <p className="mt-4 text-sm font-medium text-indigo-brand">
          More proverbs →
        </p>
      </Link>
    </section>
  );
}

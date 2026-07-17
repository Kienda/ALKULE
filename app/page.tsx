"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleProvider";
import { ADLAM_LETTERS } from "@/data/adlam";

export default function HomePage() {
  const { t } = useLocale();

  return (
    <div>
      {/* Hero: the script itself is the thesis — a wall of living letters. */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p
          className="adlam mx-auto max-w-3xl select-none text-3xl leading-relaxed text-indigo-brand/25"
          aria-hidden="true"
        >
          {ADLAM_LETTERS.map((l) => l.capital).join(" ")}
        </p>
        <h1 className="mt-6 font-display text-4xl font-bold text-ink sm:text-5xl">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">
          {t.hero.subtitle}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/learn/typing"
            className="rounded-full bg-indigo-brand px-6 py-3 font-semibold text-white hover:bg-indigo-deep"
          >
            {t.cta.start}
          </Link>
          <Link
            href="/alphabet"
            className="rounded-full border border-indigo-brand px-6 py-3 font-semibold text-indigo-brand hover:bg-indigo-soft"
          >
            𞤀 → 𞤛
          </Link>
        </div>
      </section>
    </div>
  );
}

import { PROVERBS } from "@/data/proverbs";
import { toAdlam } from "@/data/adlam";

export const metadata = {
  title: "Proverbs & Sayings — Alkule",
  description:
    "Fulɓe proverbs in ADLaM, romanized Fulfulde, and English — the wisdom of the Fulani people.",
};

export default function ProverbsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ink">
        Proverbs &amp; sayings
      </h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        The Fulɓe carry their values in short sayings — about patience, cattle,
        kinship, and the weight of words. Each is shown in ADLaM, in romanized
        Fulfulde, and in English.
      </p>

      <div className="mt-8 space-y-4">
        {PROVERBS.map((p, i) => (
          <figure
            key={i}
            className="rounded-2xl border border-indigo-soft bg-white p-6 shadow-sm"
          >
            <p
              dir="rtl"
              lang="ff-Adlm"
              className="adlam text-3xl leading-relaxed text-indigo-brand"
            >
              {toAdlam(p.fulfulde)}
            </p>
            <p className="mt-3 text-lg font-semibold text-ink">{p.fulfulde}</p>
            <p className="mt-1 text-ink/80">“{p.translation}”</p>
            <figcaption className="mt-2 text-sm text-ink/60">
              {p.meaning}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink/50">
        Fulfulde spellings and translations are provisional teaching aids —
        under review with native speakers. Corrections are welcome.
      </p>
    </div>
  );
}

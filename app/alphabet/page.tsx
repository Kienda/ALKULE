import { ADLAM_LETTERS, ADLAM_DIGITS } from "@/data/adlam";

export const metadata = { title: "ADLaM Alphabet — Alkule" };

export default function AlphabetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ink">
        The ADLaM alphabet
      </h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        28 letters, written right to left. Letter detail pages (stroke order,
        audio, example words) are the next milestone.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {ADLAM_LETTERS.map((l) => (
          <div
            key={l.index}
            className="rounded-xl border border-indigo-soft bg-white p-4 text-center shadow-sm"
          >
            <p className="adlam text-4xl text-indigo-brand">
              {l.capital} {l.small}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">{l.name}</p>
            <p className="text-xs text-ink/60">{l.roman}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-12 font-display text-2xl font-bold text-ink">
        Numerals
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {ADLAM_DIGITS.map((d, i) => (
          <div
            key={i}
            className="w-16 rounded-xl border border-indigo-soft bg-white p-3 text-center"
          >
            <p className="adlam text-3xl text-brass">{d}</p>
            <p className="mt-1 text-xs text-ink/60">{i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

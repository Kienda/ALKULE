import Link from "next/link";
import { notFound } from "next/navigation";
import { ADLAM_LETTERS, letterBySlug, toAdlam } from "@/data/adlam";
import { wordsForRoman } from "@/data/letterWords";
import { syllablesFor } from "@/data/syllables";

export function generateStaticParams() {
  return ADLAM_LETTERS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const letter = letterBySlug(slug);
  if (!letter) return {};
  return {
    title: `${letter.name} ${letter.capital} — ADLaM Alphabet — Alkule`,
    description: `Learn the ADLaM letter ${letter.name} (${letter.roman}): its sound, forms, and an example Fulfulde word.`,
  };
}

export default async function LetterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const letter = letterBySlug(slug);
  if (!letter) notFound();

  const words = wordsForRoman(letter.roman);

  const prev = ADLAM_LETTERS[letter.index - 1];
  const next = ADLAM_LETTERS[letter.index + 1];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="flex items-center justify-between text-sm">
        <Link href="/alphabet" className="text-indigo-brand hover:underline">
          ← All letters
        </Link>
        <div className="flex gap-4">
          {prev && (
            <Link
              href={`/alphabet/${prev.slug}`}
              className="text-ink/70 hover:text-indigo-brand"
            >
              ← {prev.name}
            </Link>
          )}
          {next && (
            <Link
              href={`/alphabet/${next.slug}`}
              className="text-ink/70 hover:text-indigo-brand"
            >
              {next.name} →
            </Link>
          )}
        </div>
      </nav>

      {/* The letter itself, both cases, as large as the screen allows. */}
      <section className="mt-8 rounded-2xl border border-indigo-soft bg-white p-8 text-center shadow-sm">
        <p className="adlam select-all text-8xl leading-none text-indigo-brand sm:text-9xl">
          {letter.capital} {letter.small}
        </p>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">
          {letter.name}
        </h1>
        <p className="mt-1 text-ink/60">
          {letter.index + 1} of {ADLAM_LETTERS.length} ·{" "}
          {letter.isVowel ? "vowel" : "consonant"}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-soft bg-white p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-ink/50">
            Romanization
          </p>
          <p className="mt-2 text-3xl font-bold text-ink">{letter.roman}</p>
        </div>
        <div className="rounded-xl border border-indigo-soft bg-white p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-ink/50">IPA</p>
          <p className="mt-2 text-3xl font-bold text-ink">/{letter.ipa}/</p>
        </div>
        <div className="rounded-xl border border-indigo-soft bg-white p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-ink/50">Sounds like</p>
          <p className="mt-2 text-sm text-ink/80">{letter.sound}</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-indigo-soft bg-white p-6">
        <p className="text-xs uppercase tracking-wide text-ink/50">
          Words that start with {letter.name}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {words.map((w) => (
            <div key={w.roman} dir="ltr">
              <p className="adlam text-3xl text-brass">{toAdlam(w.roman)}</p>
              <p className="mt-1 text-ink">
                <span className="font-semibold">{w.roman}</span>
                <span className="text-ink/60"> — {w.gloss}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Syllables: consonant + each vowel (Ca Ce Ci Co Cu). */}
      {!letter.isVowel && (
        <section className="mt-6 rounded-xl border border-indigo-soft bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-ink/50">
            Syllables with {letter.name}
          </p>
          <div dir="rtl" className="mt-4 flex flex-wrap gap-3">
            {syllablesFor(letter).map((s) => (
              <div
                key={s.roman}
                dir="ltr"
                className="w-20 rounded-lg border border-indigo-soft bg-paper py-2 text-center"
              >
                <span className="adlam text-3xl text-brass">
                  {toAdlam(s.roman)}
                </span>
                <p className="mt-1 text-sm text-ink/70">{s.roman}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/learn/typing?letter=${letter.slug}`}
          className="rounded-full bg-indigo-brand px-6 py-3 font-semibold text-white hover:bg-indigo-deep"
        >
          Practice words with {letter.name}
        </Link>
        {!letter.isVowel && (
          <Link
            href={`/learn/typing?syllables=${letter.slug}`}
            className="rounded-full border border-indigo-brand px-6 py-3 font-semibold text-indigo-brand hover:bg-indigo-soft"
          >
            Practice syllables
          </Link>
        )}
        <Link
          href="/learn/typing"
          className="rounded-full border border-indigo-brand px-6 py-3 font-semibold text-indigo-brand hover:bg-indigo-soft"
        >
          Free typing
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-ink/50">
        Romanization, IPA, and example words are provisional teaching aids —
        under review with native speakers.
      </p>
    </div>
  );
}

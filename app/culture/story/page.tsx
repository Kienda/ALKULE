import Link from "next/link";
import { ADLAM_LETTERS } from "@/data/adlam";

export const metadata = {
  title: "The ADLaM Story — Alkule",
  description:
    "How two teenage brothers in Guinea invented the ADLaM script in 1989 to write Fulfulde — and how it reached Unicode and the world.",
};

// ADLaM is an acronym of its own first four letters: Alif, Daali, Laam, Miim.
const ACRONYM = ADLAM_LETTERS.slice(0, 4);

export default function StoryPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brass">
        The story of the script
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink">
        Two brothers, one alphabet
      </h1>

      {/* The name itself, spelled from its own first four letters. */}
      <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-indigo-soft bg-white py-8">
        {ACRONYM.map((l) => (
          <div key={l.index} className="text-center">
            <p className="adlam text-5xl text-indigo-brand">{l.capital}</p>
            <p className="mt-1 text-xs font-semibold text-ink/60">
              {l.roman.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-ink/60">
        The name <strong>ADLaM</strong> is built from the alphabet&apos;s first
        four letters — A, D, L, M.
      </p>

      <div className="prose-alkule mt-8 space-y-5 text-ink/80">
        <p>
          In 1989, in the town of Nzérékoré in southern Guinea, two Fulani
          brothers — Ibrahima and Abdoulaye Barry, still boys — set out to solve
          a problem that had bothered them for years. Their mother tongue,
          Fulfulde (also called Pular or Pulaar), had no writing system of its
          own. People wrote it in Arabic letters or in the Latin alphabet, but
          neither could capture its sounds — the implosive{" "}
          <span className="adlam text-ink">𞤩</span> (ɓ) and{" "}
          <span className="adlam text-ink">𞤣</span> (ɗ), the glottal{" "}
          <span className="adlam text-ink">𞤴</span> (ƴ) — so readers had to
          guess.
        </p>
        <p>
          So the brothers invented their own. Locked in concentration, they drew
          letters until they had a full alphabet — one shape for every sound in
          the language, written, like Arabic, from right to left. They named it
          after its own first four letters: <strong>ADLaM</strong>, short for{" "}
          <em>Alkule Dandayɗe Leñol Mulugol</em> — roughly, &ldquo;the alphabet
          that protects the peoples from vanishing.&rdquo;
        </p>
        <p>
          At first it spread by hand. The brothers taught it to family, who
          taught it to neighbors; it moved along the same trade and family
          networks that connect Fulani communities across West Africa — Guinea,
          Sierra Leone, Liberia, Nigeria, and beyond. People copied books,
          letters, and lessons by hand because there was no other way.
        </p>
        <p>
          Decades later, ADLaM reached the machines. It was added to the Unicode
          Standard in 2016, which gave it official code points every computer
          could recognise. Type-designers drew digital fonts — the letters on
          this site are set in Noto Sans Adlam — and phones and browsers learned
          to render it. A script that began on paper in a Guinean town is now
          something a child anywhere can type, including in the{" "}
          <Link
            href="/learn/keyboard"
            className="text-indigo-brand hover:underline"
          >
            keyboard on this site
          </Link>
          .
        </p>
        <p>
          That is the point of Alkule: to carry that work forward — to keep the
          alphabet, and the language and culture it was built to protect, alive
          and learnable for anyone, anywhere.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/alphabet"
          className="rounded-full bg-indigo-brand px-6 py-3 font-semibold text-white hover:bg-indigo-deep"
        >
          Explore the 28 letters
        </Link>
        <Link
          href="/culture/proverbs"
          className="rounded-full border border-indigo-brand px-6 py-3 font-semibold text-indigo-brand hover:bg-indigo-soft"
        >
          Read Fulɓe proverbs
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-ink/50">
        Historical summary for learners. For deeper, sourced accounts see the
        Endangered Alphabets project and published interviews with the Barry
        brothers. Details should be verified against those sources.
      </p>
    </article>
  );
}

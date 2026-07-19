import TypingPractice from "@/components/TypingPractice";
import LearnTabs from "@/components/LearnTabs";
import { letterBySlug } from "@/data/adlam";
import { wordsForRoman } from "@/data/letterWords";
import { syllablesFor } from "@/data/syllables";

export const metadata = { title: "Typing Practice — Alkule" };

export default function TypingPage({
  searchParams,
}: {
  searchParams: { letter?: string; syllables?: string };
}) {
  const syllableLetter = searchParams.syllables
    ? letterBySlug(searchParams.syllables)
    : undefined;
  const wordLetter = searchParams.letter
    ? letterBySlug(searchParams.letter)
    : undefined;

  let title = "Typing practice";
  let heading: string | undefined;
  let words: { roman: string; gloss?: string }[] | undefined;

  if (syllableLetter && !syllableLetter.isVowel) {
    words = syllablesFor(syllableLetter).map((s) => ({ roman: s.roman }));
    title = `Syllables: ${syllableLetter.name}`;
    heading = `Syllables with ${syllableLetter.name} — ${syllableLetter.roman}a, ${syllableLetter.roman}e, ${syllableLetter.roman}i, ${syllableLetter.roman}o, ${syllableLetter.roman}u`;
  } else if (wordLetter) {
    const w = wordsForRoman(wordLetter.roman);
    if (w.length > 0) {
      words = w;
      title = `Practice: ${wordLetter.name}`;
      heading = `Words that start with ${wordLetter.name} (${wordLetter.roman})`;
    }
  }

  return (
    <div className="px-margin-mobile py-6 md:px-margin-desktop">
      <LearnTabs />
      <h1 className="mt-2 text-center font-headline-lg text-3xl font-bold text-primary">
        {title}
      </h1>
      <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-on-surface-variant">
        Type on your keyboard — each key lights up on the digital keyboard and
        is checked against the target. Track your score, accuracy, and speed.
      </p>
      <TypingPractice words={words} heading={heading} />
    </div>
  );
}

import LearnTabs from "@/components/LearnTabs";
import Flashcards from "@/components/Flashcards";

export const metadata = { title: "Flashcards — Alkule" };

export default function FlashcardsPage() {
  return (
    <div className="px-margin-mobile py-6 md:px-margin-desktop">
      <LearnTabs />
      <h1 className="mt-2 text-center font-headline-lg text-3xl font-bold text-primary">
        Flashcards
      </h1>
      <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-on-surface-variant">
        Study the letters and words — tap a card to reveal its name and meaning.
      </p>
      <Flashcards />
    </div>
  );
}

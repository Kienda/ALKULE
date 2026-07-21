import AdlamKeyboard from "@/components/AdlamKeyboard";
import LearnTabs from "@/components/LearnTabs";

export const metadata = {
  title: "ADLaM Keyboard — Alkule",
  description:
    "Type ADLaM in your browser: Latin letters map straight to ADLaM glyphs, with on-screen keys for ɓ, ɗ, ƴ, ñ and ŋ.",
};

export default function KeyboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <LearnTabs />
      <h1 className="text-center font-display text-3xl font-bold text-ink">
        ADLaM keyboard
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
        Write ADLaM right now, no install. Every Latin key maps to its ADLaM
        letter — copy the result anywhere.
      </p>
      <div className="mt-8">
        <AdlamKeyboard />
      </div>
    </div>
  );
}

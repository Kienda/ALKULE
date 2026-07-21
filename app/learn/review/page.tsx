import ReviewSession from "@/components/ReviewSession";
import LearnTabs from "@/components/LearnTabs";

export const metadata = { title: "Review — Alkule" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <LearnTabs />
      <h1 className="text-center font-display text-3xl font-bold text-ink">
        Review
      </h1>
      <p className="mx-auto mt-2 max-w-md text-center text-ink/70">
        Spaced repetition: letters come back for review right before you'd
        forget them.
      </p>
      <ReviewSession />
    </div>
  );
}

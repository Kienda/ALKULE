const CATEGORIES = [
  { name: "Typing", desc: "Learn the keyboard, letter by letter." },
  { name: "Art & Culture", desc: "Textiles, music, and Fulani craft." },
  { name: "Podcast", desc: "Listen and learn on the go." },
  { name: "Literature", desc: "Read ADLaM texts, old and new." },
  { name: "History", desc: "The Fulani story across the globe." },
];

export const metadata = { title: "Courses — Alkule" };

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ink">Courses</h1>
      <p className="mt-2 text-ink/70">
        Self-paced with instant exam results, or live at Beginner /
        Intermediate / Advanced levels. Paid certificates are corrected by the
        instructor.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <div
            key={c.name}
            className="rounded-xl border border-indigo-soft bg-white p-5 shadow-sm"
          >
            <h2 className="font-display text-lg font-bold text-indigo-brand">
              {c.name}
            </h2>
            <p className="mt-1 text-sm text-ink/70">{c.desc}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-brass">
              Coming soon
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

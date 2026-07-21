import Link from "next/link";

export const metadata = {
  title: "Culture — Alkule",
  description:
    "The story of the ADLaM script, the Fulɓe people, and their proverbs and sayings.",
};

const CARDS = [
  {
    href: "/culture/story",
    title: "The ADLaM story",
    desc: "How two teenage brothers invented the script in 1989 — and how it reached the world.",
    ready: true,
  },
  {
    href: "/culture/proverbs",
    title: "Proverbs & sayings",
    desc: "Fulɓe wisdom in ADLaM, Fulfulde, and English.",
    ready: true,
  },
  {
    href: "/culture",
    title: "The Fulɓe people",
    desc: "History, the diaspora across West Africa, and pulaaku — the Fulani code of conduct.",
    ready: false,
  },
];

export default function CulturePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-ink">Culture</h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        A script is never just letters. Here is where ADLaM comes from, the
        people who made it, and the words they carry.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) =>
          c.ready ? (
            <Link
              key={c.title}
              href={c.href}
              className="rounded-2xl border border-indigo-soft bg-white p-6 shadow-sm transition hover:border-indigo-brand hover:shadow"
            >
              <h2 className="font-display text-lg font-bold text-indigo-brand">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-ink/70">{c.desc}</p>
            </Link>
          ) : (
            <div
              key={c.title}
              className="rounded-2xl border border-dashed border-indigo-soft bg-white/50 p-6"
            >
              <h2 className="font-display text-lg font-bold text-ink/50">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-ink/50">{c.desc}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-brass">
                Coming soon
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

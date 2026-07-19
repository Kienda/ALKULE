import Link from "next/link";

export const metadata = { title: "Library — Alkule" };

const SECTIONS = [
  {
    icon: "menu_book",
    title: "Books & readers",
    desc: "ADLaM texts and graded readers, from first words to full stories.",
    ready: false,
  },
  {
    icon: "download",
    title: "Fonts & keyboard",
    desc: "Download the Noto Sans Adlam font and set up the ADLaM keyboard on your devices.",
    href: "/learn/keyboard",
    ready: true,
  },
  {
    icon: "podcasts",
    title: "Podcast",
    desc: "Listen and learn on the go — conversations in Fulfulde with translations.",
    ready: false,
  },
  {
    icon: "public",
    title: "Resources",
    desc: "Unicode reference and links to the wider ADLaM ecosystem.",
    href: "/culture",
    ready: true,
  },
];

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-margin-mobile py-10 md:px-margin-desktop">
      <h1 className="font-headline-lg text-3xl font-bold text-on-surface">
        Library
      </h1>
      <p className="mt-2 max-w-2xl text-on-surface-variant">
        Reading material, fonts, media, and reference — everything beyond the
        interactive lessons lives here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) =>
          s.ready && s.href ? (
            <Link
              key={s.title}
              href={s.href}
              className="tonal-card flex gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined">{s.icon}</span>
              </span>
              <div>
                <h2 className="font-headline-md text-lg font-bold text-primary">
                  {s.title}
                </h2>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  {s.desc}
                </p>
              </div>
            </Link>
          ) : (
            <div
              key={s.title}
              className="flex gap-4 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/50 p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant">
                <span className="material-symbols-outlined">{s.icon}</span>
              </span>
              <div>
                <h2 className="font-headline-md text-lg font-bold text-on-surface/60">
                  {s.title}
                </h2>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  {s.desc}
                </p>
                <span className="mt-2 inline-block text-label-md font-semibold uppercase text-brass">
                  Coming soon
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

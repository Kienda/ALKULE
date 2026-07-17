"use client";

import { useLocale } from "@/lib/LocaleProvider";

const RESOURCES = [
  { label: "Tabalde", href: "https://tabalde.com" },
  { label: "Akweeyo", href: "https://www.akweeyo.com" },
  { label: "Ankataa", href: "https://www.ankataa.com/videos" },
  {
    label: "Endangered Alphabets — ADLaM",
    href: "https://www.endangeredalphabets.net/alphabets/adlam/",
  },
];

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-indigo-soft bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-indigo-brand">
            Alkule
          </p>
          <p className="mt-2 text-sm text-ink/70">{t.footer.mission}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{t.footer.resources}</p>
          <ul className="mt-2 space-y-1">
            {RESOURCES.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink/70 hover:text-indigo-brand"
                >
                  {r.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-ink/60">
          <p>© {new Date().getFullYear()} Alkule</p>
          <p className="mt-1">{t.footer.legal}</p>
        </div>
      </div>
    </footer>
  );
}

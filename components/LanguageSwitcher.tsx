"use client";

import { useLocale } from "@/lib/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <label className="flex items-center gap-1 text-sm">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language and script"
        className="min-h-11 max-w-28 rounded-md border border-white/30 bg-indigo-deep px-2 text-sm text-white"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

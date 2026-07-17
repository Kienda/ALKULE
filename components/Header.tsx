"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleProvider";
import { ALKULE_ADLAM } from "@/data/adlam";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useLocale();

  const nav = [
    { href: "/learn/typing", label: t.nav.learn },
    { href: "/courses", label: t.nav.courses },
    { href: "/library", label: t.nav.library },
    { href: "/community", label: t.nav.community },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-soft bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        {/* Brand: Latin wordmark + ADLaM mark, side by side on purpose —
            the logo itself teaches the first ADLaM word a visitor sees. */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-indigo-brand">
            Alkule
          </span>
          <span className="adlam text-lg text-brass" aria-hidden="true">
            {ALKULE_ADLAM}
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink/80 hover:text-indigo-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink/70 hover:text-indigo-brand sm:block"
          >
            {t.cta.login}
          </Link>
          <Link
            href="/learn/typing"
            className="rounded-full bg-indigo-brand px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-deep"
          >
            {t.cta.start}
          </Link>
        </div>
      </div>
    </header>
  );
}

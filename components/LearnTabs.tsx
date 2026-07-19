"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/learn/lessons", label: "Lessons" },
  { href: "/learn/typing", label: "Typing" },
  { href: "/learn/flashcards", label: "Flashcards" },
  { href: "/learn/review", label: "Review" },
  { href: "/learn/exam", label: "Exam" },
  { href: "/learn/keyboard", label: "Keyboard" },
  { href: "/alphabet", label: "Alphabet" },
];

export default function LearnTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex justify-center gap-2 py-4">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            pathname.startsWith(tab.href)
              ? "bg-indigo-brand text-white"
              : "text-ink/70 hover:bg-indigo-soft hover:text-indigo-brand"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

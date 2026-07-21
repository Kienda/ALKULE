"use client";

/**
 * Lesson layout: a curriculum sidebar you can hide and bring back, plus an
 * indigo hero band. On mobile the sidebar opens as a drawer over the content;
 * on desktop it sits inline and can be collapsed to reclaim width.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURRICULUM } from "@/data/curriculum";

// Sidebar shows built lessons only (skip the "soon" placeholders).
const SIDEBAR_LESSONS = CURRICULUM.filter((l) => !l.soon);

export default function LessonShell({
  slug,
  title,
  subtitle,
  children,
}: {
  slug: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const sidebar = (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">school</span>
          <h2 className="font-headline-md text-xl font-bold text-primary">
            Learn ADLaM
          </h2>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Hide curriculum"
          className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav className="space-y-1">
        <Link
          href="/learn/lessons"
          className="mb-2 flex items-center gap-3 rounded-xl px-4 py-2 text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-lg">grid_view</span>
          All modules
        </Link>
        {SIDEBAR_LESSONS.map((lesson) => {
          const href = lesson.externalHref ?? `/learn/lessons/${lesson.slug}`;
          const active =
            !lesson.externalHref && (lesson.slug === slug || pathname === href);
          return (
            <Link
              key={lesson.slug}
              href={href}
              onClick={() => setOpen((o) => o && window.innerWidth >= 768)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-primary-container font-semibold text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {lesson.icon}
              </span>
              <span className="text-body-md">{lesson.navLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex">
      {/* Sidebar: inline column on desktop, drawer on mobile. */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-e border-outline-variant bg-surface-container-low md:sticky md:top-16 md:z-auto md:h-[calc(100vh-4rem)] md:shrink-0">
            {sidebar}
          </aside>
        </>
      )}

      <main className="min-w-0 flex-1 bg-background">
        {/* Toggle bar */}
        <div className="flex items-center gap-2 px-margin-mobile pt-4 md:px-margin-desktop">
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md font-semibold text-primary transition hover:border-primary"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
              Curriculum
            </button>
          )}
        </div>

        {/* Indigo hero band */}
        <div className="relative mt-3 flex h-40 items-end overflow-hidden bg-primary px-margin-mobile pb-6 md:px-margin-desktop">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-container opacity-20" />
          <div className="relative z-10">
            <nav className="mb-2 flex items-center gap-2 text-label-md text-primary-fixed-dim">
              <Link href="/learn/lessons" className="hover:underline">
                Lessons
              </Link>
              <span className="material-symbols-outlined text-xs">
                chevron_right
              </span>
              <span className="text-white">{title}</span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg text-white">
              {title}
            </h1>
            <p className="mt-1 text-body-lg text-primary-fixed-dim">{subtitle}</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-margin-mobile py-8 md:px-margin-desktop">
          {children}
        </div>
      </main>
    </div>
  );
}

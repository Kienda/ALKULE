import Link from "next/link";
import LearnTabs from "@/components/LearnTabs";
import { ADLAM_LETTERS } from "@/data/adlam";
import { FOUNDATIONS, MODULES, type Lesson } from "@/data/curriculum";

export const metadata = {
  title: "Lessons — Alkule",
  description:
    "Learn the ADLaM script module by module: letters, syllables, words, and tones.",
};

function href(lesson: Lesson) {
  return lesson.externalHref ?? `/learn/lessons/${lesson.slug}`;
}

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const num = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-outline-variant text-label-md font-semibold text-on-surface-variant">
      {index}
    </span>
  );

  if (lesson.soon) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-lowest/60 px-4 py-3">
        <div className="flex items-center gap-3 text-on-surface-variant/60">
          {num}
          <span className="font-medium">{lesson.title}</span>
        </div>
        <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-md font-semibold text-on-surface-variant">
          Soon
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-lowest px-4 py-3">
      <div className="flex items-center gap-3">
        {num}
        <span className="font-medium text-on-surface">{lesson.title}</span>
      </div>
      <Link
        href={href(lesson)}
        className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-label-md font-semibold text-on-primary transition hover:opacity-90 active:scale-95"
      >
        <span className="material-symbols-outlined text-base">play_arrow</span>
        Start
      </Link>
    </div>
  );
}

export default function LessonsOverviewPage() {
  return (
    <div className="px-margin-mobile py-6 md:px-margin-desktop">
      <LearnTabs />

      <div className="mx-auto max-w-4xl">
        <h1 className="text-center font-headline-lg text-3xl font-bold text-on-surface">
          ADLaM alphabet lessons
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-on-surface-variant">
          ADLaM has 28 letters — five vowels and the rest consonants — written
          right to left. Follow the modules in order to get the most benefit.
        </p>

        {/* Type-anything banner (nkolearner's "use NkoBoard online"). */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-tertiary-container/40 bg-tertiary-fixed px-6 py-4 sm:flex-row">
          <span className="font-medium text-on-tertiary-fixed">
            Want to type ADLaM right now?
          </span>
          <Link
            href="/learn/keyboard"
            className="rounded-full bg-tertiary-container px-5 py-2 text-label-md font-semibold text-on-tertiary transition hover:opacity-90"
          >
            Open the keyboard
          </Link>
        </div>

        {/* Foundations */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FOUNDATIONS.map((f) => (
            <Link
              key={f.slug}
              href={href(f)}
              className="tonal-card flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined">{f.icon}</span>
              </span>
              <div>
                <h3 className="font-headline-md text-lg font-bold text-primary">
                  {f.title}
                </h3>
                <p className="text-label-md text-on-surface-variant">
                  {f.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Modules */}
        <div className="mt-8 space-y-6">
          {MODULES.map((mod) => (
            <section
              key={mod.n}
              className="overflow-hidden rounded-2xl bg-primary-container p-6 text-on-primary"
            >
              <div className="mb-4">
                <h2 className="font-headline-md text-headline-md font-bold">
                  Module {mod.n} · {mod.title}
                </h2>
                <p className="text-body-md text-on-primary/80">{mod.blurb}</p>
              </div>
              <div className="space-y-2">
                {mod.lessons.map((lesson, i) => (
                  <LessonRow key={lesson.slug} lesson={lesson} index={i + 1} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Alphabet key strip (echoes nkolearner's home key table). */}
        <div className="mt-10">
          <h2 className="mb-3 font-headline-md text-lg font-bold text-on-surface">
            The keyboard key for each letter
          </h2>
          <div className="overflow-x-auto rounded-xl border border-outline-variant">
            <div dir="rtl" className="flex min-w-max">
              {ADLAM_LETTERS.map((l) => (
                <div
                  key={l.index}
                  className="flex w-16 shrink-0 flex-col items-center border-e border-outline-variant bg-surface-container-lowest py-3 last:border-e-0"
                >
                  <span className="adlam text-2xl text-primary">{l.capital}</span>
                  <span className="mt-1 text-label-md text-on-surface-variant">
                    {l.roman} :{" "}
                    <strong className="text-tertiary">
                      {l.roman.toUpperCase()}
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-label-md text-on-surface-variant">
            Press the Latin key to type the ADLaM letter in the{" "}
            <Link href="/learn/typing" className="text-primary hover:underline">
              typing practice
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

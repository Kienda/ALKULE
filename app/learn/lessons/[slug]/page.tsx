import Link from "next/link";
import { notFound } from "next/navigation";
import LessonShell from "@/components/LessonShell";
import {
  ADLAM_VOWELS,
  ADLAM_CONSONANTS,
  ADLAM_DIGITS,
  ADLAM_DIGIT_NAMES,
  ADLAM_LETTERS,
  toAdlam,
  type AdlamLetter,
} from "@/data/adlam";
import { syllablesFor } from "@/data/syllables";
import { LESSON_SLUGS, lessonBySlug } from "@/data/curriculum";

export function generateStaticParams() {
  return LESSON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  return lesson ? { title: `${lesson.title} — Alkule` } : {};
}

/* ---- shared presentational pieces ---- */

function LetterCard({ letter, index }: { letter: AdlamLetter; index: number }) {
  return (
    <Link
      href={`/alphabet/${letter.slug}`}
      dir="ltr"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface p-6 transition hover:border-primary hover:shadow-[0_4px_20px_rgba(36,56,156,0.08)]"
    >
      <span className="text-label-md uppercase tracking-widest text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="adlam my-6 text-center text-[72px] leading-none text-primary transition group-hover:scale-110">
        {letter.capital}
      </span>
      <div className="mt-auto">
        <h3 className="font-headline-md text-xl font-semibold text-on-surface">
          {letter.name}{" "}
          <span className="text-on-surface-variant">({letter.roman})</span>
        </h3>
        <p className="text-body-md text-on-surface-variant">{letter.sound}</p>
      </div>
      <span className="absolute inset-x-0 bottom-0 h-1 origin-right scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
    </Link>
  );
}

function DidYouKnow() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary-container p-8 text-on-primary md:col-span-2 lg:col-span-3">
      <h3 className="mb-3 font-headline-md text-headline-md">Did you know?</h3>
      <p className="mb-6 max-w-2xl text-body-lg text-on-primary/90">
        The ADLaM script was created in the late 1980s by two teenage brothers,
        Ibrahima and Abdoulaye Barry, to give the Fulfulde language a writing
        system of its own.
      </p>
      <Link
        href="/culture/story"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition hover:bg-surface-container"
      >
        <span className="material-symbols-outlined">auto_stories</span>
        Read the story
      </Link>
    </div>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant bg-secondary-container p-6 text-on-secondary-container">
      <span className="material-symbols-outlined mb-3 text-primary">info</span>
      <p className="text-body-md">{children}</p>
    </div>
  );
}

function PracticeWriting({ glyph }: { glyph: string }) {
  return (
    <div className="mt-12 rounded-3xl border border-outline-variant bg-surface-container-low p-8 md:p-12">
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        <div>
          <h2 className="mb-3 font-headline-lg text-headline-lg text-primary">
            Practice
          </h2>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            Ready to write these yourself? Jump into the typing game and the
            live ADLaM keyboard to build muscle memory.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/learn/typing"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:opacity-90"
            >
              Typing game
            </Link>
            <Link
              href="/learn/keyboard"
              className="rounded-full border border-primary px-6 py-3 font-semibold text-primary transition hover:bg-primary hover:text-on-primary"
            >
              Keyboard
            </Link>
          </div>
        </div>
        <div className="flex aspect-square w-full max-w-[16rem] items-center justify-center rounded-2xl border border-outline-variant bg-white">
          <span className="adlam text-[140px] leading-none text-primary/10">
            {glyph}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- per-slug content ---- */

function LettersLesson({ letters }: { letters: AdlamLetter[] }) {
  return (
    <>
      {/* ADLaM reads right-to-left: letters fill from the right. */}
      <div
        dir="rtl"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {letters.map((l, i) => (
          <LetterCard key={l.index} letter={l} index={i} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DidYouKnow />
        <InfoChip>
          Tap any character to open its detail page — sound, forms, and an
          example word.
        </InfoChip>
      </div>
      <PracticeWriting glyph={letters[0].capital} />
    </>
  );
}

function NumeralsLesson() {
  return (
    <>
      <div className="mb-8 rounded-2xl border border-outline-variant bg-secondary-container p-6 text-on-secondary-container">
        <span className="material-symbols-outlined mb-2 text-primary">info</span>
        <p className="text-body-md">
          ADLaM uses the decimal system. The digit shapes are unique, but the
          logic of counting and arithmetic is the same as Western numerals.
        </p>
      </div>
      {/* Digits fill from the right — 0 rightmost — as ADLaM is written. */}
      <div dir="rtl" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {ADLAM_DIGITS.map((d, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-2xl border border-outline-variant bg-surface p-6"
          >
            <span className="adlam text-[64px] leading-none text-primary">
              {d}
            </span>
            <p className="mt-3 font-headline-md text-lg font-semibold text-on-surface">
              {i}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {ADLAM_DIGIT_NAMES[i]}
            </p>
          </div>
        ))}
      </div>
      <PracticeWriting glyph={ADLAM_DIGITS[1]} />
    </>
  );
}

const TONE_MARKS = [
  {
    name: "Base vowel",
    fn: "Normal tone, short duration.",
  },
  {
    name: "Dieresis (¨)",
    fn: "Marks a high-tone pronunciation.",
  },
  {
    name: "Dot above (˙)",
    fn: "Marks a long (doubled) vowel.",
  },
];

function AccentsLesson() {
  return (
    <>
      <p className="max-w-2xl text-body-lg text-on-surface-variant">
        The ADLaM script uses diacritics to mark vowel length, tone, and stress.
        Getting these right matters for correct pronunciation and meaning.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TONE_MARKS.map((m) => (
          <div
            key={m.name}
            className="rounded-2xl border border-outline-variant bg-surface p-6"
          >
            <h3 className="font-headline-md text-lg font-semibold text-primary">
              {m.name}
            </h3>
            <p className="mt-2 text-body-md text-on-surface-variant">{m.fn}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-label-md text-on-surface-variant">
        Diacritic details are a provisional teaching summary — under review with
        native speakers before a full lesson ships.
      </p>
      <PracticeWriting glyph={ADLAM_LETTERS[0].capital} />
    </>
  );
}

function WritingSystemLesson() {
  const acronym = ADLAM_LETTERS.slice(0, 4);
  return (
    <>
      <section className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <div className="space-y-4 md:col-span-7">
          <h2 className="font-headline-lg text-3xl font-bold leading-tight text-primary">
            𞤀𞤁𞤂𞤃: The gift of the{" "}
            <span className="text-tertiary">Barry brothers</span>
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Created in the late 1980s in N&apos;Zérékoré, Guinea, ADLaM was born
            from the vision of Ibrahima and Abdoulaye Barry. Seeing that
            Fulfulde lacked a script tailored to its sounds, the young brothers
            spent years refining these characters.
          </p>
          <div className="rounded-xl border border-outline-variant bg-primary-fixed p-4">
            <p className="text-body-md italic text-on-primary-fixed">
              “Alkule Dandayɗe Leñol Mulugol” — the alphabet that protects the
              people from vanishing.
            </p>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-outline-variant bg-gradient-to-br from-primary to-indigo-deep">
            <span className="adlam text-7xl text-white">
              {acronym.map((l) => l.capital).join("")}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          {
            icon: "format_text_direction_rtl",
            title: "Writing direction",
            body: "ADLaM is written right to left, following the tradition of many regional scripts while introducing its own phonetic structure.",
            glyphs: ADLAM_LETTERS.slice(0, 3).map((l) => l.capital),
            color: "text-primary",
          },
          {
            icon: "font_download",
            title: "Script type",
            body: "It is a true alphabet — every vowel and consonant has its own distinct character, for complete phonetic clarity.",
            glyphs: ADLAM_LETTERS.slice(3, 6).map((l) => l.small),
            color: "text-tertiary",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="group flex flex-col items-center space-y-4 rounded-xl border border-outline-variant bg-surface p-8 text-center transition hover:border-primary"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-primary transition group-hover:scale-110">
              <span className="material-symbols-outlined text-4xl">{c.icon}</span>
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {c.title}
            </h3>
            <p className="text-body-md text-on-surface-variant">{c.body}</p>
            <div className={`adlam flex gap-2 pt-2 text-adlam-display ${c.color}`}>
              {c.glyphs.map((g, i) => (
                <span key={i}>{g}</span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 space-y-8 border-t border-outline-variant pt-8">
        <div className="space-y-2 text-center">
          <h2 className="font-headline-md text-headline-md text-primary">
            Key features &amp; impact
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Modernizing a language for the digital age.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: "school",
              title: "Educational impact",
              body: "Empowering literacy across Guinea and the Fulani diaspora.",
            },
            {
              icon: "auto_stories",
              title: "Cultural preservation",
              body: "Keeping the Fulfulde language alive in the digital era.",
            },
            {
              icon: "groups",
              title: "Unity",
              body: "Connecting millions of Fulɓe speakers through a shared identity.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center space-y-3 text-center"
            >
              <span className="material-symbols-outlined text-3xl text-tertiary">
                {f.icon}
              </span>
              <span className="font-bold text-on-surface">{f.title}</span>
              <p className="text-label-md text-on-surface-variant">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SyllablesLesson() {
  return (
    <>
      <p className="max-w-2xl text-body-lg text-on-surface-variant">
        A consonant joins each vowel to make a syllable. Read each row
        right-to-left: the consonant, then <strong>Ca, Ce, Ci, Co, Cu</strong>.
        These syllables are the building blocks of words.
      </p>

      <div className="mt-8 space-y-3">
        {ADLAM_CONSONANTS.map((c) => (
          <div
            key={c.index}
            dir="rtl"
            className="flex items-center gap-3 overflow-x-auto rounded-xl border border-outline-variant bg-surface p-3"
          >
            <div dir="ltr" className="w-16 shrink-0 text-center">
              <span className="adlam text-3xl text-primary">{c.capital}</span>
              <p className="text-label-md text-on-surface-variant">{c.name}</p>
            </div>
            {syllablesFor(c).map((s) => (
              <div
                key={s.roman}
                dir="ltr"
                className="w-16 shrink-0 rounded-lg border border-outline-variant bg-surface-container-lowest py-2 text-center"
              >
                <span className="adlam text-2xl text-brass">
                  {toAdlam(s.roman)}
                </span>
                <p className="text-label-md text-on-surface-variant">{s.roman}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-label-md text-on-surface-variant">
        Syllable pronunciations are provisional — under review with native
        speakers.
      </p>

      <PracticeWriting glyph={ADLAM_CONSONANTS[0].capital} />
    </>
  );
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  if (!lesson || lesson.externalHref) notFound();

  let content: React.ReactNode;
  switch (slug) {
    case "vowels":
      content = <LettersLesson letters={ADLAM_VOWELS} />;
      break;
    case "consonants":
      content = <LettersLesson letters={ADLAM_CONSONANTS} />;
      break;
    case "numerals":
      content = <NumeralsLesson />;
      break;
    case "accents-tones":
      content = <AccentsLesson />;
      break;
    case "syllables":
      content = <SyllablesLesson />;
      break;
    case "writing-system":
      content = <WritingSystemLesson />;
      break;
    default:
      notFound();
  }

  return (
    <LessonShell slug={lesson.slug} title={lesson.title} subtitle={lesson.subtitle}>
      {content}
    </LessonShell>
  );
}

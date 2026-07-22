/**
 * The "Learn ADLaM" curriculum — one source of truth for the module overview
 * (/learn/lessons), the lesson sidebar, and the /learn/lessons/[slug] routes.
 *
 * Structure mirrors the nkolearner.com module layout the user asked for:
 * Module 1 Letters → Module 2 Monosyllable → Module 3 Multisyllable →
 * Module 4 Accents, each a set of numbered lessons. Lessons that aren't built
 * yet are marked `soon` (they need vetted content the user will supply).
 */

export interface Lesson {
  slug: string;
  title: string;
  /** Sidebar label (shorter). */
  navLabel: string;
  /** Material Symbols icon name for the sidebar. */
  icon: string;
  /** Short subtitle shown in the lesson hero band. */
  subtitle: string;
  /** External/other route instead of a lesson page (e.g. the alphabet grid). */
  externalHref?: string;
  /** Not built yet — shown but not clickable in the overview. */
  soon?: boolean;
}

export interface Module {
  n: number;
  title: string;
  blurb: string;
  lessons: Lesson[];
}

/** Foundations shown above the numbered modules. */
export const FOUNDATIONS: Lesson[] = [
  {
    slug: "writing-system",
    title: "The ADLaM Writing System",
    navLabel: "Writing System",
    icon: "edit_note",
    subtitle: "Where ADLaM comes from and what makes it unique.",
  },
  {
    slug: "alphabet",
    title: "The ADLaM Alphabet",
    navLabel: "Alphabet",
    icon: "font_download",
    subtitle: "All 28 letters, right to left.",
    externalHref: "/alphabet",
  },
];

export const MODULES: Module[] = [
  {
    n: 1,
    title: "Letters",
    blurb: "The building blocks: the 28 letters and the 10 numerals.",
    lessons: [
      {
        slug: "vowels",
        title: "ADLaM Vowels",
        navLabel: "Vowels",
        icon: "record_voice_over",
        subtitle: "The five vowels and the sounds they carry.",
      },
      {
        slug: "consonants",
        title: "ADLaM Consonants",
        navLabel: "Consonants",
        icon: "translate",
        subtitle: "The consonants, including ɓ, ɗ, ƴ, ñ and ŋ.",
      },
      {
        slug: "numerals",
        title: "ADLaM Numerals",
        navLabel: "Numerals",
        icon: "pin",
        subtitle: "Counting 0–9 in the ADLaM script.",
      },
      {
        slug: "letters-review",
        title: "Module review",
        navLabel: "Review",
        icon: "quiz",
        subtitle: "Review the letters you've learned.",
        externalHref: "/learn/review",
      },
    ],
  },
  {
    n: 2,
    title: "Syllables",
    blurb: "Join each consonant to the five vowels to form syllables.",
    lessons: [
      {
        slug: "syllables",
        title: "Consonant + vowel",
        navLabel: "Syllables",
        icon: "abc",
        subtitle: "Every consonant × the five vowels — da, de, di, do, du.",
      },
      {
        slug: "syllable-words",
        title: "Words from syllables",
        navLabel: "Syllable words",
        icon: "spellcheck",
        subtitle: "",
        externalHref: "/learn/typing",
        soon: true,
      },
    ],
  },
  {
    n: 3,
    title: "Multisyllable",
    blurb: "Put syllables together into whole words.",
    lessons: [
      { slug: "practice-1", title: "Word practice 1", navLabel: "Practice 1", icon: "keyboard", subtitle: "", externalHref: "/learn/typing", soon: true },
      { slug: "practice-2", title: "Word practice 2", navLabel: "Practice 2", icon: "keyboard", subtitle: "", externalHref: "/learn/typing", soon: true },
      { slug: "practice-3", title: "Word practice 3", navLabel: "Practice 3", icon: "keyboard", subtitle: "", externalHref: "/learn/typing", soon: true },
    ],
  },
  {
    n: 4,
    title: "Accents & Tones",
    blurb: "Diacritics that mark vowel length, tone, and stress.",
    lessons: [
      {
        slug: "accents-tones",
        title: "ADLaM Accents & Tones",
        navLabel: "Accents & Tones",
        icon: "history_edu",
        subtitle: "Diacritics for vowel length, tone, and stress.",
      },
      {
        slug: "accents-review",
        title: "Module review",
        navLabel: "Review",
        icon: "quiz",
        subtitle: "",
        externalHref: "/learn/review",
      },
    ],
  },
];

/** Flat list of every lesson (foundations + modules) for the sidebar. */
export const CURRICULUM: Lesson[] = [
  ...FOUNDATIONS,
  ...MODULES.flatMap((m) => m.lessons),
];

export function lessonBySlug(slug: string): Lesson | undefined {
  return CURRICULUM.find((l) => l.slug === slug);
}

/** Lessons that render as a real page here (not an external link, not soon). */
export const LESSON_SLUGS = CURRICULUM.filter(
  (l) => !l.externalHref && !l.soon
).map((l) => l.slug);

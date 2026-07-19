"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleProvider";
import { ADLAM_LETTERS } from "@/data/adlam";
import ProverbOfDay from "@/components/ProverbOfDay";
import Newsletter from "@/components/Newsletter";

// ADLaM acronym — Alif, Daali, Laam, Miim.
const ACRONYM = ADLAM_LETTERS.slice(0, 4).map((l) => l.capital).join("");

const FEATURES = [
  {
    href: "/learn/lessons",
    icon: "menu_book",
    title: "Learn the script",
    desc: "Master the 28 characters and their sounds through interactive games, spaced-repetition review, and a live keyboard.",
    cta: "Start tutorials",
    tone: "primary",
    bar: "w-1/3",
  },
  {
    href: "/culture",
    icon: "palette",
    title: "Art & culture",
    desc: "Discover the roots and artistic expression of the Fulɓe people across West Africa and beyond.",
    cta: "View gallery",
    tone: "tertiary",
    bar: "w-1/2",
  },
  {
    href: "/library",
    icon: "language",
    title: "Digital resources",
    desc: "Fonts, keyboard layouts, and a growing library of ADLaM literature in digital formats.",
    cta: "Explore assets",
    tone: "secondary",
    bar: "w-3/4",
  },
] as const;

const TONE: Record<string, { icon: string; title: string; btn: string }> = {
  primary: {
    icon: "bg-primary/10 text-primary",
    title: "text-primary",
    btn: "border-primary text-primary hover:bg-primary hover:text-on-primary",
  },
  tertiary: {
    icon: "bg-tertiary/10 text-tertiary",
    title: "text-tertiary",
    btn: "border-tertiary text-tertiary hover:bg-tertiary hover:text-on-tertiary",
  },
  secondary: {
    icon: "bg-secondary/10 text-secondary",
    title: "text-secondary",
    btn: "border-secondary text-secondary hover:bg-secondary hover:text-on-secondary",
  },
};

export default function HomePage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-max-width pb-8">
      {/* Hero: welcome panel (wide) + scholar/culture card. */}
      <section className="mt-8 grid grid-cols-1 items-stretch gap-8 px-margin-mobile lg:grid-cols-12 md:px-margin-desktop">
        {/* Welcome panel */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-[2rem] bg-primary p-8 text-on-primary shadow-xl md:p-12 lg:col-span-7">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-container opacity-10" />
          <h1 className="mb-6 font-headline-lg text-headline-lg leading-tight">
            {t.hero.title}
          </h1>
          <p className="mb-8 max-w-xl text-body-lg text-on-primary/90">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/learn/typing"
              className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-8 py-3 font-bold text-primary transition hover:bg-secondary-container active:scale-95"
            >
              {t.cta.start}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              href="/library"
              className="rounded-full border-2 border-on-primary/30 px-8 py-3 font-bold text-on-primary transition hover:border-on-primary active:scale-95"
            >
              Explore books
            </Link>
          </div>
        </div>

        {/* Scholar / culture card */}
        <Link
          href="/culture/story"
          className="tonal-card group flex flex-col items-center justify-center rounded-[2rem] bg-surface-container-high p-8 text-center lg:col-span-5"
        >
          <div className="relative mb-6">
            {/* Honest placeholder — no hotlinked AI portrait. Big acronym mark. */}
            <div className="flex h-64 w-48 items-center justify-center overflow-hidden rounded-xl border-4 border-surface-container-lowest bg-gradient-to-br from-primary to-indigo-deep shadow-lg md:h-72 md:w-56">
              <span className="adlam text-6xl text-on-primary/90">{ACRONYM}</span>
            </div>
            <span className="absolute -bottom-4 -left-4 rounded-lg bg-tertiary px-4 py-2 text-label-md font-semibold text-on-tertiary shadow-md">
              Pioneers
            </span>
          </div>
          <h2 className="mb-1 font-headline-md text-headline-md text-primary">
            Barry brothers
          </h2>
          <p className="mb-6 text-label-md text-secondary">
            Inventors of the ADLaM script
          </p>
          <div className="w-full rounded-xl bg-primary-container/20 px-6 py-4">
            <span className="adlam mb-2 block text-adlam-display text-primary">
              {ACRONYM}
            </span>
            <p className="text-label-md italic text-on-surface-variant">
              “The light that guides the people”
            </p>
          </div>
        </Link>
      </section>

      {/* Feature grid. */}
      <section className="mt-12 px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => {
            const tone = TONE[f.tone];
            return (
              <Link
                key={f.href}
                href={f.href}
                className="tonal-card flex flex-col items-center rounded-3xl bg-surface-container-low p-8 text-center"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${tone.icon}`}
                >
                  <span className="material-symbols-outlined text-4xl">
                    {f.icon}
                  </span>
                </div>
                <h3 className={`mb-3 font-headline-md text-headline-md ${tone.title}`}>
                  {f.title}
                </h3>
                <p className="mb-6 text-body-md text-on-surface-variant">
                  {f.desc}
                </p>
                <span
                  className={`mt-auto rounded-full border px-6 py-2 text-label-md font-bold transition ${tone.btn}`}
                >
                  {f.cta}
                </span>
                <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-outline-variant">
                  <div className={`h-full rounded-full bg-tertiary ${f.bar}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-12">
        <ProverbOfDay />
      </div>
      <Newsletter />
    </div>
  );
}

# Alkule — project guide

Alkule ( 𞤀𞤤𞤳𞤵𞤤𞤫 , "the letters of the alphabet") is a web app for learning the
**ADLaM script**, the Fulfulde (Fulani/Pulaar) writing system invented in 1989
by Ibrahima & Abdoulaye Barry. It teaches reading, writing, typing, and the
culture behind the script.

## Team
- **Abubakar** (owner) — backend + system/features.
- **Contributor (friend)** — frontend, colours, styling, feature polish.

If you're the frontend contributor: the visual system is Material-3 "Indigo
Professional Educational" (see Design System below). Restyle freely, but keep
the two hard rules under **Conventions**.

## Stack
- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**.
- No backend yet — all state is client-side (`localStorage`). Auth + database
  are the next milestone (see Roadmap).
- Fonts: **Hanken Grotesk** (UI), **Noto Sans Adlam** (ADLaM glyphs), Material
  Symbols (icons) — loaded in `app/layout.tsx`.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit   # typecheck
```
Do NOT run `npm run build` while `npm run dev` is running — it clobbers `.next`
and the dev server starts throwing MODULE_NOT_FOUND. Stop dev first.

## Conventions (do not break)
1. **ADLaM is right-to-left.** Any grid/row of ADLaM letters or digits must
   flow RTL — put `dir="rtl"` on the container so items fill from the right
   (0 rightmost). Keep English text inside cards `dir="ltr"` so it stays
   readable. This holds regardless of UI language.
2. **ADLaM glyphs use Noto Sans Adlam only** (the `.adlam` class). Never render
   ADLaM in Hanken Grotesk — it can't draw the glyphs (the Stitch export got
   this wrong; every screenshot shows empty boxes because of it).
- Use logical Tailwind utilities (`ms-`/`me-`, `ps-`/`pe-`, `border-e`) so RTL
  mirrors for free — never `ml-`/`mr-`.
- Provisional linguistic content (romanizations, IPA, example words, proverbs,
  numeral names, tone marks) must carry a "verify with native speakers" note.

## Design system
Material 3 tokens live in `tailwind.config.ts`. Primary indigo `#24389c`
(`primary`), container `#3f51b5` (`primary-container`), amber accent `#854d00`
(`tertiary-container`), surfaces `#f9f9fc`. The old semantic names
(`indigo-brand`, `ink`, `paper`, `brass`) are remapped onto M3 values, so both
sets work. Radius `xl`=0.75rem. Spacing tokens: `base`, `gutter`,
`margin-desktop`, `max-width`.

## Directory map
```
app/
  page.tsx              Home (marketing; hero, feature cards, proverb, newsletter)
  layout.tsx            Root: fonts, LocaleProvider, ProfileProvider, Header/Footer
  alphabet/page.tsx     28-letter grid (RTL) + numerals
  alphabet/[slug]/      Per-letter detail (glyph, IPA, sound, example word)
  learn/
    lessons/page.tsx    Module overview (Module 1 Letters … Module 4 Accents)
    lessons/[slug]/     Lesson pages: vowels, consonants, numerals,
                        accents-tones, writing-system (data-driven)
    typing/page.tsx     Typing practice (TypingPractice)
    review/page.tsx     SRS review session (RTL)
    keyboard/page.tsx   ADLaM writer (AdlamKeyboard)
  culture/              Landing + story + proverbs (people/history = TODO)
  library/page.tsx      Books / fonts / podcast / resources overview (stubs)
  courses/page.tsx      redirect → /learn/lessons (old catch-all, retired)
  login/page.tsx        Create local profile (no password — device only)
  dashboard/page.tsx    Progress dashboard (needs a profile)
components/
  Header, Footer, LanguageSwitcher
  TypingPractice        Interactive typing (physical + on-screen keyboard)
  AdlamKeyboard         The writer keyboard (desktop full / mobile compact)
  ReviewSession         SRS review UI
  LessonShell           Lesson layout: collapsible sidebar + indigo hero band
  LearnTabs             Sub-nav: Lessons/Typing/Review/Keyboard/Alphabet
  Dashboard             Progress bar, stats, mastery grid, "what to work on"
  ProverbOfDay, Newsletter
  TypingGame            OLD glyph-recognition game — no longer routed (kept for ref)
data/
  adlam.ts              28 letters from Unicode U+1E900+, digits, transliterator
                        toAdlam(), ROMAN_TO_LETTER, vowels/consonants splits
  keyboardLayout.ts     ADLaM keyboard: phonetic English-QWERTY mapping
                        (KEY_TO_ROMAN), desktop + mobile rows
  curriculum.ts         Modules → lessons (source for overview + sidebar + routes)
  proverbs.ts           Fulɓe proverbs (provisional)
  words.ts              Placeholder practice words (to be replaced with vetted)
lib/
  i18n.ts, LocaleProvider   5-locale client i18n (en, fr, ar, ff-Latn, ff-Adlm)
  srs.ts                    SM-2-lite spaced repetition
  masteryStore.ts           Mastery persistence (localStorage)
  typingStore.ts            Typing stats persistence
  profile.ts, ProfileProvider  Local device profile (swap for real auth later)
  progress.ts               Aggregate progress for the dashboard
design/                 Downloaded Stitch reference screens (HTML + PNG)
```

## The ADLaM keyboard
`data/keyboardLayout.ts` maps each **physical QWERTY key** to the ADLaM letter
of its **English** equivalent (q→Qaaf, r→Ra, e→E …). The five ADLaM letters
with no English match — ɓ ɗ ƴ ñ ŋ — sit on the leftover keys z x v ; ,.
Physical input is matched on `event.code` (position), so it works on any OS
layout. If a key's glyph is wrong, edit `KEY_TO_ROMAN` — one line.

## What works today
Alphabet + per-letter pages · module lessons (vowels/consonants/numerals/
accents/writing-system) · typing practice (score/accuracy/WPM, physical +
on-screen keyboard, letters/alphabet/words modes) · SRS review · ADLaM writer
keyboard (all keys: shift/caps/enter/tab/space/backspace) · culture story +
proverbs · local profile + progress dashboard · 5-locale RTL-ready i18n.

## Roadmap
1. **Backend**: auth + database (candidates: Supabase [auth+Postgres, fastest
   for a 2-person team] or Postgres + Prisma + Auth.js). Move mastery/typing/
   profile server-side. See `lib/profile.ts` + stores for the seam.
2. Per-letter practice + example words (see memory `per-letter-words`).
3. Audio + stroke-order/tracing on lesson pages (needs recorded files/SVGs).
4. Course player, instructor tools, PWA/offline.

## Provisional content — needs native-speaker review
Romanizations & IPA (`data/adlam.ts`), example words, proverbs
(`data/proverbs.ts`), numeral names & tone marks, all Fulfulde UI strings
(`lib/i18n.ts`). Flagged on-page where shown.
